from django.db import models
from core.models import TimeStampedModel, OwnedModel

class Event(TimeStampedModel, OwnedModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    duration = models.DurationField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.name} ({self.date})"
