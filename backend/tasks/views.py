from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from datetime import datetime

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)
        date_str = self.request.query_params.get('date')
        if date_str:
            queryset = queryset.filter(due_date=date_str)
        return queryset.order_by('due_date')

    @action(detail=True, methods=['post'])
    def toggle_completion(self, request, pk=None):
        task = self.get_object()
        task.status = 'COMPLETED' if task.status == 'PENDING' else 'PENDING'
        task.save()
        return Response({'status': task.status})

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
