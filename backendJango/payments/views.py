from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import stripe
from django.conf import settings
import json
import logging
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

logger = logging.getLogger(__name__)

# Configuration Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Créer un PaymentIntent Stripe pour le processus de paiement
    """
    try:
        data = json.loads(request.body)
        amount = data.get('amount')
        currency = data.get('currency', 'usd')
        
        if not amount:
            return Response({
                'error': 'Amount is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer le PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=int(amount),  # Amount in cents
            currency=currency,
            automatic_payment_methods={
                'enabled': True,
            },
            metadata={
                'user_id': request.user.id,
                'user_email': request.user.email,
            }
        )
        
        return Response({
            'clientSecret': intent.client_secret,
            'paymentIntentId': intent.id
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Payment intent creation error: {e}")
        return Response({
            'error': 'An error occurred while creating payment intent'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_d17_payment(request):
    """
    Créer une transaction d17 pour les clients tunisiens
    """
    try:
        data = json.loads(request.body)
        amount = data.get('amount')
        phone_number = data.get('phone_number')
        
        if not amount or not phone_number:
            return Response({
                'error': 'Amount and phone number are required for d17 payment'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Configuration d17
        d17_api_key = os.getenv('D17_API_KEY')
        d17_api_url = os.getenv('D17_API_URL', 'https://api.d17.tn/v1')
        
        # Ici vous devrez intégrer l'API d17 réelle
        # Pour l'instant, simulation d'une réponse d17
        d17_response = {
            'transaction_id': f"d17_{request.user.id}_{amount}_{hash(phone_number) % 10000}",
            'status': 'pending',
            'payment_url': f"https://d17.tn/pay?amount={amount}&phone={phone_number}&merchant_id=your_merchant_id",
            'phone_number': phone_number,
            'amount': amount,
            'currency': 'TND'  # Dinar Tunisien
        }
        
        return Response({
            'success': True,
            'transaction_id': d17_response['transaction_id'],
            'payment_url': d17_response['payment_url'],
            'status': d17_response['status'],
            'currency': d17_response['currency']
        })
        
    except Exception as e:
        logger.error(f"D17 payment creation error: {e}")
        return Response({
            'error': 'An error occurred while creating d17 payment'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_d17_payment(request):
    """
    Vérifier le statut d'un paiement d17
    """
    try:
        data = json.loads(request.body)
        transaction_id = data.get('transaction_id')
        
        if not transaction_id:
            return Response({
                'error': 'Transaction ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Ici vous devrez intégrer l'API d17 pour vérifier le statut
        # Simulation pour l'instant
        payment_status = 'completed'  # ou 'pending', 'failed'
        
        return Response({
            'transaction_id': transaction_id,
            'status': payment_status,
            'verified': True,
            'amount': 0,  # Amount from d17 API
            'currency': 'TND'
        })
        
    except Exception as e:
        logger.error(f"D17 payment verification error: {e}")
        return Response({
            'error': 'An error occurred while verifying d17 payment'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_methods(request):
    """
    Retourner les méthodes de paiement disponibles selon la localisation
    """
    try:
        # Détecter le pays de l'utilisateur (vous pouvez utiliser l'IP ou le profil utilisateur)
        user_country = getattr(request.user, 'country', 'US')
        
        payment_methods = {
            'stripe': {
                'enabled': True,
                'currencies': ['USD', 'EUR'],
                'name': 'Credit/Debit Card'
            }
        }
        
        # Ajouter d17 si l'utilisateur est en Tunisie
        if user_country == 'TN' or user_country == 'Tunisia':
            payment_methods['d17'] = {
                'enabled': True,
                'currencies': ['TND'],
                'name': 'D17 Mobile Payment',
                'description': 'Paiement mobile via d17'
            }
        
        return Response({
            'payment_methods': payment_methods,
            'user_country': user_country
        })
        
    except Exception as e:
        logger.error(f"Get payment methods error: {e}")
        return Response({
            'error': 'An error occurred while fetching payment methods'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
