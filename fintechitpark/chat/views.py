from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, filters, permissions
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from .llm_service import call_llm
from .models import Chat, Message, LLMRequest
from .serializers import ChatSerializer, MessageSerializer


@extend_schema_view(
    get=extend_schema(
        summary="Список чатов пользователя",
        description=(
                "Возвращает все чаты, доступные текущему пользователю (чаты проектов, "
                "где он является владельцем). Можно фильтровать по `project` и искать по `name`."
        ),
        parameters=[
            OpenApiParameter(name='project', description="ID проекта", required=False, type=int),
            OpenApiParameter(name='search', description="Поиск по названию чата", required=False, type=str),
        ],
        responses={200: ChatSerializer(many=True)}
    ),
    post=extend_schema(
        summary="Создать чат",
        description="Создаёт новый чат в указанном проекте. Требуется ID проекта через поле `project_id`.",
        request=ChatSerializer,
        responses={201: ChatSerializer, 400: OpenApiResponse(description="Ошибка валидации")}
    )
)
class ChatListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project']
    search_fields = ['name']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Chat.objects.none()
        return Chat.objects.filter(project__user=self.request.user)

    def perform_create(self, serializer):
        project = serializer.validated_data['project']
        if project.user != self.request.user:
            raise PermissionError("Вы не владелец этого проекта")
        serializer.save()


@extend_schema_view(
    get=extend_schema(
        summary="Сообщения чата",
        description="Возвращает все сообщения чата (и от пользователя, и от нейросети).",
        responses={200: MessageSerializer(many=True), 403: OpenApiResponse(description="Нет доступа к чату")},
        parameters=[
            OpenApiParameter(name='chat_id', description="ID чата", required=True, type=int, location='path'),
        ]
    )
)
class ChatMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Message.objects.none()
        return Message.objects.filter(chat_id=self.kwargs['chat_id'], chat__project__user=self.request.user)


@extend_schema(
    summary="Удалить чат",
    description="Удаляет чат и все его сообщения (каскадно). Только владелец проекта.",
    responses={204: OpenApiResponse(description="Чат удалён"), 403: OpenApiResponse(description="Нет прав"),
               404: OpenApiResponse(description="Чат не найден")}
)
class ChatDeleteView(generics.DestroyAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Chat.objects.none()
        return Chat.objects.filter(project__user=self.request.user)


class AskLLMView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Отправить сообщение нейросети",
        description=(
            "Принимает сообщение пользователя (поле `msg`). Контекст (история чата и данные проекта) "
            "формируется автоматически. Возвращает `request_id` для последующего опроса статуса."
        ),
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string', 'description': 'Текст сообщения пользователя'}
                },
                'required': ['msg']
            }
        },
        responses={
            202: OpenApiResponse(
                description="Задача поставлена в очередь",
                response={
                    'type': 'object',
                    'properties': {
                        'request_id': {'type': 'integer'},
                        'status': {'type': 'string', 'enum': ['pending']}
                    }
                }
            ),
            400: OpenApiResponse(description="Отсутствует поле msg"),
            403: OpenApiResponse(description="Нет доступа к чату"),
            404: OpenApiResponse(description="Чат не найден")
        },
        parameters=[
            OpenApiParameter(name='chat_id', description='ID чата', required=True, type=int, location='path')
        ]
    )
    def post(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id, project__user=request.user)
        user_msg = request.data.get('msg')
        if not user_msg:
            return Response({'error': 'msg required'}, status=400)

        # Подготовка контекста
        messages_history = chat.messages.order_by('created_at').values('sender', 'text')
        context_text = "История диалога:\n"
        for m in messages_history:
            context_text += f"{m['sender']}: {m['text']}\n"
        context_text += f"\nИнформация о проекте:\n"
        context_text += f"Название: {chat.project.title}\nОписание: {chat.project.description}\nСтрана: {chat.project.country}"

        llm_req = LLMRequest.objects.create(
            chat=chat,
            user_message=user_msg,
            context_text=context_text,
            status='pending'
        )
        custom_agents = chat.project.agents.all()

        task = call_llm.send(llm_req.id, chat.id, user_msg, context_text, custom_agents)
        llm_req.save()

        return Response({
            'request_id': llm_req.id,
            'status': 'pending'
        }, status=202)


class LLMRequestStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Статус обработки сообщения",
        description="Возвращает текущий статус запроса к нейросети. Если завершён — возвращает ответ бота и сгенерированные задачи.",
        responses={
            200: OpenApiResponse(
                description="Успешный ответ (статус может быть completed, pending, processing или failed)",
                response={
                    'type': 'object',
                    'properties': {
                        'status': {'type': 'string', 'enum': ['pending', 'processing', 'completed', 'failed']},
                        'request_id': {'type': 'integer'},
                        'result_text': {'type': 'string', 'nullable': True},
                        'tasks': {'type': 'array', 'items': {'type': 'object'}, 'nullable': True},
                        'error': {'type': 'string', 'nullable': True}
                    }
                }
            ),
            403: OpenApiResponse(description="Нет доступа"),
            404: OpenApiResponse(description="Запрос или чат не найден")
        },
        parameters=[
            OpenApiParameter(name='chat_id', description='ID чата', required=True, type=int, location='path'),
            OpenApiParameter(name='request_id', description='ID запроса (получен при отправке)', required=True, type=int, location='path')
        ]
    )
    def get(self, request, chat_id, request_id):
        llm_req = get_object_or_404(LLMRequest, id=request_id, chat__project__user=request.user)
        response_data = {
            'status': llm_req.status,
            'request_id': llm_req.id,
        }
        if llm_req.status == 'completed':
            response_data['result_text'] = llm_req.result_text
            response_data['tasks'] = llm_req.tasks_data
        elif llm_req.status == 'failed':
            response_data['error'] = llm_req.error_message
        return Response(response_data)
