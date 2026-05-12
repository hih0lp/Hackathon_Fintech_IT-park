# agent/permissions.py
from rest_framework import permissions


class IsProjectOwner(permissions.BasePermission):
    """Разрешение только владельцу проекта"""
    def has_object_permission(self, request, view, obj):
        return obj.project.user == request.user

    def has_permission(self, request, view):
        if view.action == 'create':
            # при создании проверим по переданному project_id
            project_id = request.data.get('project')
            if project_id:
                from project.models import Project
                try:
                    project = Project.objects.get(id=project_id)
                    return project.user == request.user
                except Project.DoesNotExist:
                    return False
            return False
        return True