from django.db import models
from django.conf import settings
from core.models import TimeStampedModel, OwnedModel


class Habit(TimeStampedModel, OwnedModel):
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
    ]
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='DAILY')
    days_of_week = models.JSONField(default=list, blank=True)
    target_value = models.IntegerField(default=1)
    has_target = models.BooleanField(default=False)
    target_type = models.CharField(max_length=10, choices=[('COUNT', 'Count'), ('TIME', 'Time')], default='COUNT')
    category = models.CharField(max_length=50, blank=True)
    reminder_time = models.TimeField(null=True, blank=True)
    icon = models.CharField(max_length=50, default='Activity')

    def __str__(self):
        return self.name

class HabitLog(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('SKIPPED', 'Skipped'),
        ('FAILED', 'Failed'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="habit_logs", null=True)
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="logs")
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    completed = models.BooleanField(default=False)
    progress = models.IntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'habit', 'date'], name='unique_user_habit_log_per_day')
        ]

    def save(self, *args, **kwargs):
        if self.status == 'COMPLETED':
            self.completed = True
        elif self.status in ('PENDING', 'SKIPPED', 'FAILED'):
            self.completed = False
        super().save(*args, **kwargs)

