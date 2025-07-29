from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from products.models import Product


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        User = get_user_model()
        user_count = User.objects.count() or 0
        product_count = Product.objects.count() or 0
        # Ajoute d'autres stats si besoin, toujours numériques
        return Response({
            'user_count': int(user_count),
            'product_count': int(product_count),
        })
