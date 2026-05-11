from rest_framework import serializers
from .models import Project, ProjectFile


class ProjectFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProjectFile
        fields = ('id', 'file', 'file_url', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None


class ProjectSerializer(serializers.ModelSerializer):
    files = ProjectFileSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ('id', 'title', 'created', 'user', 'files')
        read_only_fields = ('id', 'created', 'user')
