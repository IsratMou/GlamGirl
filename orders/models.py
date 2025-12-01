# orders/models.py

from django.db import models
from django.contrib.auth.models import User
from products.models import Product


class Order(models.Model):
    """
    🛍️ Order Model - Customer এর order
    """
    
    # Order Status choices
    STATUS_CHOICES = [
        ('pending', 'Pending'),           # Order placed, payment pending
        ('confirmed', 'Confirmed'),       # Payment confirmed
        ('processing', 'Processing'),     # Order being prepared
        ('shipped', 'Shipped'),           # Order shipped
        ('delivered', 'Delivered'),       # Order delivered
        ('cancelled', 'Cancelled'),       # Order cancelled
    ]
    
    # Payment Method choices
    PAYMENT_CHOICES = [
        ('cod', 'Cash on Delivery'),
        ('bkash', 'bKash'),
        ('nagad', 'Nagad'),
        ('card', 'Credit/Debit Card'),
    ]
    
    # Customer info (login ছাড়াও order করতে পারবে)
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='orders'
    )
    
    # Guest checkout এর জন্য
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    
    # Shipping address
    shipping_address = models.TextField()
    city = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=10, blank=True)
    
    # Order details
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status & Payment
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='cod')
    is_paid = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Order note (optional)
    note = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']  # Latest orders first
    
    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"
    
    def get_grand_total(self):
        """Total + Shipping cost"""
        return self.total_amount + self.shipping_cost


class OrderItem(models.Model):
    """
    📦 OrderItem Model - Order এর প্রতিটা product
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    
    # Order এর সময়ের price ও name save করো (product পরে change হলেও এটা same থাকবে)
    product_name = models.CharField(max_length=200)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    quantity = models.PositiveIntegerField(default=1)
    
    def __str__(self):
        return f"{self.quantity} x {self.product_name}"
    
    def get_subtotal(self):
        return self.product_price * self.quantity