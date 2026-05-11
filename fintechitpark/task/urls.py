from django.urls import path
from .views import (
    TaskListCreateView,
    TaskBulkCreateView,
    TaskDetailView
)

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list'),
    path('create/', TaskBulkCreateView.as_view(), name='task-create'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail')
]
