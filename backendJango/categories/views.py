from rest_framework import viewsets, permissions
from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        # Everyone can list / retrieve categories
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # Shop owners and admins can create (dedup logic in serializer prevents duplicates)
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        # Only admins can update / delete categories (to avoid uncontrolled global changes)
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        user = self.request.user
        # Only allow creation if admin or shop owner
        if not (user.is_staff or getattr(user, 'is_shop_owner', False)):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Seuls les administrateurs ou shop owners peuvent créer une catégorie.')
        serializer.save()
