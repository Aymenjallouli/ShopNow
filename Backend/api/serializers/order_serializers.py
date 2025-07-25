from rest_framework import serializers
from orders.models import Order, OrderItem
from products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'price', 'quantity', 'total_price')
        read_only_fields = ('id', 'price', 'total_price')
        

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)
    
    class Meta:
        model = Order
        fields = ('id', 'first_name', 'last_name', 'email', 'phone', 'address', 
                  'city', 'state', 'country', 'zip_code', 'notes', 'items')
        
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        user = self.context['request'].user
        
        # Calculate total price from cart items
        from cart.models import CartItem
        cart_items = CartItem.objects.filter(user=user)
        
        if not cart_items.exists():
            raise serializers.ValidationError({"cart": "Your cart is empty."})
        
        total_price = sum(item.total_price for item in cart_items)
        
        # Create order
        order = Order.objects.create(
            user=user,
            total_price=total_price,
            **validated_data
        )
        
        # Create order items from cart
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                price=cart_item.product.discount_price if cart_item.product.discount_price else cart_item.product.price,
                quantity=cart_item.quantity
            )
            
            # Update stock
            product = cart_item.product
            product.stock -= cart_item.quantity
            product.save()
        
        # Clear cart
        cart_items.delete()
        
        return order


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('user', 'order_number', 'total_price', 'grand_total',
                           'shipping_cost', 'tax', 'created_at', 'updated_at')
