from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'timezone', 'onboarding_completed', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Profile Info', {'fields': ('timezone', 'onboarding_completed')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Extra Profile Info', {'fields': ('timezone', 'onboarding_completed')}),
    )
