from rest_framework import serializers
from .models import Product
from categories.models import Category
from reviews.serializers import ReviewSerializer

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock', 'status', 
            'image', 'category', 'category_name', 'created_at', 'updated_at',
            'reviews', 'rating'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'reviews', 'rating']

    def get_rating(self, obj):
        # Calculer la note moyenne si des avis existent
        reviews = obj.reviews.all()
        if not reviews:
            return 0
        
        total = sum(review.rating for review in reviews)
        return float(total) / len(reviews)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure image is properly formatted
        if data.get('image'):
            data['images'] = [{'image': data['image']}]  # Format for frontend compatibility
        return data
