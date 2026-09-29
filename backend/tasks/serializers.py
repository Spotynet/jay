from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    subtasks = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'name', 'description', 'due_date', 'due_time', 'duration', 'status', 'order', 'parent', 'project', 'subtasks']
        read_only_fields = ['id']

    def get_subtasks(self, obj):
        children = obj.subtasks.all().order_by('order', 'due_date')
        serializer = TaskSerializer(children, many=True, context=self.context)
        return serializer.data

    def validate(self, attrs):
        parent = attrs['parent'] if 'parent' in attrs else getattr(self.instance, 'parent', None)
        if parent is None:
            return attrs
        request = self.context.get('request')
        if request and parent.user_id != request.user.id:
            raise serializers.ValidationError({'parent': 'Parent task not found.'})
        if parent.parent_id:
            raise serializers.ValidationError({'parent': 'A subtask cannot have its own subtasks.'})
        if self.instance and parent.id == self.instance.id:
            raise serializers.ValidationError({'parent': 'A task cannot be its own parent.'})
        return attrs

