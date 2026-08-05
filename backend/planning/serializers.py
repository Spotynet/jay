from rest_framework import serializers
from .models import Area, Goal, Project


class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ['id', 'name', 'color', 'icon']
        read_only_fields = ['id']


class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['id', 'area', 'title', 'description', 'target_date', 'completed']
        read_only_fields = ['id']


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'status', 'due_date', 'area']
        read_only_fields = ['id']
