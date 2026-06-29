from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    subtasks = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'name', 'description', 'due_date', 'due_time', 'duration', 'status', 'parent', 'subtasks']
        read_only_fields = ['id']

    def get_subtasks(self, obj):
        # Recursively serialize subtasks if they exist
        serializer = TaskSerializer(obj.subtasks.all(), many=True)
        return serializer.data

