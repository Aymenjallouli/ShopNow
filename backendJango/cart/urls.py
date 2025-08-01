from django.urls import path
from .views import CartView, CartItemView, CartClearView, CartTotalView

urlpatterns = [
    path('', CartView.as_view(), name='cart'),
    path('<int:item_id>/', CartItemView.as_view(), name='cart-item'),
    path('clear/', CartClearView.as_view(), name='cart-clear'),
    path('total/', CartTotalView.as_view(), name='cart-total'),
]
