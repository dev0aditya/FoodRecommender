import csv
from django.core.management.base import BaseCommand
from api.models import FoodItem, Order, CustomUser

class Command(BaseCommand):
    help = 'Export data for recommendations'

    def handle(self, *args, **kwargs):
        file_path = 'ml_models/recommendation_data.csv'  # Save file in ml_models
        with open(file_path, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['user_id', 'food_id', 'interaction', 'ingredients'])
            for user in CustomUser.objects.all():
                for food in user.liked_food_items.all():
                    writer.writerow([user.id, food.id, 'like', food.ingredients])
                for food in user.disliked_food_items.all():
                    writer.writerow([user.id, food.id, 'dislike', food.ingredients])
        self.stdout.write(f"Data exported successfully to {file_path}")

    # def handle(self, *args, **kwargs):
    #     with open('recommendation_data.csv', 'w', newline='') as csvfile:
    #         writer = csv.writer(csvfile)
    #         writer.writerow(['user_id', 'food_id', 'interaction', 'ingredients'])

    #         # Export likes
    #         for food in FoodItem.objects.all():
    #             for user in food.likes.all():
    #                 writer.writerow([user.id, food.id, 'like', food.ingredients])
    #             for user in food.dislikes.all():
    #                 writer.writerow([user.id, food.id, 'dislike', food.ingredients])

    #         # Export orders
    #         for order in Order.objects.all():
    #             for item in order.items:
    #                 writer.writerow([
    #                     order.user.id,
    #                     item['id'],
    #                     'order',
    #                     FoodItem.objects.get(id=item['id']).ingredients
    #                 ])

    #     self.stdout.write(self.style.SUCCESS('Data exported successfully!'))
