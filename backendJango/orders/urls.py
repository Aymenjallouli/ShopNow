from django.urls import path
from .views import OrdersView, OrderDetailView, AdminOrdersView, CreditOrderDecisionView, ShopOwnerOrdersView
from .credit_views import MarkCreditAsPaidView, CreditStatsView, CreditsByUserView, MyCreditsView
from .delivery_views import DeliveryCalculatorView, DeliveryTrackingView, DeliveryMapView

urlpatterns = [
    path('', OrdersView.as_view(), name='orders'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('admin/', AdminOrdersView.as_view(), name='admin-orders'),
    path('credit/decision/', CreditOrderDecisionView.as_view(), name='credit-order-decision'),
    path('shop-owner/', ShopOwnerOrdersView.as_view(), name='shop-owner-orders'),
    
    # Credit management endpoints
    path('credit/mark-paid/', MarkCreditAsPaidView.as_view(), name='mark-credit-paid'),
    path('shop-owner/credit-stats/', CreditStatsView.as_view(), name='credit-stats'),
    path('shop-owner/credits-by-user/', CreditsByUserView.as_view(), name='credits-by-user'),
    path('my-credits/', MyCreditsView.as_view(), name='my-credits'),
    
    # Delivery endpoints
    path('delivery/calculate/', DeliveryCalculatorView.as_view(), name='delivery-calculate'),
    path('delivery/tracking/', DeliveryTrackingView.as_view(), name='delivery-tracking-list'),
    path('delivery/tracking/<str:tracking_number>/', DeliveryTrackingView.as_view(), name='delivery-tracking-detail'),
    path('delivery/map/', DeliveryMapView.as_view(), name='delivery-map'),
]
