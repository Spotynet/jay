from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import TimeStampedModel, OwnedModel
from users.models import User

class JournalEntry(TimeStampedModel, OwnedModel):
    date = models.DateField()
    mood_score = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Mood score from 1-10"
    )
    energy_score = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Energy score from 1-10"
    )

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user} - {self.date}"

class CustomRating(models.Model):
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='custom_ratings')
    label = models.CharField(max_length=50)
    score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )

    class Meta:
        unique_together = ('journal_entry', 'label')

    def save(self, *args, **kwargs):
        if self.label:
            self.label = self.label.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.label}: {self.score}"

class JournalSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='journal_settings')
    reminder_enabled = models.BooleanField(default=False)
    reminder_time = models.TimeField(default='20:00:00')
    repeat_mode = models.CharField(
        max_length=20, 
        choices=[('every_day', 'Every day'), ('selected_days', 'Selected days')],
        default='every_day'
    )
    days_of_week = models.JSONField(default=list)
    default_tags = models.JSONField(default=list)

    def __str__(self):
        return f"{self.user.username}'s Journal Settings"
