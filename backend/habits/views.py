from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Habit, HabitLog
from .serializers import HabitSerializer
from django.db.models import Q
from datetime import datetime

class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = Habit.objects.filter(user=self.request.user)
        date_str = self.request.query_params.get('date')
        if date_str:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            weekday = target_date.weekday() 
            
            # Filter habits created on or before the target date
            queryset = queryset.filter(created_at__date__lte=target_date)
            
            # Filter habits: Daily OR Weekly where current day is in days_of_week
            queryset = queryset.filter(
                Q(frequency='DAILY') | 
                (Q(frequency='WEEKLY') & Q(days_of_week__contains=weekday))
            )
        return queryset

    @action(detail=True, methods=['post'])
    def toggle_completion(self, request, pk=None):
        habit = self.get_object()
        date_str = request.data.get('date')
        if not date_str:
            return Response({'error': 'Date is required'}, status=status.HTTP_400_BAD_REQUEST)

        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        log, created = HabitLog.objects.get_or_create(habit=habit, date=target_date, user=request.user)

        if log.completed:
            # Reset progress when un-completing
            log.completed = False
            log.progress = 0
        else:
            # Complete and set progress to target
            log.completed = True
            log.progress = habit.target_value if habit.has_target else 1
            
        log.save()
        return Response({'completed': log.completed, 'progress': log.progress})

    @action(detail=True, methods=['post'])
    def increment_progress(self, request, pk=None):
        habit = self.get_object()
        date_str = request.data.get('date')
        if not date_str:
            return Response({'error': 'Date is required'}, status=status.HTTP_400_BAD_REQUEST)

        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        log, created = HabitLog.objects.get_or_create(habit=habit, date=target_date, user=request.user)

        if habit.target_type == 'COUNT':
            log.progress = min(log.progress + 1, habit.target_value)
            log.completed = log.progress >= habit.target_value
            log.save()
            return Response({'progress': log.progress, 'completed': log.completed})
        
        return Response({'error': 'Habit is not count-based'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def decrement_progress(self, request, pk=None):
        habit = self.get_object()
        date_str = request.data.get('date')
        if not date_str:
            return Response({'error': 'Date is required'}, status=status.HTTP_400_BAD_REQUEST)

        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        log, created = HabitLog.objects.get_or_create(habit=habit, date=target_date, user=request.user)

        if habit.target_type == 'COUNT':
            log.progress = max(log.progress - 1, 0)
            log.completed = log.progress >= habit.target_value
            log.save()
            return Response({'progress': log.progress, 'completed': log.completed})
        
        return Response({'error': 'Habit is not count-based'}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
