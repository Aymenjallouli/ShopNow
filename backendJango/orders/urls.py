from django.urls import path
from .views import OrdersView
from .delivery_views import DeliveryCalculatorView, DeliveryTrackingView, DeliveryMapView

urlpatterns = [
    path('', OrdersView.as_view(), name='orders'),
    
    # Delivery endpoints
    path('delivery/calculate/', DeliveryCalculatorView.as_view(), name='delivery-calculate'),
    path('delivery/tracking/', DeliveryTrackingView.as_view(), name='delivery-tracking-list'),
    path('delivery/tracking/<str:tracking_number>/', DeliveryTrackingView.as_view(), name='delivery-tracking-detail'),
    path('delivery/map/', DeliveryMapView.as_view(), name='delivery-map'),
]
