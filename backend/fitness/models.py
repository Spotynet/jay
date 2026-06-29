from django.db import models
from core.models import TimeStampedModel, OwnedModel


class Workout(TimeStampedModel, OwnedModel):
    date = models.DateField()

    type = models.CharField(max_length=100)  # push, pull, run, etc
    duration = models.IntegerField(null=True, blank=True)  # minutes

    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.type} - {self.date}"
