from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True, required=False)
    role = serializers.ChoiceField(choices=get_user_model().ROLE_CHOICES, required=False)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'phone_number', 'address', 'city', 'state', 'country', 'zip_code', 'date_of_birth', 'is_staff', 'role'
        )

    def validate(self, data):
        if data.get('password2') and data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': "Les mots de passe ne correspondent pas."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2', None)
        username = validated_data.get('username')
        if not username:
            username = validated_data['email']
        user = User.objects.create_user(
            username=username,
            email=validated_data.get('email'),
            password=validated_data.get('password'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number'),
            address=validated_data.get('address'),
            city=validated_data.get('city'),
            state=validated_data.get('state'),
            country=validated_data.get('country'),
            zip_code=validated_data.get('zip_code'),
            date_of_birth=validated_data.get('date_of_birth'),
            is_staff=validated_data.get('is_staff', False),
            role=validated_data.get('role', 'customer'),
        )
        return user

    def update(self, instance, validated_data):
        # Remove password fields for updates (handle separately if needed)
        validated_data.pop('password', None)
        validated_data.pop('password2', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management with status field"""
    status = serializers.CharField(required=False)
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone_number', 'address', 'city', 'state', 'country', 
            'zip_code', 'date_of_birth', 'is_staff', 'is_active', 'status', 'role'
        )
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Map is_active to status for frontend compatibility
        representation['status'] = 'active' if instance.is_active else 'inactive'
        return representation
    
    def update(self, instance, validated_data):
        # Handle status field conversion
        if 'status' in validated_data:
            status = validated_data.pop('status')
            validated_data['is_active'] = status == 'active'
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
