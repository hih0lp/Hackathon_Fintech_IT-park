from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomAgentViewSet

router = DefaultRouter()
router.register('', CustomAgentViewSet, basename='custom-agent')

urlpatterns = [
    path('', include(router.urls)),
]