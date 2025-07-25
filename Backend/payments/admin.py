from django.contrib import admin
from payments.models import Payment


class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'order', 'payment_method', 'amount', 'status', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('transaction_id', 'user__username', 'user__email', 'order__order_number')
    readonly_fields = ('transaction_id', 'created_at', 'updated_at')


admin.site.register(Payment, PaymentAdmin)
