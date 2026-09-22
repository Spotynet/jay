from django.db import models
from core.models import TimeStampedModel, OwnedModel
from django.core.validators import MinValueValidator

class Category(TimeStampedModel, OwnedModel):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=[('EXPENSE', 'Expense'), ('EARNING', 'Earning')])
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    is_default = models.BooleanField(default=False)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    icon = models.CharField(max_length=50, blank=True, default='')
    color = models.CharField(max_length=7, blank=True, default='')
    description = models.TextField(blank=True, default='')
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_debt = models.BooleanField(default=False)
    debt_months = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.name} ({self.type})"

class CategoryDueDate(TimeStampedModel, OwnedModel):
    FREQUENCY_CHOICES = [
        ('MONTHLY', 'Monthly'),
        ('WEEKLY', 'Weekly'),
    ]
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='due_dates')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='MONTHLY')
    day_of_month = models.IntegerField(null=True, blank=True) # 1-31, or -1 for last day
    day_of_week = models.IntegerField(null=True, blank=True) # 0-6 for Mon-Sun
    week_of_month = models.IntegerField(null=True, blank=True) # 1-4, or -1 for last
    description = models.CharField(max_length=100, blank=True, default='')

    def __str__(self):
        return f"{self.category.name} - {self.amount} ({self.frequency})"

class Transaction(TimeStampedModel, OwnedModel):
    TYPE_CHOICES = [
        ('EXPENSE', 'Expense'),
        ('EARNING', 'Earning'),
    ]
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='transactions')
    subcategory = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategory_transactions')
    date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
