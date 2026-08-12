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

    def __str__(self):
        return f"{self.name} ({self.type})"

class Transaction(TimeStampedModel, OwnedModel):
    TYPE_CHOICES = [
        ('EXPENSE', 'Expense'),
        ('EARNING', 'Earning'),
    ]
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    date = models.DateField()
    description = models.TextField(blank=True)
