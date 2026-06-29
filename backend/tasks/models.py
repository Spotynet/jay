from django.db import models
from core.models import TimeStampedModel, OwnedModel

class Task(TimeStampedModel, OwnedModel):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('ARCHIVED', 'Archived'),
    ]
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    due_time = models.TimeField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subtasks')

    def __str__(self):
        return self.name
