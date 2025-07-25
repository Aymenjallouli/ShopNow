from django.contrib import admin
from reviews.models import Review


class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'rating', 'title', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'rating')
    search_fields = ('title', 'comment', 'user__username', 'product__name')
    list_editable = ('is_approved',)
    actions = ['approve_reviews']
    
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Approve selected reviews"


admin.site.register(Review, ReviewAdmin)
