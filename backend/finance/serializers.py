from rest_framework import serializers
from .models import Budget, Transaction, Account, Category, FinanceEntry

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'name', 'initial_balance']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type']

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'category', 'amount', 'month', 'year']
        read_only_fields = ['id']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'type', 'category', 'account', 'date', 'description']
        read_only_fields = ['id']

class FinanceEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceEntry
        fields = ['id', 'name', 'type', 'value', 'date', 'created_at']
        read_only_fields = ['id', 'created_at']
