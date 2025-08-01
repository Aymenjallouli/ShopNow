from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from decimal import Decimal

class DeliveryZone(models.Model):
    """
    Zones de livraison avec tarifs différents
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_per_km = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_distance_km = models.IntegerField(default=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.base_price}TND base"

class Delivery(models.Model):
    """
    Informations de livraison pour chaque commande
    """
    DELIVERY_STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('confirmed', 'Confirmée'),
        ('pickup', 'Collectée'),
        ('in_transit', 'En transit'),
        ('delivered', 'Livrée'),
        ('failed', 'Échec de livraison'),
        ('cancelled', 'Annulée'),
    ]

    # Référence à la commande (on utilisera l'ID pour l'instant)
    order_id = models.CharField(max_length=50)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Adresse de livraison
    delivery_address = models.TextField()
    delivery_city = models.CharField(max_length=100)
    delivery_state = models.CharField(max_length=100, blank=True)
    delivery_postal_code = models.CharField(max_length=20)
    delivery_country = models.CharField(max_length=100, default='TN')
    phone_number = models.CharField(max_length=20)
    
    # Coordonnées géographiques
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    # Informations de livraison
    delivery_zone = models.ForeignKey(DeliveryZone, on_delete=models.SET_NULL, null=True, blank=True)
    distance_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)
    actual_delivery_time = models.DateTimeField(null=True, blank=True)
    
    # Statut et suivi
    status = models.CharField(max_length=20, choices=DELIVERY_STATUS_CHOICES, default='pending')
    tracking_number = models.CharField(max_length=100, unique=True, blank=True)
    delivery_notes = models.TextField(blank=True)
    delivery_person_name = models.CharField(max_length=100, blank=True)
    delivery_person_phone = models.CharField(max_length=20, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Deliveries"
        ordering = ['-created_at']

    def __str__(self):
        return f"Delivery #{self.tracking_number} - {self.get_status_display()}"

    def save(self, *args, **kwargs):
        # Générer un numéro de suivi unique
        if not self.tracking_number:
            import uuid
            self.tracking_number = f"TRK{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def calculate_delivery_fee(self):
        """
        Calculer les frais de livraison basés sur la distance et la zone
        """
        if self.delivery_zone and self.distance_km:
            base_fee = self.delivery_zone.base_price
            distance_fee = self.distance_km * self.delivery_zone.price_per_km
            self.delivery_fee = base_fee + distance_fee
        else:
            # Frais par défaut si pas de zone définie
            self.delivery_fee = Decimal('5.00')
        
        return self.delivery_fee
