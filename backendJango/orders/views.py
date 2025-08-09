
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
import logging

logger = logging.getLogger(__name__)

class OrdersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items__product')
        data = []
        for o in orders:
            data.append({
                'id': o.id,
                'status': o.status,
                'total_price': str(o.total_price),
                'created_at': o.created_at.isoformat(),
                'shipping_address': o.shipping_address,
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
                order = Order.objects.create(
                    user=request.user,
                    status='pending',
                    shipping_address=data.get('shippingAddress', ''),
                    phone_number=data.get('phoneNumber', ''),
                    payment_method=data.get('paymentMethod', ''),
                    payment_intent_id=data.get('paymentIntentId', ''),
                )

                line_results = []
                for line in items_payload:
                    product_id = line.get('product') or line.get('product_id')
                    quantity = int(line.get('quantity') or 0)
                    price = line.get('price')
                    if quantity <= 0:
                        raise ValueError('Invalid quantity')
                    product = Product.objects.select_for_update().get(id=product_id)
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
                'customer_name': o.user.get_full_name() or o.user.username,
                'customer_email': o.user.email,
                'shipping_address': o.shipping_address,
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
