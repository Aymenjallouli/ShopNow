from rest_framework import serializers
from products.models import Category, Product
from reviews.models import Review


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ('slug', 'created_at', 'updated_at')


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    discount_percentage = serializers.ReadOnlyField(source='get_discount_percentage')
    
    class Meta:
        model = Product
        fields = ('id', 'name', 'slug', 'sku', 'category', 'category_name', 'description',
                 'price', 'discount_price', 'discount_percentage', 'stock', 'is_available',
                 'image', 'featured', 'weight', 'dimensions', 'created_at', 'updated_at')
        read_only_fields = ('slug', 'sku', 'created_at', 'updated_at')
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            representation['image'] = self.context['request'].build_absolute_uri(instance.image.url)
        return representation


class ProductDetailSerializer(ProductSerializer):
    reviews = serializers.SerializerMethodField()
    
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ('reviews',)
    
    def get_reviews(self, obj):
        reviews = obj.reviews.filter(is_approved=True)
        return ReviewSerializer(reviews, many=True).data


class ReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at', 'is_approved')
        
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
