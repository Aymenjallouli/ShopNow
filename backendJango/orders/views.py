
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class OrdersView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Retourne une liste vide de commandes pour l'instant
        return Response({'orders': []})
