from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import Transaction, Category
from .serializers import TransactionSerializer, CategorySerializer

# ...

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user, parent__isnull=True).prefetch_related('children')

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
        serializer.save(user=self.request.user)

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
