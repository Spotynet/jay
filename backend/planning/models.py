from django.db import models
from core.models import TimeStampedModel, OwnedModel


class Area(TimeStampedModel, OwnedModel):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, blank=True)  # HEX
    icon = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name


class Goal(TimeStampedModel, OwnedModel):
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name="goals")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    target_date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class Project(TimeStampedModel, OwnedModel):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('ARCHIVED', 'Archived'),
    ]
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    due_date = models.DateField(null=True, blank=True)
    color = models.CharField(max_length=7, blank=True)
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, blank=True, related_name="projects")

    def __str__(self):
        return self.name
