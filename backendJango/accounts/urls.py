from django.urls import path
from .views import RegisterView, UserMeView, AdminUserListView
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from .serializers import RegisterSerializer

class AllUsersListView(generics.ListAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.IsAdminUser]

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/', AllUsersListView.as_view(), name='all-users'),
]
