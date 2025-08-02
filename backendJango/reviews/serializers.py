from rest_framework import serializers
from .models import Review
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'rating', 'title', 'comment', 'created_at', 'product', 'user']
        read_only_fields = ['created_at', 'user']
        
    def create(self, validated_data):
        # Assigner l'utilisateur actuel à la critique
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
