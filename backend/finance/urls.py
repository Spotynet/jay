from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BudgetViewSet, TransactionViewSet, AccountViewSet, CategoryViewSet, FinanceEntryViewSet

router = DefaultRouter()
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'entries', FinanceEntryViewSet, basename='financeentry')

urlpatterns = [
    path('', include(router.urls)),
]
