from django.contrib import admin
from .models import Workout

@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'date', 'duration')
    list_filter = ('type', 'date', 'user')
    search_fields = ('type', 'notes')
