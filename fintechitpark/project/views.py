from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter
from rest_framework import generics, permissions, status
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
        description="Возвращает все проекты, созданные текущим пользователем",
        responses={200: ProjectSerializer(many=True)}
    ),
    post=extend_schema(
        summary="Создать проект",
        description="Создаёт новый проект",
        request=ProjectSerializer,
        responses={201: ProjectSerializer, 400: OpenApiResponse(description="Ошибка валидации")}
    )
)
class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).prefetch_related('files')

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


class ProjectFileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {'type': 'string', 'format': 'binary'}
                }
            }
        },
        responses={201: ProjectFileSerializer}
    )
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id, user=request.user)
        file_serializer = ProjectFileSerializer(data=request.data, context={'request': request})
        if file_serializer.is_valid():
            file_serializer.save(project=project)
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
