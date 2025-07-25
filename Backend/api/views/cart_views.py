from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from cart.models import CartItem
from api.serializers import CartItemSerializer


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def total(self, request):
        cart_items = self.get_queryset()
        total = sum(item.total_price for item in cart_items)
        items_count = cart_items.count()
        
        return Response({
            'total': total,
            'items_count': items_count
        })
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        cart_items = self.get_queryset()
        cart_items.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
