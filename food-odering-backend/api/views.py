import joblib
from django.shortcuts import render
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import FoodItem, CustomUser, Order
from .serializers import FoodItemSerializer, OrderSerializer
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from sklearn.metrics.pairwise import cosine_similarity
from django.core.exceptions import ImproperlyConfigured

# Load trained model and vectorizer with error handling

try:
    model = joblib.load('ml_models/recommendation_model.pkl')
    vectorizer = joblib.load('ml_models/ingredient_vectorizer.pkl')
except (FileNotFoundError, EOFError):
    model = None
    vectorizer = None


def get_cached_items():
    """Cache food items to improve performance."""
    cached_items = cache.get('all_items')
    if not cached_items:
        cached_items = list(FoodItem.objects.all())
        cache.set('all_items', cached_items, timeout=3600)  # Cache for 1 hour
    return cached_items

def get_recommendations(user_id, liked_ingredients):
    """Generate recommendations based on liked ingredients."""
    if not vectorizer or not model:
        return []

    if not liked_ingredients.strip():
        return []

    # Transform liked ingredients into TF-IDF
    user_vector = vectorizer.transform([liked_ingredients])
    all_items = get_cached_items()
    item_ingredients = [item.ingredients for item in all_items]
    tfidf_matrix = vectorizer.transform(item_ingredients)

    # Compute similarity scores
    similarity_scores = cosine_similarity(user_vector, tfidf_matrix).flatten()

    # Get top recommendations
    top_indices = similarity_scores.argsort()[-10:][::-1]
    recommended_items = [all_items[i] for i in top_indices]

    return recommended_items


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_food_ml(request):
    user = request.user
    liked_items = user.liked_food_items.all()

    if not liked_items:
        return Response([], status=status.HTTP_200_OK)

    # Collect all ingredients and replace None with an empty string
    all_items = FoodItem.objects.all()
    ingredients_list = [item.ingredients if item.ingredients else "" for item in all_items]
    item_ids = [item.id for item in all_items]

    # Create TF-IDF matrix using the preloaded vectorizer
    tfidf_matrix = vectorizer.transform(ingredients_list)

    # Find similarity for liked items
    liked_indices = [item_ids.index(item.id) for item in liked_items]
    liked_tfidf = tfidf_matrix[liked_indices]
    similarity_scores = cosine_similarity(liked_tfidf, tfidf_matrix).mean(axis=0)

    # Rank items by similarity and fix int64 issue
    recommendations = [
        all_items[int(i)] for i in similarity_scores.argsort()[::-1]
        if all_items[int(i)] not in liked_items
    ]

    # Serialize and return top recommendations
    serializer = FoodItemSerializer(recommendations[:10], many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# Food Item API View
class FoodItemList(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            items = FoodItem.objects.all()
            data = []
            for item in items:
                serialized_item = FoodItemSerializer(item).data
                serialized_item['likes'] = item.likes.count()
                serialized_item['dislikes'] = item.dislikes.count()
                serialized_item['user_interaction'] = (
                    "like" if request.user in item.likes.all() else
                    "dislike" if request.user in item.dislikes.all() else None
                )
                data.append(serialized_item)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to fetch food items", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def like_food_item(request, food_id):
    try:
        food_item = FoodItem.objects.get(id=food_id)
        user = request.user

        if request.method == 'POST':
            # Add to likes
            food_item.likes.add(user)
            return Response({'message': 'Food item liked successfully'}, status=status.HTTP_200_OK)

        elif request.method == 'DELETE':
            # Remove from likes
            food_item.likes.remove(user)
            return Response({'message': 'Like removed successfully'}, status=status.HTTP_200_OK)

    except FoodItem.DoesNotExist:
        return Response({'error': 'Food item not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def dislike_food_item(request, food_id):
    try:
        food_item = FoodItem.objects.get(id=food_id)
        user = request.user

        if request.method == 'POST':
            # Add to dislikes
            food_item.dislikes.add(user)
            return Response({'message': 'Food item disliked successfully'}, status=status.HTTP_200_OK)

        elif request.method == 'DELETE':
            # Remove from dislikes
            food_item.dislikes.remove(user)
            return Response({'message': 'Dislike removed successfully'}, status=status.HTTP_200_OK)

    except FoodItem.DoesNotExist:
        return Response({'error': 'Food item not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_food(request):
    user = request.user
    liked_items = user.liked_food_items.all()

    if not liked_items:
        return Response([], status=status.HTTP_200_OK)

    liked_ingredients = " ".join([item.ingredients for item in liked_items])
    recommendations = get_recommendations(user.id, liked_ingredients)

    # Serialize and return recommendations
    serializer = FoodItemSerializer(recommendations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Order API View
class OrderList(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            # Validate items
            item_ids = [item['id'] for item in request.data.get('items', [])]
            if not FoodItem.objects.filter(id__in=item_ids).exists():
                return Response({'error': 'Invalid food item in order'}, status=status.HTTP_400_BAD_REQUEST)

            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Login View
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'message': 'Login successful'}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Logout View
class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.auth.delete()  # Delete the user's token
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Failed to logout', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Register View
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        name = request.data.get('name')

        if CustomUser.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if CustomUser.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.create_user(username=username, email=email, password=password, name=name)
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': 'User registration failed', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# User Orders View
class UserOrdersView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            orders = Order.objects.filter(user=request.user)
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Failed to fetch orders', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': 'Failed to save order', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
