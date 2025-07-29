from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError({'detail': 'Email ou mot de passe invalide.'})
        else:
            raise serializers.ValidationError({'detail': 'Email et mot de passe sont requis.'})
        attrs['username'] = email  # Pour compatibilité avec SimpleJWT
        return super().validate(attrs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
