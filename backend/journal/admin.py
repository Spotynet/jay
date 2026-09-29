from django.contrib import admin
from .models import JournalEntry, CustomRating

class CustomRatingInline(admin.TabularInline):
    model = CustomRating
    extra = 1

@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'mood_score', 'energy_score')
    list_filter = ('date', 'mood_score', 'energy_score', 'user')
    search_fields = ('user__username',)
    inlines = [CustomRatingInline]
