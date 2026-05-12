from rest_framework import serializers
from .models import Project, ProjectFile


class ProjectFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFile
        fields = ('id', 'file', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class ProjectSerializer(serializers.ModelSerializer):
    files = ProjectFileSerializer(many=True, read_only=True)
    chats_count = serializers.IntegerField(read_only=True)
    uploaded_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
        help_text="Список файлов для загрузки при создании проекта"
    )
    sync_with_yougile = serializers.BooleanField(
        write_only=True,
        required=False,
        default=False,
        help_text="Создать зеркальный проект в YouGile (требуется настроенный API-ключ)"
    )

    class Meta:
        model = Project
        fields = ('id', 'title', 'created', 'description', 'country', 'user',
                  'files', 'chats_count', 'uploaded_files', 'sync_with_yougile')
        read_only_fields = ('id', 'created', 'user')

    def create(self, validated_data):
        # Убираем sync_with_yougile из validated_data, так как это не поле модели
        sync_flag = validated_data.pop('sync_with_yougile', False)
        uploaded_files = validated_data.pop('uploaded_files', [])
        project = Project.objects.create(**validated_data)

        project._sync_with_yougile = sync_flag

        for file_obj in uploaded_files:
            ProjectFile.objects.create(project=project, file=file_obj)
        return project
