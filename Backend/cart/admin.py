from django.contrib import admin
from cart.models import CartItem


class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'total_price', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'user__email', 'product__name')
    readonly_fields = ('total_price',)


admin.site.register(CartItem, CartItemAdmin)
