from django.contrib.auth.models import User
from django.db import models


class Project(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='projects',
        verbose_name="Владелец проекта"
    )
    title = models.CharField(max_length=50, verbose_name="Название проекта")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Проект"
        verbose_name_plural = "Проекты"

    def __str__(self):
        return self.title


class ProjectFile(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files', verbose_name="Проект")
    file = models.FileField(upload_to='project_files/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Файл проекта"
        verbose_name_plural = "Файлы проектов"

    def __str__(self):
        return f"{self.file.name} - {self.project.title}"
