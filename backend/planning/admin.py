from django.contrib import admin
from .models import Area, Goal

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    list_filter = ('user',)
    search_fields = ('name',)

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'area', 'user', 'completed', 'target_date')
    list_filter = ('completed', 'area', 'user')
    search_fields = ('title', 'description')
