from django.contrib import admin
from .models import Note

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'is_pinned', 'updated_at')
    list_filter = ('is_pinned', 'user')
    search_fields = ('title', 'content')
