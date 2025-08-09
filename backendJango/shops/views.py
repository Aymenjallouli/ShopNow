from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Shop
from .serializers import ShopSerializer
from products.models import Product
from categories.models import Category

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.owner_id == request.user.id

    def has_permission(self, request, view):
        if view.action == 'create':
            # Allow staff OR authenticated shop owner to create
            user = request.user
            return user.is_authenticated and (user.is_staff or getattr(user, 'is_shop_owner', False))
        return True

class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrAdmin()]
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # Admin can specify an owner id; otherwise defaults to current user
        owner = self.request.user
        owner_id = self.request.data.get('owner')
        if self.request.user.is_staff and owner_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                owner = User.objects.get(pk=owner_id)
            except User.DoesNotExist:
                pass  # fallback to request.user
        serializer.save(owner=owner)

    def perform_update(self, serializer):
        # Only staff can reassign owner
        if not self.request.user.is_staff:
            serializer.validated_data.pop('owner', None)
        serializer.save()

    def get_queryset(self):
        qs = super().get_queryset()
        # Annotate product counts for lightweight badges (available & total)
        try:
            from django.db.models import Count, Q
            qs = qs.annotate(
                total_products=Count('products', distinct=True),
                available_products=Count('products', filter=Q(products__status='available'), distinct=True)
            )
        except Exception:
            pass
        # Allow filtering by city or owner
        owner_id = self.request.query_params.get('owner')
        if owner_id:
            qs = qs.filter(owner_id=owner_id)
        city = self.request.query_params.get('city')
        if city:
            qs = qs.filter(city__iexact=city)
        return qs

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        shop = self.get_object()
        qs = Product.objects.filter(shop=shop)
        total_products = qs.count()
        available = qs.filter(status='available').count()
        unavailable = total_products - available
        categories = qs.values('category__name').exclude(category__name__isnull=True).order_by('category__name')
        cat_counts = {}
        for row in categories:
            name = row['category__name']
            cat_counts[name] = cat_counts.get(name, 0) + 1
        return Response({
            'shop_id': shop.id,
            'total_products': total_products,
            'available_products': available,
            'unavailable_products': unavailable,
            'categories': [ {'name': k, 'count': v} for k,v in cat_counts.items() ],
            'created_at': shop.created_at,
            'updated_at': shop.updated_at,
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def toggle_active(self, request, pk=None):
        """Admin toggle active status of a shop."""
        shop = self.get_object()
        shop.is_active = not shop.is_active
        shop.save(update_fields=['is_active'])
        serializer = self.get_serializer(shop)
        return Response({'status': 'ok', 'is_active': shop.is_active, 'shop': serializer.data})
