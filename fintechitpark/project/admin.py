from django.contrib import admin
from .models import Project, ProjectFile


class ProjectFileInline(admin.TabularInline):
    """Позволяет редактировать файлы прямо на странице проекта"""
    model = ProjectFile
    extra = 1  # количество пустых форм для новых файлов
    fields = ('file', 'uploaded_at')
    readonly_fields = ('uploaded_at',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'country', 'created')
    list_filter = ('created', 'user')
    search_fields = ('title', 'user__email', 'user__username')
    readonly_fields = ('created',)
    inlines = [ProjectFileInline]


@admin.register(ProjectFile)
class ProjectFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'file', 'uploaded_at')
    list_filter = ('uploaded_at', 'project')
    search_fields = ('project__title', 'file')
    readonly_fields = ('uploaded_at',)

