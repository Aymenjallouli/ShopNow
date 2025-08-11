
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from .models import Order


class MarkCreditAsPaidView(APIView):
    """Marquer un crédit comme payé (Shop Owner)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        if not (request.user.is_staff or getattr(request.user, 'role', '') == 'shop_owner'):
            return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
        
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'error': 'order_id requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Vérifier que le shop owner possède bien ce shop
            from shops.models import Shop
            shop_ids = list(Shop.objects.filter(owner=request.user).values_list('id', flat=True))
            order = Order.objects.get(id=order_id, shop_id__in=shop_ids)
            
            if order.credit_status not in ['approved']:
                return Response({'error': 'Ce crédit ne peut pas être marqué comme payé'}, status=status.HTTP_400_BAD_REQUEST)
            
            order.credit_status = 'paid'
            order.save()
            
            return Response({'message': 'Crédit marqué comme payé', 'order_id': order.id})
            
        except Order.DoesNotExist:
            return Response({'error': 'Commande non trouvée ou non autorisée'}, status=status.HTTP_404_NOT_FOUND)


class CreditStatsView(APIView):
    """Statistiques des crédits pour shop owner."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or getattr(request.user, 'role', '') == 'shop_owner'):
            return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
        
        from shops.models import Shop
        from django.db.models import Sum, Count, Q
        
        shop_ids = list(Shop.objects.filter(owner=request.user).values_list('id', flat=True))
        
        # Statistiques globales
        credit_orders = Order.objects.filter(
            shop_id__in=shop_ids,
            payment_method='credit'
        )
        
        stats = credit_orders.aggregate(
            total_credits=Count('id'),
            total_amount=Sum('total_price') or 0,
            paid_count=Count('id', filter=Q(credit_status='paid')),
            paid_amount=Sum('total_price', filter=Q(credit_status='paid')) or 0,
            unpaid_count=Count('id', filter=Q(credit_status='approved')),
            unpaid_amount=Sum('total_price', filter=Q(credit_status='approved')) or 0,
            pending_count=Count('id', filter=Q(credit_status='requested')),
            pending_amount=Sum('total_price', filter=Q(credit_status='requested')) or 0
        )
        
        return Response(stats)


class CreditsByUserView(APIView):
    """Crédits groupés par utilisateur pour shop owner."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or getattr(request.user, 'role', '') == 'shop_owner'):
            return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
        
        from shops.models import Shop
        from django.db.models import Sum, Count, Q
        
        shop_ids = list(Shop.objects.filter(owner=request.user).values_list('id', flat=True))
        
        # Grouper par utilisateur
        users_credits = Order.objects.filter(
            shop_id__in=shop_ids,
            payment_method='credit'
        ).values(
            'user__id',
            'user__username', 
            'user__email',
            'user__first_name',
            'user__last_name'
        ).annotate(
            total_orders=Count('id'),
            total_amount=Sum('total_price'),
            paid_amount=Sum('total_price', filter=Q(credit_status='paid')),
            unpaid_amount=Sum('total_price', filter=Q(credit_status='approved'))
        ).order_by('-total_amount')
        
        return Response(list(users_credits))


class MyCreditsView(APIView):
    """Crédits du client connecté."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        upcoming = request.query_params.get('upcoming') == 'true'
        
        qs = Order.objects.filter(
            user=request.user,
            payment_method='credit'
        ).prefetch_related('items__product', 'shop')
        
        if upcoming:
            # Crédits à payer dans les 7 jours
            from datetime import datetime, timedelta
            upcoming_date = datetime.now().date() + timedelta(days=7)
            qs = qs.filter(
                credit_status='approved',
                payment_due_date__lte=upcoming_date,
                payment_due_date__gte=datetime.now().date()
            )
        
        data = []
        for o in qs:
            data.append({
                'id': o.id,
                'status': o.status,
                'credit_status': o.credit_status,
                'total_price': str(o.total_price),
                'created_at': o.created_at.isoformat(),
                'payment_due_date': o.payment_due_date.isoformat() if o.payment_due_date else None,
                'shop': {
                    'id': o.shop.id,
                    'name': o.shop.name,
                    'address': o.shop.address,
                    'city': o.shop.city,
                    'owner_name': f"{o.shop.owner.first_name} {o.shop.owner.last_name}".strip() or o.shop.owner.username,
                } if o.shop else None,
                'items': [
                    {
                        'product_id': it.product_id,
                        'product_name': it.product.name,
                        'quantity': it.quantity,
                        'price': str(it.price),
                        'subtotal': str(it.subtotal),
                    } for it in o.items.all()
                ]
            })
        
        return Response({'credits': data})
