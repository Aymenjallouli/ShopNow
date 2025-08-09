from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from products.models import Product


class OrderCreationTests(TestCase):
	def setUp(self):
		self.User = get_user_model()
		self.user = self.User.objects.create_user(username='tester', password='pass12345')
		self.client = APIClient()
		self.client.force_authenticate(user=self.user)
		self.product = Product.objects.create(name='Test Prod', price='9.99', stock=5)

	def test_create_simple_order(self):
		payload = {
			'orderItems': [
				{'product': self.product.id, 'quantity': 2, 'price': '9.99'}
			],
			'shippingAddress': 'Somewhere, City',
			'phoneNumber': '12345678',
			'totalPrice': '19.98'
		}
		resp = self.client.post('/api/orders/', payload, format='json')
		self.assertNotEqual(resp.status_code, 500, f"Server error: {resp.data}")
		self.assertEqual(resp.status_code, 201, resp.data)
		self.product.refresh_from_db()
		self.assertEqual(self.product.stock, 3)
