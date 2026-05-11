from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, filters, permissions
from django.shortcuts import get_object_or_404

from .models import Chat, Message
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
    responses={204: OpenApiResponse(description="Чат удалён"), 403: OpenApiResponse(description="Нет прав"), 404: OpenApiResponse(description="Чат не найден")}
)
class ChatDeleteView(generics.DestroyAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Chat.objects.none()
        return Chat.objects.filter(project__user=self.request.user)
