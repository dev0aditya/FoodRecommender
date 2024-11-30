from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class FoodItem(models.Model):
    CATEGORY_CHOICES = [
        ('Main', 'Main'),
        ('Beverage', 'Beverage'),
        ('Salad', 'Salad'),
    ]

    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    image = models.ImageField(upload_to='food_images/', blank=True, null=True)  # Image upload field
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='liked_food_items', blank=True
    )
    dislikes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='disliked_food_items', blank=True
    )
    ingredients = models.TextField(blank=True, null=True)  # Add ingredients field

    def __str__(self):
        return self.name
        
class Order(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        default=1  # Replace with the ID of an actual user in your database
    )
    items = models.JSONField()
    total = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class CustomUser(AbstractUser):
    name = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.username
