from django.urls import path, include
from .views import JournalEntryViewSet, JournalSettingsViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'entries', JournalEntryViewSet, basename='journal-entry')

# Explicitly mapping singleton settings view
settings_view = JournalSettingsViewSet.as_view({
    'get': 'retrieve',
    'patch': 'partial_update'
})

urlpatterns = [
    path('settings/', settings_view, name='journal-settings'),
    path('', include(router.urls)),
]
