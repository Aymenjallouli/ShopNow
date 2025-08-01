from django.contrib import admin
from .models import Wishlist

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'added_at')
    list_filter = ('added_at', 'product__category')
    search_fields = ('user__username', 'user__email', 'product__name')
    readonly_fields = ('added_at',)
    raw_id_fields = ('user', 'product')
