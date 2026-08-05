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
        fields = ['id', 'name', 'description', 'frequency', 'days_of_week', 'target_value', 'has_target', 'target_type', 'category', 'reminder_time', 'icon', 'is_active', 'completed', 'status', 'stats', 'progress', 'history']
        read_only_fields = ['id', 'completed', 'status', 'stats', 'progress', 'history']

    def get_history(self, obj):
        logs = obj.logs.order_by('-date')[:7]
        return [{'date': log.date.strftime('%Y-%m-%d'), 'status': log.status, 'completed': log.completed} for log in logs]

    def get_status(self, obj):
        request = self.context.get('request')
        if not request: return 'PENDING'
        date = request.query_params.get('date')
        if not date: return 'PENDING'
        log = obj.logs.filter(date=date).first()
        if not log: return 'PENDING'
        return log.status

    def get_completed(self, obj):
# ... (rest of methods)
        request = self.context.get('request')
        if not request: return False
        date = request.query_params.get('date')
        if not date: return False
        log = obj.logs.filter(date=date).first()
        if not log: return False
        
        if obj.target_type == 'COUNT' and obj.has_target:
            return log.progress >= obj.target_value
        return log.completed

    def get_progress(self, obj):
        request = self.context.get('request')
        if not request: return 0
        date = request.query_params.get('date')
        if not date: return 0
        log = obj.logs.filter(date=date).first()
        return log.progress if log else 0

    def get_stats(self, obj):
        total_logs = obj.logs.count()
        completed_logs = obj.logs.filter(completed=True).count()
        success_rate = (completed_logs / total_logs * 100) if total_logs > 0 else 0
        return {
            'total_completions': completed_logs,
            'success_rate': round(success_rate, 1)
        }
