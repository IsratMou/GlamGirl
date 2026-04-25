# orders/serializers.py

from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 
            'product', 
            'product_name', 
            'product_price', 
            'quantity', 
            'subtotal'
        ]
        read_only_fields = ['product_name', 'product_price']
    
    def get_subtotal(self, obj):
        return obj.get_subtotal()


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    grand_total = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id',
            'customer_name',
            'customer_email',
            'customer_phone',
            'shipping_address',
            'city',
            'postal_code',
            'total_amount',
            'shipping_cost',
            'grand_total',
            'status',
            'status_display',
            'payment_method',
            'payment_method_display',
            'is_paid',
            'note',
            'items',
            'created_at',
        ]
        read_only_fields = ['total_amount', 'status', 'is_paid', 'created_at']
    
    def get_grand_total(self, obj):
        return obj.get_grand_total()


class CreateOrderSerializer(serializers.Serializer):
    """
    Order create করার জন্য আলাদা serializer
    Cart থেকে order বানাবে
    """
    customer_name = serializers.CharField(max_length=100)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=20)
    shipping_address = serializers.CharField()
    city = serializers.CharField(max_length=50)
    postal_code = serializers.CharField(max_length=10, required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_CHOICES)
    note = serializers.CharField(required=False, allow_blank=True)

    def validate_customer_phone(self, value):
        """
        Bangladesh mobile number validation.
        Valid formats: 01XXXXXXXXX (11 digits, operator digit 3-9)
        Also accepts +8801XXXXXXXXX or 8801XXXXXXXXX — normalised to 01XXXXXXXXX.
        """
        import re

        # Strip whitespace and common separators
        phone = re.sub(r'[\s\-\(\)]', '', value)

        # Normalise +880 / 880 country code prefix → local format
        if phone.startswith('+880'):
            phone = '0' + phone[4:]
        elif phone.startswith('880') and len(phone) == 13:
            phone = '0' + phone[3:]

        # Must match: 01[3-9]XXXXXXXX  (11 digits)
        if not re.fullmatch(r'01[3-9]\d{8}', phone):
            raise serializers.ValidationError(
                'Enter a valid Bangladesh phone number (e.g. 01XXXXXXXXX).'
            )

        return phone  # Return normalised value