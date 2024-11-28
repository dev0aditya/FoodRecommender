from rest_framework import serializers
from .models import FoodItem, Order

class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = serializers.JSONField()  # Ensure items is a JSON field
    total = serializers.FloatField()

    class Meta:
        model = Order
        fields = ['id', 'items', 'total', 'created_at']
