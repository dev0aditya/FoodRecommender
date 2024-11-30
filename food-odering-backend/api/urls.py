from django.urls import path
from .views import FoodItemList, OrderList, LoginView, LogoutView, RegisterView, UserOrdersView, like_food_item, dislike_food_item, recommend_food_ml


urlpatterns = [
    path('food-items/', FoodItemList.as_view(), name='food-items'),
    path('orders/', OrderList.as_view(), name='orders'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('user/orders/', UserOrdersView.as_view(), name='user-orders'),
    path('food/<int:food_id>/like/', like_food_item, name='like_food_item'),
    path('food/<int:food_id>/dislike/', dislike_food_item, name='dislike_food_item'),
    path('recommendations_ml/', recommend_food_ml, name='recommendations_ml'),
]
