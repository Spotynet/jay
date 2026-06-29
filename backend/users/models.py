from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    timezone = models.CharField(max_length=50, default="UTC")
    onboarding_completed = models.BooleanField(default=False)
