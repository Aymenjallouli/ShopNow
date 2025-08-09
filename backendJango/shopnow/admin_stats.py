from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from django.utils.timezone import now, timedelta
from django.db.models import Count, Sum
from products.models import Product
from categories.models import Category
from orders.models import Order


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        User = get_user_model()
        # Basic counts
        user_count = User.objects.count() or 0
        product_count = Product.objects.count() or 0
        order_qs = Order.objects.all()
        total_orders = order_qs.count() or 0
        total_revenue = order_qs.aggregate(s=Sum('total_price'))['s'] or 0

        # Recent activity windows
        last_7 = now() - timedelta(days=7)
        recent_orders_qs = order_qs.order_by('-created_at')[:10]
        recent_orders = [
            {
                'id': o.id,
                'customer': o.user.get_full_name() or o.user.username,
                'total': float(o.total_price),
                'status': o.status,
                'created_at': o.created_at.isoformat(),
            } for o in recent_orders_qs
        ]

        new_users_qs = User.objects.filter(date_joined__gte=last_7).order_by('-date_joined')[:10]
        new_users = [
            {
                'id': u.id,
                'name': (u.get_full_name() or u.username),
                'email': u.email,
                'date': u.date_joined.isoformat(),
            } for u in new_users_qs
        ]

        # Top categories by product count (limit 8)
        # Related name from Product to Category is default 'product_set'; Count uses model name lowercase
        top_categories_qs = Category.objects.annotate(products_count=Count('product')).order_by('-products_count')[:8]
        top_categories = [
            {
                'id': c.id,
                'name': c.name,
                'productsCount': c.products_count,
            } for c in top_categories_qs if c.products_count
        ]

        # Low stock products (stock < 5) limit 10
        low_stock_qs = Product.objects.filter(stock__lt=5).order_by('stock', '-updated_at' if hasattr(Product, 'updated_at') else 'id')[:10]
        low_stock_products = [
            {
                'id': p.id,
                'name': p.name,
                'stock': p.stock,
                'price': float(p.price),
            } for p in low_stock_qs
        ]

        return Response({
            'totalUsers': int(user_count),
            'totalProducts': int(product_count),
            'totalOrders': int(total_orders),
            'totalRevenue': float(total_revenue),
            'recentOrders': recent_orders,
            'newUsers': new_users,
            'topCategories': top_categories,
            'lowStockProducts': low_stock_products,
        })
