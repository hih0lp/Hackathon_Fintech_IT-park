from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Task
from .serializers import TaskSerializer, TaskBulkCreateSerializer


@extend_schema_view(
    get=extend_schema(
        summary="Список задач",
        description="Возвращает все задачи пользователя (через чаты). Можно фильтровать по chat_id.",
        parameters=[
            OpenApiParameter(name='chat', description='ID чата', required=False, type=int),
        ],
        responses={200: TaskSerializer(many=True)}
    )
)
class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['chat']

    def get_queryset(self):
        return Task.objects.filter(chat__project__user=self.request.user)


class TaskBulkCreateView(generics.CreateAPIView):
    serializer_class = TaskBulkCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Создать несколько задач",
        description="Принимает `chat_id` и список `titles`. Для каждого заголовка создаётся задача с `is_closed=False`.",
        request=TaskBulkCreateSerializer,
        responses={
            201: TaskSerializer(many=True),
            400: OpenApiResponse(description="Ошибка валидации")
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        chat = serializer.validated_data['chat_id']
        titles = serializer.validated_data['titles']

        created_tasks = []
        for title in titles:
            task = Task.objects.create(
                chat=chat,
                title=title,
                available=False
            )
            created_tasks.append(task)

        result_serializer = TaskSerializer(created_tasks, many=True)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(chat__project__user=self.request.user)

    @extend_schema(
        summary="Обновить задачу",
        description="Обновление информации о задаче",
        request=TaskSerializer,
        responses={200: TaskSerializer, 400: "Ошибка валидации", 403: "Нет прав", 404: "Не найдено"}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)
