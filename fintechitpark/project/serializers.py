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

    class Meta:
        model = Project
        fields = ('id', 'title', 'created', 'description', 'country', 'user', 'files', 'chats_count', 'uploaded_files')
        read_only_fields = ('id', 'created', 'user')

    def create(self, validated_data):
        uploaded_files = validated_data.pop('uploaded_files', [])
        project = Project.objects.create(**validated_data)
        for file_obj in uploaded_files:
            ProjectFile.objects.create(project=project, file=file_obj)
        return project
