from django.db import models


class CustomAgent(models.Model):
    project = models.ForeignKey('project.Project', on_delete=models.CASCADE, related_name='agents',
                                verbose_name="Проект")
    name = models.CharField(max_length=50, verbose_name="Название агента")
    description = models.TextField(verbose_name="Описание агента")
    skill = models.TextField(verbose_name="Системный промпт")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']
        verbose_name = "Агент"
        verbose_name_plural = "Агенты"

    def __str__(self):
        return f"{self.project.title} - {self.name}"
