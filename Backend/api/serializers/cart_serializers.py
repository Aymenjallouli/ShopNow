from rest_framework import serializers
from cart.models import CartItem
from products.models import Product


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_image = serializers.SerializerMethodField()
    unit_price = serializers.SerializerMethodField()
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_name', 'product_image', 'quantity', 
                  'unit_price', 'total_price', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def get_product_image(self, obj):
        if obj.product.image:
            return self.context['request'].build_absolute_uri(obj.product.image.url)
        return None
    
    def get_unit_price(self, obj):
        if obj.product.discount_price:
            return obj.product.discount_price
        return obj.product.price
    
    def create(self, validated_data):
        user = self.context['request'].user
        product = validated_data['product']
        quantity = validated_data.get('quantity', 1)
        
        # Check if product is available
        if not product.is_available or product.stock < quantity:
            raise serializers.ValidationError({"product": "This product is not available in the requested quantity."})
        
        # Check if cart item already exists
        try:
            cart_item = CartItem.objects.get(user=user, product=product)
            cart_item.quantity += quantity
            cart_item.save()
            return cart_item
        except CartItem.DoesNotExist:
            cart_item = CartItem.objects.create(user=user, product=product, quantity=quantity)
            return cart_item
    
    def update(self, instance, validated_data):
        quantity = validated_data.get('quantity', instance.quantity)
        
        # Check if product has enough stock
        if instance.product.stock < quantity:
            raise serializers.ValidationError({"quantity": "Not enough stock available."})
        
        instance.quantity = quantity
        instance.save()
        return instance
