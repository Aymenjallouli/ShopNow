from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer
from products.models import Product
from django.shortcuts import get_object_or_404

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return Review.objects.filter(product_id=product_id)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def create(self, request, *args, **kwargs):
        product_id = self.kwargs.get('product_id')
        # Vérifier si le produit existe
        product = get_object_or_404(Product, id=product_id)
        
        # Vérifier si l'utilisateur a déjà laissé un avis sur ce produit
        if Review.objects.filter(product=product, user=request.user).exists():
            return Response(
                {"detail": "Vous avez déjà laissé un avis sur ce produit."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Ajouter l'ID du produit aux données
        data = request.data.copy()
        data['product'] = product.id
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Vérifier si l'utilisateur est le propriétaire de l'avis
        if instance.user != request.user:
            return Response(
                {"detail": "Vous n'êtes pas autorisé à modifier cet avis."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Vérifier si l'utilisateur est le propriétaire de l'avis
        if instance.user != request.user:
            return Response(
                {"detail": "Vous n'êtes pas autorisé à modifier cet avis."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Vérifier si l'utilisateur est le propriétaire de l'avis
        if instance.user != request.user:
            return Response(
                {"detail": "Vous n'êtes pas autorisé à supprimer cet avis."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
