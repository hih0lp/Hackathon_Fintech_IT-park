import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_alter_chat_options_chat_available'),
    ]

    operations = [
        migrations.CreateModel(
            name='LLMRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_message', models.TextField()),
                ('context_text', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('pending', 'Ожидает'), ('processing', 'В процессе'), ('completed', 'Завершён'), ('failed', 'Ошибка')], default='pending', max_length=20)),
                ('celery_task_id', models.CharField(blank=True, max_length=255, null=True)),
                ('result_text', models.TextField(blank=True, null=True)),
                ('tasks_data', models.JSONField(blank=True, default=list)),
                ('error_message', models.TextField(blank=True)),
                ('chat', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='llm_requests', to='chat.chat')),
            ],
        ),
    ]
