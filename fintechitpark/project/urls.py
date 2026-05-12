from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectRetrieveUpdateDestroyView,
    ProjectMultipleFileUploadView,
    ProjectFileDeleteView,
)

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list-create'),
    path('<int:pk>/', ProjectRetrieveUpdateDestroyView.as_view(), name='project-detail'),
    path('<int:project_id>/upload/', ProjectMultipleFileUploadView.as_view(), name='project-file-upload'),
    path('files/<int:file_id>/', ProjectFileDeleteView.as_view(), name='project-file-delete'),
]
