# agent/views.py
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter
from .models import CustomAgent
from .serializers import CustomAgentSerializer
from .permissions import IsProjectOwner


@extend_schema_view(
    list=extend_schema(
        summary="Список агентов",
        parameters=[
            OpenApiParameter(
                name='project',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='ID проекта (фильтр)',
                required=False,
            ),
        ],
        responses={200: CustomAgentSerializer(many=True)},
    ),
    create=extend_schema(summary="Создать агента", request=CustomAgentSerializer, responses={201: CustomAgentSerializer}),
    retrieve=extend_schema(summary="Получить агента"),
    update=extend_schema(summary="Обновить агента"),
    partial_update=extend_schema(summary="Частично обновить агента"),
    destroy=extend_schema(summary="Удалить агента", responses={204: OpenApiResponse(description="Успешно удалено")})
)
class CustomAgentViewSet(viewsets.ModelViewSet):
    serializer_class = CustomAgentSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created']
    ordering = ['-created']

    def get_queryset(self):
        # Показываем только агентов проектов, где пользователь владелец
        return CustomAgent.objects.filter(project__user=self.request.user).select_related('project')
