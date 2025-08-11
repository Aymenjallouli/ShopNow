from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from shops.models import Shop

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test shop and assign it to a user'

    def add_arguments(self, parser):
        parser.add_argument('--user-id', type=int, help='User ID to assign as shop owner')
        parser.add_argument('--username', type=str, help='Username to assign as shop owner')

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
            # Get the first user or create one
            user = User.objects.first()
            if not user:
                user = User.objects.create_user(
                    username='testowner',
                    email='testowner@example.com',
                    password='testpass123'
                )
                self.stdout.write(self.style.SUCCESS(f'Created test user: {user.username}'))

        # Create a test shop
        shop, created = Shop.objects.get_or_create(
            name='Test Shop',
            defaults={
                'description': 'A test shop for development',
                'address': '123 Test Street',
                'phone': '+1234567890',
                'email': 'testshop@example.com',
                'owner': user
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created shop: {shop.name}'))
        else:
            # Update owner if shop exists
            shop.owner = user
            shop.save()
            self.stdout.write(self.style.SUCCESS(f'Updated shop owner: {shop.name}'))
        
        self.stdout.write(self.style.SUCCESS(f'Shop "{shop.name}" is now owned by user: {user.username} (ID: {user.id})'))
        
        # Show all users
        self.stdout.write('\nAll users:')
        for u in User.objects.all():
            shops_owned = Shop.objects.filter(owner=u).count()
            self.stdout.write(f'  ID: {u.id}, Username: {u.username}, Email: {u.email}, Shops: {shops_owned}')
