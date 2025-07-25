from django.contrib import admin
from orders.models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('total_price',)
    extra = 0


class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'status', 'payment_status', 'total_price', 'created_at')
    list_filter = ('status', 'payment_status', 'created_at')
    search_fields = ('order_number', 'user__username', 'user__email', 'first_name', 'last_name')
    inlines = [OrderItemInline]
    readonly_fields = ('order_number', 'grand_total')
    fieldsets = (
        ('Order Info', {'fields': ('order_number', 'user', 'status', 'payment_status')}),
        ('Customer Info', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Shipping Address', {'fields': ('address', 'city', 'state', 'country', 'zip_code')}),
        ('Financial Details', {'fields': ('total_price', 'shipping_cost', 'tax', 'grand_total')}),
        ('Notes', {'fields': ('notes',)}),
    )


admin.site.register(Order, OrderAdmin)
