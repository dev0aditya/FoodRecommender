from django.contrib import admin
from .models import FoodItem, Order
from django.utils.html import format_html  # Import for image preview functionality

@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'category', 'image_preview')  # Columns to display in the admin list view
    list_filter = ('category',)  # Filter by category
    search_fields = ('name',)  # Search by name
    fields = ('name', 'price', 'category', 'image')  # Fields in the edit form

    # Method to display a preview of the image
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 100px; height: auto;" />', obj.image.url)
        return "No Image"

    image_preview.short_description = "Image Preview"  # Admin display label for the image preview

# Register the Order model as-is
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at')  # Customize this as needed
    list_filter = ('created_at',)
    search_fields = ('user__username',)
