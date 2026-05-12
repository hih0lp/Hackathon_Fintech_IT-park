from rest_framework import serializers
from .models import CustomAgent


class CustomAgentSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = CustomAgent
        fields = ('id', 'project', 'project_title', 'name', 'description', 'skill', 'created')
        read_only_fields = ('id', 'created', 'project_title')