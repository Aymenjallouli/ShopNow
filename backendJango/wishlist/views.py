from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Wishlist
from .serializers import WishlistSerializer
from products.models import Product

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        product_id = serializer.validated_data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise serializers.ValidationError({'product_id': 'Product not found'})
        
        # Check if already in wishlist
        if Wishlist.objects.filter(user=self.request.user, product=product).exists():
            raise serializers.ValidationError({'detail': 'Product already in wishlist'})
        
        serializer.save(user=self.request.user, product=product)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Clear all items from wishlist"""
        deleted_count = self.get_queryset().delete()[0]
        return Response({
            'message': f'Removed {deleted_count} items from wishlist'
        })

    @action(detail=False, methods=['get'])
    def check(self, request):
        """Check if a product is in wishlist"""
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        exists = self.get_queryset().filter(product_id=product_id).exists()
        return Response({'in_wishlist': exists})
