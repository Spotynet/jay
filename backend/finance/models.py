from django.db import models
from core.models import TimeStampedModel, OwnedModel
from django.core.validators import MinValueValidator

class Account(TimeStampedModel, OwnedModel):
    name = models.CharField(max_length=100)
    initial_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return self.name

class Category(TimeStampedModel, OwnedModel):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=[('EXPENSE', 'Expense'), ('EARNING', 'Earning')])

    def __str__(self):
        return f"{self.name} ({self.type})"

class Budget(TimeStampedModel, OwnedModel):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()

    class Meta:
        unique_together = ('user', 'category', 'month', 'year')

    def __str__(self):
        return f"{self.category} - {self.month}/{self.year}: {self.amount}"

class Transaction(TimeStampedModel, OwnedModel):
    TYPE_CHOICES = [
        ('EXPENSE', 'Expense'),
        ('EARNING', 'Earning'),
    ]
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    date = models.DateField()
    description = models.TextField(blank=True)

class FinanceEntry(TimeStampedModel, OwnedModel):
    TYPE_CHOICES = [
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
    ]
    name = models.CharField(max_length=255, default='Unnamed')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    value = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} ({self.type}) - {self.value}"
