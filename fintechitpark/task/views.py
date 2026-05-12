from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task
from .serializers import TaskSerializer, TaskBulkCreateSerializer, DuplicateToYouGileSerializer
from project.yougile_service import create_yougile_task, YouGileAPIError


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
class TaskListCreateView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['chat__id']

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
                active=True
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


class DuplicateTasksToYouGileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Продублировать задачи в YouGile",
        description="Для переданных ID локальных задач создаются копии в YouGile в колонке, привязанной к проекту.",
        request=DuplicateToYouGileSerializer,
        responses={
            200: TaskSerializer(many=True),
            400: OpenApiResponse(description="Ошибка валидации или синхронизации"),
            403: OpenApiResponse(description="Нет доступа к задачам")
        }
    )
    def post(self, request):
        serializer = DuplicateToYouGileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task_ids = serializer.validated_data['task_ids']

        # Проверяем наличие YouGile API-ключа у пользователя
        api_key = getattr(request.user.profile, 'yougile_api_key', None)
        if not api_key:
            return Response(
                {"detail": "YouGile API ключ не настроен. Сначала выполните авторизацию в YouGile."},
                status=status.HTTP_400_BAD_REQUEST
            )

        tasks = Task.objects.filter(id__in=task_ids, chat__project__user=request.user)
        if len(tasks) != len(task_ids):
            return Response(
                {"detail": "Некоторые задачи не найдены или недоступны."},
                status=status.HTTP_400_BAD_REQUEST
            )

        first_task = tasks.first()
        column_id = first_task.chat.project.yougile_column_id
        if not column_id:
            return Response(
                {"detail": "Проект не синхронизирован с YouGile. Сначала создайте проект в YouGile."},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated_tasks = []
        for task in tasks:
            if task.tracker_task_id:
                continue
            try:
                tracker_task_id = create_yougile_task(api_key, column_id, task.title, task.chat.name)
                task.tracker_task_id = tracker_task_id
                task.save()
                updated_tasks.append(task)
            except YouGileAPIError as e:
                return Response(
                    {"detail": f"Ошибка при создании задачи '{task.title}': {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        result_serializer = TaskSerializer(updated_tasks, many=True)
        return Response(result_serializer.data, status=status.HTTP_200_OK)
