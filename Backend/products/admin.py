from django.contrib import admin
from products.models import Category, Product


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'price', 'stock', 'is_available', 'featured', 'created_at')
    list_filter = ('is_available', 'featured', 'category')
    search_fields = ('name', 'description', 'sku')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('price', 'stock', 'is_available', 'featured')


admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
