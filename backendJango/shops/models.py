from django.db import models
from django.conf import settings
from django.utils import timezone

class Shop(models.Model):
    # Allow multiple shops per owner (changed from OneToOneField)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shops')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    # Localisation exacte
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='TN')
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['city']),
            models.Index(fields=['is_active']),
        ]
        unique_together = [('name', 'city')]

    def __str__(self):
        return f"{self.name} ({self.owner.username})"
