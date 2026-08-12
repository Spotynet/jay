from rest_framework import serializers
from .models import Transaction, Category

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'budget', 'is_default', 'parent', 'children', 'icon', 'color', 'description']
        read_only_fields = ['is_default']

    def get_children(self, obj):
        children = obj.children.all()
        if not children:
            return []
        return CategorySerializer(children, many=True).data

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
        fields = ['id', 'amount', 'type', 'category', 'date', 'description']
        read_only_fields = ['id']

    def validate(self, attrs):
        if attrs.get('type') == 'EXPENSE' and not attrs.get('category'):
            raise serializers.ValidationError({'category': 'Category is required for expense transactions.'})
        return attrs
