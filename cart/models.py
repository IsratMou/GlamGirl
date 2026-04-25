from django.db import models
from django.contrib.auth.models import User
from products.models import Product


class Cart(models.Model):
    # Authenticated users get a persistent user-linked cart
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='cart',
    )
    # Anonymous / guest users get a session-based cart
    session_key = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart - {self.session_key}"

    def get_total(self):
        total = sum(item.get_subtotal() for item in self.items.all())
        return total

    def get_total_items(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart, on_delete=models.CASCADE, related_name='items'
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    def get_subtotal(self):
        """
        এখন থেকে subtotal হিসাব হবে product-er current price দিয়ে
        (flash sale active থাকলে flash_price, না হলে normal price)
        """
        return self.product.get_current_price() * self.quantity
