from datetime import datetime, timedelta
from rest_framework import serializers
from .models import Habit, HabitLog


class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = ['id', 'habit', 'date', 'status', 'completed', 'progress']


class HabitSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = [
            'id',
            'name',
            'description',
            'frequency',
            'days_of_week',
            'target_value',
            'has_target',
            'target_type',
            'category',
            'reminder_time',
            'icon',
            'is_active',
            'created_at',
            'completed',
            'status',
            'stats',
            'progress',
            'history',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'completed',
            'status',
            'stats',
            'progress',
            'history',
        ]

    def _history_payload(self, logs):
        return [
            {
                'date': log.date.strftime('%Y-%m-%d'),
                'status': log.status,
                'completed': log.completed,
            }
            for log in logs
        ]

    def get_history(self, obj):
        """
        With ?date=YYYY-MM-DD: completion logs in the 7 local calendar days
        ending on that date (sparse — days without logs are omitted).
        Without date: last 7 log rows (manage / chip heatmaps).
        """
        request = self.context.get('request')
        date = request.query_params.get('date') if request else None
        if date:
            end = datetime.strptime(date, '%Y-%m-%d').date()
            start = end - timedelta(days=6)
            logs = obj.logs.filter(date__gte=start, date__lte=end).order_by('date')
            return self._history_payload(logs)

        logs = list(obj.logs.order_by('-date')[:7])
        logs.reverse()
        return self._history_payload(logs)

    def get_status(self, obj):
        request = self.context.get('request')
        if not request:
            return 'PENDING'
        date = request.query_params.get('date')
        if not date:
            return 'PENDING'
        log = obj.logs.filter(date=date).first()
        if not log:
            return 'PENDING'
        return log.status

    def get_completed(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        date = request.query_params.get('date')
        if not date:
            return False
        log = obj.logs.filter(date=date).first()
        if not log:
            return False

        if obj.target_type == 'COUNT' and obj.has_target:
            return log.progress >= obj.target_value
        return log.completed

    def get_progress(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        date = request.query_params.get('date')
        if not date:
            return 0
        log = obj.logs.filter(date=date).first()
        return log.progress if log else 0

    def get_stats(self, obj):
        total_logs = obj.logs.count()
        completed_logs = obj.logs.filter(completed=True).count()
        success_rate = (completed_logs / total_logs * 100) if total_logs > 0 else 0
        return {
            'total_completions': completed_logs,
            'success_rate': round(success_rate, 1),
        }
