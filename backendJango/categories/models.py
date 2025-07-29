from django.db import models


class Category(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    image = models.URLField(blank=True, null=True)  # URL Cloudinary

    def __str__(self):
        return self.name
