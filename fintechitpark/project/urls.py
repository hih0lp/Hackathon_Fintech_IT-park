from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectRetrieveUpdateDestroyView,
    ProjectFileUploadView,
    ProjectFileDeleteView,
)

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list-create'),
    path('<int:pk>/', ProjectRetrieveUpdateDestroyView.as_view(), name='project-detail'),
    path('<int:project_id>/upload/', ProjectFileUploadView.as_view(), name='project-file-upload'),
    path('files/<int:file_id>/', ProjectFileDeleteView.as_view(), name='project-file-delete'),
]
