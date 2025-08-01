from django.urls import path
from . import views

urlpatterns = [
    path('create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('create-d17-payment/', views.create_d17_payment, name='create-d17-payment'),
    path('verify-d17-payment/', views.verify_d17_payment, name='verify-d17-payment'),
    path('payment-methods/', views.get_payment_methods, name='get-payment-methods'),
]
