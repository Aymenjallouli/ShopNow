
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from django.utils import timezone
from django.db import transaction
from django.db.models import Count, Sum, F
from django.utils.timezone import now, timedelta
from products.models import Product
from .models import Order, OrderItem
from shops.models import Shop
from django.utils.timezone import now as tz_now
import logging

logger = logging.getLogger(__name__)

class OrdersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items__product', 'shop')
        data = []
        for o in orders:
            data.append({
                'id': o.id,
                'status': o.status,
                'total_price': str(o.total_price),
                'created_at': o.created_at.isoformat(),
                'shipping_address': o.shipping_address,
                'payment_method': o.payment_method,
                'credit_status': o.credit_status,
                'payment_due_date': o.payment_due_date.isoformat() if o.payment_due_date else None,
                'shop': {
                    'id': o.shop.id,
                    'name': o.shop.name,
                    'address': o.shop.address,
                    'city': o.shop.city,
                    'owner_name': f"{o.shop.owner.first_name} {o.shop.owner.last_name}".strip() or o.shop.owner.username,
                } if o.shop else None,
                'customer': {
                    'id': o.user.id,
                    'username': o.user.username,
                    'email': o.user.email,
                    'first_name': o.user.first_name,
                    'last_name': o.user.last_name,
                    'phone_number': getattr(o.user, 'phone_number', None),
                } if o.user else None,
                'items': [
                    {
                        'product_id': it.product_id,
                        'product_name': it.product.name,
                        'quantity': it.quantity,
                        'price': str(it.price),
                        'subtotal': str(it.subtotal),
                        'remaining_stock': it.product.stock,
                    } for it in o.items.all()
                ],
                'status_history': [
                    {
                        'from': h.from_status,
                        'to': h.to_status,
                        'changed_at': h.changed_at.isoformat(),
                    } for h in o.status_history.all()
                ]
            })
        return Response({'orders': data})
    
    def post(self, request):
        data = request.data
        required_fields = ['orderItems', 'shippingAddress', 'totalPrice']
        for field in required_fields:
            if field not in data:
                return Response({'error': f'Field {field} is required'}, status=status.HTTP_400_BAD_REQUEST)

        items_payload = data.get('orderItems', [])
        if not items_payload:
            return Response({'error': 'orderItems empty'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                payment_method = data.get('paymentMethod', '') or ''
                is_credit = payment_method == 'credit'
                # Collect distinct shops for credit validation
                distinct_shops = set()
                temp_lines = []
                for line in items_payload:
                    product_id = line.get('product') or line.get('product_id')
                    quantity = int(line.get('quantity') or 0)
                    if quantity <= 0:
                        raise ValueError('Invalid quantity')
                    product = Product.objects.get(id=product_id)
                    temp_lines.append((product, quantity, line.get('price')))
                    if product.shop_id:
                        distinct_shops.add(product.shop_id)
                order_shop = None
                if len(distinct_shops) == 1:
                    # Un seul shop: on peut l'affecter à la commande
                    order_shop = Shop.objects.get(id=list(distinct_shops)[0])
                if is_credit and len(distinct_shops) != 1:
                    return Response({'error': "Le paiement à crédit n'est possible que si tous les produits proviennent du même shop."}, status=status.HTTP_400_BAD_REQUEST)
                
                # Pour crédit: récupérer la date de paiement prévue
                payment_due_date = None
                if is_credit:
                    due_date_str = data.get('paymentDueDate')
                    if due_date_str:
                        from datetime import datetime
                        try:
                            payment_due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
                        except ValueError:
                            return Response({'error': 'Format de date invalide pour paymentDueDate (YYYY-MM-DD)'}, status=status.HTTP_400_BAD_REQUEST)
                
                order = Order.objects.create(
                    user=request.user,
                    status='pending',
                    shipping_address=data.get('shippingAddress', ''),
                    phone_number=data.get('phoneNumber', ''),
                    payment_method=payment_method,
                    payment_intent_id=data.get('paymentIntentId', ''),
                    credit_status='requested' if is_credit else 'none',
                    shop=order_shop,
                    payment_due_date=payment_due_date,
                )

                line_results = []
                for product, quantity, price in temp_lines:
                    product = Product.objects.select_for_update().get(id=product.id)
                    if quantity > product.stock:
                        raise ValueError(f'Stock insuffisant pour le produit {product.name}')
                    product.stock -= quantity
                    if product.stock == 0:
                        product.status = 'unavailable'
                    product.save(update_fields=['stock', 'status'])
                    item = OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        price=price,
                    )
                    line_results.append({
                        'product_id': product.id,
                        'product_name': product.name,
                        'quantity': quantity,
                        'price': str(item.price),
                        'subtotal': str(item.subtotal),
                        'remaining_stock': product.stock,
                    })

                order.recalc_total()

        except Product.DoesNotExist:
            return Response({'error': 'Produit introuvable'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as ve:
            return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log full context for debugging 500 errors
            logger.exception("Order creation failed", extra={
                'user_id': getattr(request.user, 'id', None),
                'payload_items': items_payload,
                'shippingAddress': data.get('shippingAddress'),
                'paymentMethod': data.get('paymentMethod'),
            })
            return Response({'error': f'Erreur création commande: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'order': {
                'id': order.id,
                'status': order.status,
                'total_price': str(order.total_price),
                'created_at': order.created_at.isoformat(),
                'payment_method': order.payment_method,
                'credit_status': order.credit_status,
                'shop_id': order.shop_id,
                'payment_due_date': order.payment_due_date.isoformat() if order.payment_due_date else None,
                'shipping_address': order.shipping_address,
                'items': line_results,
                'status_history': [
                    {
                        'from': h.from_status,
                        'to': h.to_status,
                        'changed_at': h.changed_at.isoformat(),
                    } for h in order.status_history.all()
                ],
            }
        }, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user, pk):
        return Order.objects.filter(user=user).prefetch_related('items__product', 'status_history').get(pk=pk)

    def get(self, request, pk):
        try:
            order = self.get_object(request.user, pk)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        data = {
            'id': order.id,
            'status': order.status,
            'total_price': str(order.total_price),
            'created_at': order.created_at.isoformat(),
            'items': [
                {
                    'product_id': it.product_id,
                    'product_name': it.product.name,
                    'quantity': it.quantity,
                    'price': str(it.price),
                    'subtotal': str(it.subtotal),
                    'remaining_stock': it.product.stock,
                } for it in order.items.all()
            ],
            'status_history': [
                {
                    'from': h.from_status,
                    'to': h.to_status,
                    'changed_at': h.changed_at.isoformat(),
                } for h in order.status_history.all()
            ]
        }
        return Response({'order': data})

    def patch(self, request, pk):
        # Allow user to cancel their own order if still pending/processing
        action = request.data.get('action')
        try:
            order = self.get_object(request.user, pk)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if action == 'cancel':
            if order.status in ['pending', 'processing']:
                order.status = 'cancelled'
                order.save(update_fields=['status'])
                # Return full refreshed order representation
                order.refresh_from_db()
                data = {
                    'id': order.id,
                    'status': order.status,
                    'total_price': str(order.total_price),
                    'created_at': order.created_at.isoformat(),
                    'shipping_address': order.shipping_address,
                    'items': [
                        {
                            'product_id': it.product_id,
                            'product_name': it.product.name,
                            'quantity': it.quantity,
                            'price': str(it.price),
                            'subtotal': str(it.subtotal),
                            'remaining_stock': it.product.stock,
                        } for it in order.items.all()
                    ],
                    'status_history': [
                        {
                            'from': h.from_status,
                            'to': h.to_status,
                            'changed_at': h.changed_at.isoformat(),
                        } for h in order.status_history.all()
                    ]
                }
                return Response({'order': data})
            return Response({'error': 'Cannot cancel at this stage'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'error': 'Unsupported action'}, status=status.HTTP_400_BAD_REQUEST)


class AdminOrdersView(APIView):
    """Admin listings + stats for all orders"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Optional filters
        status_filter = request.query_params.get('status')
        qs = Order.objects.all().prefetch_related('items__product', 'status_history', 'user')
        if status_filter and status_filter != 'all':
            qs = qs.filter(status=status_filter)

        orders_data = []
        for o in qs[:500]:  # safety cap
            orders_data.append({
                'id': o.id,
                'status': o.status,
                'total_price': str(o.total_price),
                'created_at': o.created_at.isoformat(),
                'payment_method': o.payment_method,
                'credit_status': o.credit_status,
                'customer_name': o.user.get_full_name() or o.user.username,
                'customer_email': o.user.email,
                'shipping_address': o.shipping_address,
                'shop_id': o.shop_id,
                'items': [
                    {
                        'product_id': it.product_id,
                        'product_name': it.product.name,
                        'quantity': it.quantity,
                        'price': str(it.price),
                        'subtotal': str(it.subtotal),
                    } for it in o.items.all()
                ],
                'status_history': [
                    {
                        'from': h.from_status,
                        'to': h.to_status,
                        'changed_at': h.changed_at.isoformat(),
                    } for h in o.status_history.all()
                ]
            })

        # Stats section
        total_orders = Order.objects.count()
        total_revenue = Order.objects.aggregate(s=Sum('total_price'))['s'] or 0
        status_counts = Order.objects.values('status').annotate(c=Count('id'))
        status_map = {row['status']: row['c'] for row in status_counts}

        last_30 = now() - timedelta(days=30)
        revenue_30 = Order.objects.filter(created_at__gte=last_30).aggregate(s=Sum('total_price'))['s'] or 0
        orders_30 = Order.objects.filter(created_at__gte=last_30).count()

        stats = {
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'orders_last_30d': orders_30,
            'revenue_last_30d': float(revenue_30),
            'status_breakdown': status_map,
        }

        return Response({'orders': orders_data, 'stats': stats})

    def patch(self, request):
        order_id = request.data.get('order_id')
        new_status = request.data.get('status')
        if not order_id or not new_status:
            return Response({'error': 'order_id and status required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        old = order.status
        if old == new_status:
            return Response({'message': 'No change', 'order_id': order.id})
        order.status = new_status
        order.save(update_fields=['status'])
        return Response({'message': 'updated', 'order_id': order.id, 'status': order.status})


class CreditOrderDecisionView(APIView):
    """Shop owner ou admin peut approuver / rejeter une demande de crédit."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        order_id = request.data.get('order_id')
        action = request.data.get('action')  # approve / reject / mark_paid
        note = request.data.get('note', '')
        if not order_id or action not in ['approve', 'reject', 'mark_paid']:
            return Response({'error': 'order_id et action (approve|reject|mark_paid) requis'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            order = Order.objects.select_related('shop__owner').get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Commande introuvable'}, status=status.HTTP_404_NOT_FOUND)
        # Vérifier droit: admin ou propriétaire du shop lié
        is_admin = getattr(request.user, 'is_staff', False)
        is_owner = order.shop and order.shop.owner_id == request.user.id
        if not (is_admin or is_owner):
            return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
        
        if action == 'mark_paid':
            # Marquer le crédit comme payé (disponible pour les crédits approuvés)
            if order.credit_status != 'approved':
                return Response({'error': 'Seuls les crédits approuvés peuvent être marqués comme payés'}, status=status.HTTP_400_BAD_REQUEST)
            order.credit_status = 'paid'
            order.status = 'completed'  # Marquer la commande comme terminée
        elif order.credit_status != 'requested':
            return Response({'error': 'Statut crédit non modifiable'}, status=status.HTTP_400_BAD_REQUEST)
        elif action == 'approve':
            order.credit_status = 'approved'
            # Option: passer la commande en processing
            if order.status == 'pending':
                order.status = 'processing'
        elif action == 'reject':
            order.credit_status = 'rejected'
            # On peut annuler la commande si rejet
            order.status = 'cancelled'
            
        order.credit_decision_at = tz_now()
        order.credit_decision_by = request.user
        order.credit_note = note
        order.save(update_fields=['credit_status', 'credit_decision_at', 'credit_decision_by', 'credit_note', 'status'])
        return Response({
            'order_id': order.id,
            'credit_status': order.credit_status,
            'status': order.status,
            'credit_decision_at': order.credit_decision_at.isoformat() if order.credit_decision_at else None,
        })


class ShopOwnerOrdersView(APIView):
    """Liste des commandes (et crédits) liées aux shops du propriétaire."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Vérifier qu'il est propriétaire ou admin
        if not (request.user.is_staff or getattr(request.user, 'role', '') == 'shop_owner'):
            return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
        # Shops de l'utilisateur
        from shops.models import Shop
        shop_ids = list(Shop.objects.filter(owner=request.user).values_list('id', flat=True))
        qs = Order.objects.filter(shop_id__in=shop_ids).prefetch_related('items__product', 'status_history', 'user', 'shop')
        
        credit_only = request.query_params.get('credit') == '1'
        exclude_credit = request.query_params.get('exclude_credit') == '1'
        
        if credit_only:
            qs = qs.filter(credit_status__in=['requested', 'approved'])
        elif exclude_credit:
            # Exclure les commandes avec crédit (inclut les crédits en attente, approuvés, etc.)
            qs = qs.exclude(credit_status__in=['requested', 'approved', 'paid'])
            
        data = []
        for o in qs[:500]:
            data.append({
                'id': o.id,
                'status': o.status,
                'payment_method': o.payment_method,
                'credit_status': o.credit_status,
                'total_price': str(o.total_price),
                'created_at': o.created_at.isoformat(),
                'shipping_address': o.shipping_address,
                'customer': {
                    'id': o.user.id,
                    'username': o.user.username,
                    'email': o.user.email,
                    'first_name': o.user.first_name,
                    'last_name': o.user.last_name,
                    'full_name': o.user.get_full_name() or o.user.username,
                    'phone_number': getattr(o.user, 'phone_number', None),
                } if o.user else None,
                'customer_name': o.user.get_full_name() or o.user.username,
                'customer_email': o.user.email,
                'shop_id': o.shop_id,
                'shop_name': o.shop.name if o.shop else None,
                'payment_due_date': o.payment_due_date.isoformat() if o.payment_due_date else None,
                'items': [
                    {
                        'product_id': it.product_id,
                        'product_name': it.product.name,
                        'quantity': it.quantity,
                        'price': str(it.price),
                        'subtotal': str(it.subtotal),
                    } for it in o.items.all()
                ],
                'status_history': [
                    {
                        'from': h.from_status,
                        'to': h.to_status,
                        'changed_at': h.changed_at.isoformat(),
                    } for h in o.status_history.all()
                ]
            })
        return Response({'orders': data})
