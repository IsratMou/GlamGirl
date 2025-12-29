from django.contrib import admin
from .models import Category, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 2
    fields = ('image', 'alt_text', 'sort_order', 'is_primary')
    ordering = ('-is_primary', 'sort_order', 'id')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'price', 'stock', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'is_flash_sale')
    search_fields = ('name', 'description')
    list_editable = ('price', 'stock', 'is_active')
    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'sort_order', 'is_primary', 'created_at')
    list_filter = ('is_primary', 'product')
    search_fields = ('product__name', 'alt_text')