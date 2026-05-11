from django.db import models


class Task(models.Model):
    chat = models.ForeignKey('chat.Chat', on_delete=models.CASCADE, related_name="chat_tasks", verbose_name='Чат')
    title = models.CharField(max_length=255, verbose_name='Название задачи')
    active = models.BooleanField(verbose_name="В работе")
    tracker_task_id = models.TextField(verbose_name="ID в трекере", blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']
        verbose_name = "Задача"
        verbose_name_plural = "Задачи"

    def __str__(self):
        return self.title

