from rest_framework import serializers
from .models import Category
import unicodedata

def normalize_name(name: str) -> str:
    if not name:
        return ''
    name = name.strip().lower()
    # Remove accents
    name = ''.join(
        c for c in unicodedata.normalize('NFKD', name)
        if not unicodedata.combining(c)
    )
    # Collapse multiple spaces
    while '  ' in name:
        name = name.replace('  ', ' ')
    return name

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

    def validate_name(self, value):
        normalized = normalize_name(value)
        existing = Category.objects.all()
        for cat in existing:
            if normalize_name(cat.name) == normalized:
                # Return existing exact canonical form to avoid duplicates
                return cat.name
        return value

    def create(self, validated_data):
        # Attempt to find existing by normalized name
        name = validated_data.get('name')
        normalized = normalize_name(name)
        for cat in Category.objects.all():
            if normalize_name(cat.name) == normalized:
                return cat  # Re-use existing
        return super().create(validated_data)
