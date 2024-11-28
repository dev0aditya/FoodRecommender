from django.urls import path
from .views import FoodItemList, OrderList, LoginView, LogoutView, RegisterView, UserOrdersView

urlpatterns = [
    path('food-items/', FoodItemList.as_view(), name='food-items'),
    path('orders/', OrderList.as_view(), name='orders'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('user/orders/', UserOrdersView.as_view(), name='user-orders'),
]
