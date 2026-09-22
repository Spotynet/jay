from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Transaction, Category
from .serializers import TransactionSerializer, CategorySerializer

# ...

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if self.action == 'list':
            return Category.objects.filter(user=user, parent__isnull=True).prefetch_related('children', 'children__due_dates')
        return Category.objects.filter(user=user)

    def list(self, request, *args, **kwargs):
        if not Category.objects.filter(user=request.user, is_default=True).exists():
            Category.objects.create(
                user=request.user,
                name='Free Spend',
                type='EXPENSE',
                budget=0,
                is_default=True,
            )
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Set order to max + 1
        parent = serializer.validated_data.get('parent')
        user = self.request.user
        max_order = Category.objects.filter(user=user, parent=parent).aggregate(models.Max('order'))['order__max']
        serializer.save(user=user, order=(max_order + 1) if max_order is not None else 0)

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        ordered_ids = request.data.get('ordered_ids', [])
        parent_id = request.data.get('parent')
        
        # Update order field for each category
        for index, cat_id in enumerate(ordered_ids):
            Category.objects.filter(id=cat_id, user=request.user).update(order=index)
            
        return Response({'status': 'reordered'})

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        if category.is_default:
            return Response(
                {'detail': 'The default Free Spend category cannot be deleted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if category.children.exists():
            return Response(
                {'detail': 'This category has subcategories. Move or delete them first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
