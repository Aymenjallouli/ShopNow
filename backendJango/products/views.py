
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer


from categories.models import Category
from categories.serializers import CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def list(self, request, *args, **kwargs):
        products_qs = self.get_queryset()
        products_data = self.get_serializer(products_qs, many=True).data
        categories_qs = Category.objects.all()
        categories_data = CategorySerializer(categories_qs, many=True).data
        return Response({
            'products': products_data,
            'categories': categories_data
        })
