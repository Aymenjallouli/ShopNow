from rest_framework import serializers
from .models import Shop

class ShopSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    total_products = serializers.IntegerField(read_only=True)
    available_products = serializers.IntegerField(read_only=True)

    class Meta:
        model = Shop
        fields = [
            'id', 'name', 'description', 'owner', 'owner_username',
            'address', 'city', 'state', 'country', 'latitude', 'longitude',
            'is_active', 'created_at', 'updated_at', 'total_products', 'available_products'
        ]
    # owner can be provided by admin when creating; non-admin attempts ignored in view logic
    read_only_fields = ['id', 'owner_username', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Owner is enforced/validated in view (perform_create)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Prevent non-staff from changing owner if owner passed
        request = self.context.get('request')
        if request and not request.user.is_staff and 'owner' in validated_data:
            validated_data.pop('owner')
        return super().update(instance, validated_data)
