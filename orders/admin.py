# orders/admin.py

from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    """Order এর মধ্যে items দেখাবে"""
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'product_name', 'product_price', 'quantity', 'get_subtotal']
    
    def get_subtotal(self, obj):
        return obj.get_subtotal()
    get_subtotal.short_description = 'Subtotal'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'id', 
        'customer_name', 
        'customer_phone',
        'city',
        'total_amount', 
        'status', 
        'payment_method',
        'is_paid',
        'created_at'
    ]
    list_filter = ['status', 'payment_method', 'is_paid', 'city', 'created_at']
    search_fields = ['customer_name', 'customer_email', 'customer_phone']
    list_editable = ['status', 'is_paid']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [OrderItemInline]
    
    # Order details page এ sections
    fieldsets = (
        ('Customer Information', {
            'fields': ('customer_name', 'customer_email', 'customer_phone')
        }),
        ('Shipping Details', {
            'fields': ('shipping_address', 'city', 'postal_code')
        }),
        ('Order Details', {
            'fields': ('total_amount', 'shipping_cost', 'status', 'payment_method', 'is_paid')
        }),
        ('Additional Info', {
            'fields': ('note', 'created_at', 'updated_at')
        }),
    )