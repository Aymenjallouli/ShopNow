from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
import json
import requests
import math

class DeliveryCalculatorView(APIView):
    """
    Calculer les frais de livraison basés sur l'adresse
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            address = data.get('address', '')
            city = data.get('city', '')
            country = data.get('country', 'TN')
            
            if not address or not city:
                return Response({
                    'error': 'Address and city are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Geocoding avec Mapbox (optionnel - pour l'instant on simule)
            # coordinates = self.geocode_address(f"{address}, {city}, {country}")
            
            # Simulation des coordonnées pour Tunis
            coordinates = {
                'latitude': 36.8065,
                'longitude': 10.1815
            }
            
            # Calculer la distance depuis le dépôt (simulation)
            depot_coords = {'latitude': 36.8000, 'longitude': 10.1800}
            distance_km = self.calculate_distance(
                depot_coords['latitude'], depot_coords['longitude'],
                coordinates['latitude'], coordinates['longitude']
            )
            
            # Calculer les frais de livraison
            delivery_fee = self.calculate_delivery_fee(distance_km, city)
            
            # Estimer le temps de livraison
            estimated_time = self.estimate_delivery_time(distance_km)
            
            return Response({
                'success': True,
                'coordinates': coordinates,
                'distance_km': round(distance_km, 2),
                'delivery_fee': float(delivery_fee),
                'estimated_delivery_time': estimated_time,
                'delivery_zones': self.get_delivery_zones()
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to calculate delivery: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """
        Calculer la distance entre deux points en km (formule haversine)
        """
        R = 6371  # Rayon de la Terre en km
        
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c

    def calculate_delivery_fee(self, distance_km, city):
        """
        Calculer les frais de livraison basés sur la distance et la ville
        """
        base_fee = Decimal('3.00')  # Frais de base en TND
        
        # Tarifs par zone
        if city.lower() in ['tunis', 'ariana', 'ben arous', 'manouba']:
            # Zone métropolitaine de Tunis
            if distance_km <= 10:
                return base_fee
            else:
                return base_fee + Decimal(str(distance_km - 10)) * Decimal('0.5')
        else:
            # Autres gouvernorats
            return base_fee + Decimal(str(distance_km)) * Decimal('0.8')

    def estimate_delivery_time(self, distance_km):
        """
        Estimer le temps de livraison en heures
        """
        if distance_km <= 5:
            return "1-2 heures"
        elif distance_km <= 15:
            return "2-4 heures"
        elif distance_km <= 50:
            return "4-8 heures"
        else:
            return "1-2 jours"

    def get_delivery_zones(self):
        """
        Retourner les zones de livraison disponibles
        """
        return [
            {
                'name': 'Grand Tunis',
                'cities': ['Tunis', 'Ariana', 'Ben Arous', 'Manouba'],
                'base_fee': 3.00,
                'max_distance': 25
            },
            {
                'name': 'Gouvernorats proches',
                'cities': ['Nabeul', 'Bizerte', 'Zaghouan'],
                'base_fee': 5.00,
                'max_distance': 100
            },
            {
                'name': 'Reste de la Tunisie',
                'cities': ['Autres gouvernorats'],
                'base_fee': 8.00,
                'max_distance': 500
            }
        ]

class DeliveryTrackingView(APIView):
    """
    Suivi des livraisons
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, tracking_number=None):
        try:
            if tracking_number:
                # Recherche par numéro de suivi
                # Pour l'instant, on simule les données
                delivery_info = {
                    'tracking_number': tracking_number,
                    'status': 'in_transit',
                    'status_display': 'En transit',
                    'estimated_delivery': '2 heures',
                    'current_location': 'Centre de tri Tunis',
                    'delivery_address': 'Simulation address',
                    'tracking_history': [
                        {
                            'timestamp': '2025-08-01T14:00:00Z',
                            'status': 'confirmed',
                            'message': 'Commande confirmée',
                            'location': 'Dépôt principal'
                        },
                        {
                            'timestamp': '2025-08-01T15:00:00Z',
                            'status': 'pickup',
                            'message': 'Colis collecté',
                            'location': 'Dépôt principal'
                        },
                        {
                            'timestamp': '2025-08-01T15:30:00Z',
                            'status': 'in_transit',
                            'message': 'En cours de livraison',
                            'location': 'Centre de tri Tunis'
                        }
                    ]
                }
                
                return Response({
                    'success': True,
                    'delivery': delivery_info
                })
            else:
                # Liste des livraisons de l'utilisateur
                return Response({
                    'success': True,
                    'deliveries': []  # Pour l'instant vide
                })
                
        except Exception as e:
            return Response({
                'error': f'Failed to track delivery: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeliveryMapView(APIView):
    """
    Données pour la carte de livraison
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Coordonnées du dépôt principal (simulation)
            depot = {
                'name': 'Dépôt Principal ShopNow',
                'address': 'Avenue Habib Bourguiba, Tunis, Tunisie',
                'coordinates': [10.1815, 36.8065],  # [longitude, latitude] pour Mapbox
                'type': 'depot'
            }
            
            # Points de livraison actifs (simulation)
            delivery_points = [
                {
                    'tracking_number': 'TRK12345',
                    'address': 'La Marsa, Tunis',
                    'coordinates': [10.3247, 36.8780],
                    'status': 'in_transit',
                    'estimated_time': '30 min'
                },
                {
                    'tracking_number': 'TRK67890',
                    'address': 'Sfax Centre',
                    'coordinates': [10.7600, 34.7400],
                    'status': 'confirmed',
                    'estimated_time': '4 heures'
                }
            ]
            
            return Response({
                'success': True,
                'depot': depot,
                'delivery_points': delivery_points,
                'mapbox_token': 'pk.eyJ1IjoiYXltZW5qYWxsb3VsaWlpIiwiYSI6ImNtZHN3ODlrcTAyZmkyanNpZmxhdmRkMjIifQ.5FjnHnl3tNxvzDjdIBmSUg'
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to load map data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
