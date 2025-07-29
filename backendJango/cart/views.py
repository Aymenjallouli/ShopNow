
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = request.session.get('cart', [])
        return Response({'cart': cart})

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        if not product_id:
            return Response({'error': 'product_id is required'}, status=400)
        # On ajoute simplement l'ID et la quantité dans la session (pas de modèle DB pour le panier)
        cart = request.session.get('cart', [])
        # Vérifier si le produit est déjà dans le panier
        for item in cart:
            if item['product_id'] == product_id:
                item['quantity'] += quantity
                break
        else:
            cart.append({'product_id': product_id, 'quantity': quantity})
        request.session['cart'] = cart
        return Response({'cart': cart, 'message': 'Produit ajouté au panier'})
