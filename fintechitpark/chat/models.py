from django.contrib.auth.models import User
from django.db import models


class Chat(models.Model):
    project = models.ForeignKey('project.Project', on_delete=models.CASCADE, related_name='chats')
    name = models.CharField(max_length=50)
    available = models.BooleanField(default=True, verbose_name="Открытый чат")
    created = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='versions',
        verbose_name="Предыдущая версия чата"
    )
    version_number = models.PositiveSmallIntegerField(default=1, editable=False)

    class Meta:
        ordering = ['-created']
        verbose_name = "Чат"
        verbose_name_plural = "Чаты"

    def __str__(self):
        return f"{self.project.title} - {self.name} (v{self.version_number})"

    def get_full_context(self):
        """
        Возвращает текст истории всех сообщений текущего чата и всех его предков
        для передачи в LLM.
        """
        messages = []
        current = self
        # Собираем сообщения всех чатов снизу вверх (от самого старого предка до текущего)
        lineage = []
        while current:
            lineage.append(current)
            current = current.parent
        lineage.reverse()  # от самого старого к новому

        for chat in lineage:
            chat_messages = chat.messages.order_by('created_at').values('sender', 'text')
            for msg in chat_messages:
                messages.append(f"{msg['sender']}: {msg['text']}")
        return "\n".join(messages) if messages else "История диалога пуста."

    def save(self, *args, **kwargs):
        # Автоматически вычисляем номер версии
        if not self.pk and self.parent:
            # Создаётся новая версия – номер = номер родителя + 1
            self.version_number = self.parent.version_number + 1
        elif not self.pk:
            self.version_number = 1
        super().save(*args, **kwargs)


class Message(models.Model):
    SENDER_CHOICES = [('user', 'Пользователь'), ('bot', 'Нейросеть')]
    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name="Чат"
    )
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES, default='user')
    text = models.TextField(verbose_name="Текст сообщения")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Сообщение"
        verbose_name_plural = "Сообщения"
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class LLMRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает'),
        ('processing', 'В процессе'),
        ('completed', 'Завершён'),
        ('failed', 'Ошибка'),
    ]
    chat = models.ForeignKey('Chat', on_delete=models.CASCADE, related_name='llm_requests')
    user_message = models.TextField()
    context_text = models.TextField(blank=True)      # история + контекст проекта
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    celery_task_id = models.CharField(max_length=255, blank=True, null=True)
    result_text = models.TextField(blank=True, null=True)       # ответ бота
    tasks_data = models.JSONField(default=list, blank=True)     # список задач (если есть)
    error_message = models.TextField(blank=True)

