from django.contrib import admin
from .models import Shop

@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "city", "is_active", "created_at")
    search_fields = ("name", "owner__username", "city")
    list_filter = ("city", "is_active")
