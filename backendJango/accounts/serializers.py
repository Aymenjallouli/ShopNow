from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'phone_number', 'address', 'city', 'state', 'country', 'zip_code', 'date_of_birth'
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
        )
        return user
