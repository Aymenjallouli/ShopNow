
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.utils import timezone
import json

class OrdersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Retourne une liste vide de commandes pour l'instant
        return Response({'orders': []})
    
    def post(self, request):
        """
        Créer une nouvelle commande
        """
        try:
            data = request.data
            
            # Validation des données obligatoires
            required_fields = ['orderItems', 'shippingAddress', 'totalPrice']
            for field in required_fields:
                if field not in data:
                    return Response({
                        'error': f'Field {field} is required'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Pour l'instant, on simule la création d'une commande
            order_data = {
                'id': timezone.now().strftime('%Y%m%d%H%M%S'),  # ID simple basé sur timestamp
                'user_id': request.user.id,
                'user_email': request.user.email,
                'orderItems': data.get('orderItems', []),
                'shippingAddress': data.get('shippingAddress', ''),
                'phoneNumber': data.get('phoneNumber', ''),
                'totalPrice': data.get('totalPrice', 0),
                'status': 'pending',
                'created_at': timezone.now().isoformat(),
            }
            
            # TODO: Sauvegarder réellement en base de données
            # Pour l'instant, on retourne juste un succès
            
            return Response({
                'success': True,
                'message': 'Order created successfully',
                'order': order_data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Failed to create order: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
