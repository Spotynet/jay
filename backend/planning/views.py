from rest_framework import viewsets
from .models import Area, Goal, Project
from .serializers import AreaSerializer, GoalSerializer, ProjectSerializer


class AreaViewSet(viewsets.ModelViewSet):
    serializer_class = AreaSerializer

    def get_queryset(self):
        return Area.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
