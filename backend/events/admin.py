from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['name', 'date', 'start_time', 'duration', 'location']
    list_filter = ['date', 'location']
    search_fields = ['name', 'description']
