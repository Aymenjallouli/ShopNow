
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Product
from shops.models import Shop
from .serializers import ProductSerializer
from categories.models import Category
from categories.serializers import CategorySerializer


class IsShopOwnerOrAdmin(permissions.BasePermission):
    """Allow staff or owners of the product's shop."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False
        if user.is_staff:
            return True
        # user.shops is the related manager (multi-shops)
        return getattr(obj, 'shop_id', None) is not None and user.shops.filter(id=obj.shop_id).exists()

    def has_permission(self, request, view):
        if view.action in ['create', 'update', 'partial_update', 'destroy']:
            return request.user.is_authenticated and (request.user.is_staff or getattr(request.user, 'is_shop_owner', False))
        return True


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related('shop')
        # Exclude products belonging to inactive shops ALWAYS unless staff explicitly asks include_inactive=1
        if self.request.method == 'GET' and self.action in ['list', 'retrieve']:
            include_inactive = self.request.query_params.get('include_inactive') in ['1', 'true', 'True']
            if not (include_inactive and getattr(self.request.user, 'is_staff', False)):
                qs = qs.filter(shop__is_active=True)
        shop_id = self.request.query_params.get('shop')
        if shop_id:
            qs = qs.filter(shop_id=shop_id)
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsShopOwnerOrAdmin()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        """Attach a shop to the new product.

        Rules:
        - Staff can assign any existing shop by ID.
        - Non-staff (shop owners) can only assign one of their own shops.
        - Fallback: if no valid shop provided for a non-staff owner, use their first shop.
        - If still none (e.g. admin without specifying), shop remains None (product will be hidden publicly).
        """
        user = self.request.user
        shop_id = self.request.data.get('shop') or self.request.data.get('shop_id')
        shop = None
        if shop_id:
            try:
                if user.is_staff:
                    shop = Shop.objects.get(id=shop_id)
                else:
                    shop = Shop.objects.get(id=shop_id, owner=user)
            except Shop.DoesNotExist:
                shop = None
        if not shop and not user.is_staff:
            qs = getattr(user, 'shops', None)
            if qs:
                shop = qs.first()
        serializer.save(shop=shop)

    def list(self, request, *args, **kwargs):
        products_qs = self.get_queryset()
        products_data = self.get_serializer(products_qs, many=True).data
        categories_qs = Category.objects.all()
        categories_data = CategorySerializer(categories_qs, many=True).data
        return Response({
            'products': products_data,
            'categories': categories_data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def recalc_rating(self, request, pk=None):
        """Force recalcul de la note moyenne (utile si batch update avis)."""
        product = self.get_object()
        reviews = product.reviews.all()
        if not reviews:
            rating = 0
        else:
            rating = sum(r.rating for r in reviews) / reviews.count()
        # Pas de champ persistant rating: juste renvoi
        return Response({'id': product.id, 'rating': rating})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my(self, request):
        """Products belonging to any shop owned by the user; optional ?shop=id filter."""
        user = request.user
        shop_id = request.query_params.get('shop')
        qs = self.get_queryset().filter(shop__owner=user)
        if shop_id:
            qs = qs.filter(shop_id=shop_id)
        data = self.get_serializer(qs, many=True).data
        return Response({'products': data})
