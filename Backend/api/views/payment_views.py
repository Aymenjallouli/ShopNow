from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
from django.shortcuts import get_object_or_404
import stripe
from orders.models import Order
from payments.models import Payment
from api.serializers import PaymentSerializer, StripePaymentIntentSerializer, StripePaymentConfirmSerializer

# Configure Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(user=user)
    
    @action(detail=False, methods=['post'])
    def create_payment_intent(self, request):
        serializer = StripePaymentIntentSerializer(data=request.data)
        
        if serializer.is_valid():
            order_id = serializer.validated_data['order_id']
            order = get_object_or_404(Order, id=order_id, user=request.user)
            
            # Check if payment already exists
            if Payment.objects.filter(order=order, status='completed').exists():
                return Response(
                    {"detail": "Payment already completed for this order."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create a payment intent with Stripe
            try:
                amount = int(order.grand_total * 100)  # Convert to cents
                
                payment_intent = stripe.PaymentIntent.create(
                    amount=amount,
                    currency='usd',
                    metadata={
                        'order_id': order.id,
                        'user_id': request.user.id
                    }
                )
                
                return Response({
                    'clientSecret': payment_intent.client_secret,
                    'amount': amount
                })
                
            except stripe.error.StripeError as e:
                return Response(
                    {"detail": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def confirm_payment(self, request):
        serializer = StripePaymentConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            payment_intent_id = serializer.validated_data['payment_intent_id']
            order_id = serializer.validated_data['order_id']
            
            order = get_object_or_404(Order, id=order_id, user=request.user)
            
            try:
                # Retrieve payment intent
                payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
                
                # Verify payment was successful
                if payment_intent.status == 'succeeded':
                    # Create payment record
                    payment = Payment.objects.create(
                        user=request.user,
                        order=order,
                        payment_method='stripe',
                        amount=order.grand_total,
                        status='completed',
                        transaction_id=payment_intent_id
                    )
                    
                    # Update order status
                    order.payment_status = 'completed'
                    order.status = 'processing'
                    order.save()
                    
                    return Response({
                        'status': 'success',
                        'message': 'Payment successful',
                        'payment_id': payment.id
                    })
                
                return Response(
                    {"detail": "Payment not successful."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            except stripe.error.StripeError as e:
                return Response(
                    {"detail": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
