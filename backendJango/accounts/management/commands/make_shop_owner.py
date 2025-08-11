from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from shops.models import Shop

User = get_user_model()

class Command(BaseCommand):
    help = 'Set user role to shop_owner'

    def add_arguments(self, parser):
        parser.add_argument('--user-id', type=int, help='User ID to make shop owner')
        parser.add_argument('--username', type=str, help='Username to make shop owner')

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        username = options.get('username')
        
        user = None
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with ID {user_id} does not exist'))
                return
        elif username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with username {username} does not exist'))
                return
        else:
            # Show available users
            self.stdout.write('Available users:')
            for u in User.objects.all():
                self.stdout.write(f'  ID: {u.id}, Username: {u.username}, Role: {u.role}')
            return

        # Update user role
        user.role = 'shop_owner'
        user.save()
        
        self.stdout.write(self.style.SUCCESS(f'Updated user {user.username} role to shop_owner'))
        
        # Create a shop if none exists for this user
        shop, created = Shop.objects.get_or_create(
            owner=user,
            defaults={
                'name': f'{user.username}\'s Shop',
                'description': 'Test shop for development',
                'address': '123 Test Street',
                'phone': '+1234567890',
                'email': f'{user.username}@shop.com'
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created shop: {shop.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'User already has shop: {shop.name}'))
