from django.urls import path
from .views import RegisterView, UserMeView, AdminUserListView, AdminUserDetailView
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from .serializers import AdminUserSerializer

class AllUsersListView(generics.ListAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/', AllUsersListView.as_view(), name='all-users'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='user-detail'),
]
