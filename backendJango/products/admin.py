from django.contrib import admin
from .models import Product
from categories.models import Category
from django.contrib import admin

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
	search_fields = ("name",)
	list_display = ("id", "name", "status")

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "shop", "category", "price", "stock", "status")
	list_filter = ("status", "category", "shop")
	search_fields = ("name", "description")
	autocomplete_fields = ("shop", "category")
