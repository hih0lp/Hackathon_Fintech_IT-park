from rest_framework import serializers
from .models import Task
from chat.models import Chat


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'title', 'active', 'created')
        read_only_fields = ('id', 'created', 'title')


class TaskBulkCreateSerializer(serializers.Serializer):
    chat_id = serializers.PrimaryKeyRelatedField(
        queryset=Chat.objects.all(),
        write_only=True
    )
    titles = serializers.ListField(
        child=serializers.CharField(max_length=255),
        write_only=True,
        help_text="Список названий задач (минимум 1)"
    )

    def validate_titles(self, value):
        if not value:
            raise serializers.ValidationError("Список заголовков не может быть пустым")
        return value


class DuplicateToYouGileSerializer(serializers.Serializer):
    task_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="Список ID локальных задач для дублирования в YouGile"
    )
