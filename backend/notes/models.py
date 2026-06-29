from django.db import models
from core.models import TimeStampedModel, OwnedModel


class Note(TimeStampedModel, OwnedModel):
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField()

    is_pinned = models.BooleanField(default=False)

    def __str__(self):
        return self.title or "Untitled"
