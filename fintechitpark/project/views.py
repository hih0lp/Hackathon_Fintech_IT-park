from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Project, ProjectFile
from .serializers import ProjectSerializer, ProjectFileSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


@extend_schema_view(
    get=extend_schema(
        summary="Список проектов пользователя",
        responses={200: ProjectSerializer(many=True)}
    ),
    post=extend_schema(
        summary="Создать проект",
        description="Создаёт новый проект. Можно загрузить несколько файлов, передав их в поле `uploaded_files`.",
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'title': {'type': 'string'},
                    'description': {'type': 'string'},
                    'country': {'type': 'string'},
                    'uploaded_files': {
                        'type': 'array',
                        'items': {'type': 'string', 'format': 'binary'},
                        'description': 'Список файлов (можно выбрать несколько)'
                    }
                },
                'required': ['title', 'description', 'country']
            }
        },
        responses={201: ProjectSerializer, 400: OpenApiResponse(description="Ошибка валидации")}
    )
)
class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['title', 'country']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Project.objects.none()
        return Project.objects.filter(user=self.request.user).prefetch_related('files').annotate(
            chats_count=Count('chats')).order_by('-created')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema_view(
    get=extend_schema(
        summary="Детали проекта",
        description="Возвращает информацию о конкретном проекте вместе с файлами",
        responses={200: ProjectSerializer, 404: OpenApiResponse(description="Проект не найден")}
    ),
    put=extend_schema(
        summary="Полное обновление проекта",
        description="Обновляет все поля проекта (только владелец)",
        request=ProjectSerializer,
        responses={200: ProjectSerializer, 400: OpenApiResponse(description="Ошибка валидации"),
                   403: OpenApiResponse(description="Нет прав")}
    ),
    patch=extend_schema(
        summary="Частичное обновление проекта",
        description="Обновляет выбранные поля проекта (только владелец)",
        request=ProjectSerializer,
        responses={200: ProjectSerializer, 400: OpenApiResponse(description="Ошибка валидации"),
                   403: OpenApiResponse(description="Нет прав")}
    ),
    delete=extend_schema(
        summary="Удалить проект",
        description="Удаляет проект и все связанные файлы (только владелец)",
        responses={204: OpenApiResponse(description="Успешно удалено"), 403: OpenApiResponse(description="Нет прав"),
                   404: OpenApiResponse(description="Не найден")}
    )
)
class ProjectRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]


class ProjectFileDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Удалить файл из проекта",
        description="Удаляет конкретный файл. Пользователь должен быть владельцем проекта, к которому привязан файл.",
        responses={204: OpenApiResponse(description="Файл удалён"), 403: OpenApiResponse(description="Нет прав"),
                   404: OpenApiResponse(description="Файл не найден")},
        parameters=[
            OpenApiParameter(name='file_id', description='ID файла', required=True, type=int, location='path')
        ]
    )
    def delete(self, request, file_id):
        file_obj = get_object_or_404(ProjectFile, id=file_id, project__user=request.user)
        file_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectMultipleFileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Загрузить несколько файлов в проект",
        description="Принимает список файлов в поле `files` (multipart/form-data, массив)",
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'files': {'type': 'array', 'items': {'type': 'string', 'format': 'binary'}}
                }
            }
        },
        responses={
            201: ProjectFileSerializer(many=True),
            400: OpenApiResponse(description="Ошибка валидации")
        }
    )
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id, user=request.user)
        files = request.FILES.getlist('files')
        if not files:
            return Response({'error': 'Не переданы файлы'}, status=status.HTTP_400_BAD_REQUEST)

        created_files = []
        for file_obj in files:
            file_serializer = ProjectFileSerializer(data={'file': file_obj}, context={'request': request})
            if file_serializer.is_valid():
                saved = file_serializer.save(project=project)
                created_files.append(file_serializer.data)
            else:
                return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(created_files, status=status.HTTP_201_CREATED)
