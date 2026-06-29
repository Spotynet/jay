from rest_framework import viewsets, permissions
from .models import Event
from .serializers import EventSerializer

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Event.objects.filter(user=self.request.user)
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)
        return queryset.order_by('start_time')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
