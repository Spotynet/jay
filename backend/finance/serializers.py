from rest_framework import serializers
from .models import Transaction, Category, CategoryDueDate

class CategoryDueDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryDueDate
        fields = ['id', 'amount', 'frequency', 'day_of_month', 'day_of_week', 'week_of_month', 'description']

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    due_dates = CategoryDueDateSerializer(many=True, required=False)

    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'budget', 'is_default', 'parent', 'children', 'icon', 'color', 'description', 'order', 'is_active', 'due_dates', 'is_debt', 'debt_months', 'created_at']
        read_only_fields = ['is_default', 'created_at']

    def get_children(self, obj):
        children = obj.children.all()
        if not children:
            return []
        return CategorySerializer(children, many=True).data

    def create(self, validated_data):
        due_dates_data = validated_data.pop('due_dates', [])
        category = Category.objects.create(**validated_data)
        for due_date_data in due_dates_data:
            due_date_data.pop('id', None)  # Ensure we don't try to set ID manually
            CategoryDueDate.objects.create(category=category, user=category.user, **due_date_data)
        return category

    def update(self, instance, validated_data):
        due_dates_data = validated_data.pop('due_dates', None)
        instance = super().update(instance, validated_data)
        
        if due_dates_data is not None:
            instance.due_dates.all().delete()
            for due_date_data in due_dates_data:
                due_date_data.pop('id', None)  # Ensure we don't try to set ID manually
                CategoryDueDate.objects.create(category=instance, user=instance.user, **due_date_data)
        
        return instance

    def validate_parent(self, value):
        if value is None:
            return value
        category_type = self.initial_data.get('type') or (self.instance.type if self.instance else None)
        if not category_type:
            raise serializers.ValidationError('Cannot determine category type.')
        if value.type != category_type:
            raise serializers.ValidationError('Parent category must have the same type.')
        if value.parent_id is not None:
            raise serializers.ValidationError('Categories can only have one level of nesting.')
        instance = self.instance
        if instance and value.id == instance.id:
            raise serializers.ValidationError('A category cannot be its own parent.')
        return value

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'type', 'category', 'subcategory', 'date', 'due_date', 'description']
        read_only_fields = ['id']

    def validate(self, attrs):
        return attrs
