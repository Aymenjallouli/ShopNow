from rest_framework import serializers


class StripePaymentIntentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    
    
class StripePaymentConfirmSerializer(serializers.Serializer):
    payment_intent_id = serializers.CharField()
    order_id = serializers.IntegerField()
