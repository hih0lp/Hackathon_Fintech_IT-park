from django.urls import path
from .views import (
    TaskListCreateView,
    TaskBulkCreateView,
    TaskDetailView, DuplicateTasksToYouGileView
)

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list'),
    path('create/', TaskBulkCreateView.as_view(), name='task-create'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('duplicate-to-yougile/', DuplicateTasksToYouGileView.as_view(), name='duplicate-tasks-yougile'),
]
