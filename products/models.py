from django.db import models
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    # 🔥 নতুন: Category image (admin থেকে upload করবে)
    image = models.ImageField(
        upload_to='categories/',
        blank=True,
        null=True,
        help_text="Category thumbnail image"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='products'
    )
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    # 🔥 Flash Sale fields
    is_flash_sale = models.BooleanField(
        default=False, help_text="Is this product in flash sale?"
    )
    flash_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Special flash sale price (optional)",
    )
    flash_starts_at = models.DateTimeField(
        blank=True, null=True, help_text="(Optional) Flash sale start time"
    )
    flash_ends_at = models.DateTimeField(
        blank=True, null=True, help_text="(Optional) Flash sale end time"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    # ✅ Flash sale active কি না check করার helper
    def is_flash_sale_active(self):
        if not self.is_flash_sale:
            return False

        if self.flash_price is None or self.flash_price >= self.price:
            return False

        now = timezone.now()
        if self.flash_starts_at and self.flash_starts_at > now:
            return False
        if self.flash_ends_at and self.flash_ends_at < now:
            return False

        return True

    # ✅ effective price (flash হলে flash_price, না হলে normal price)
    def get_current_price(self):
        if self.is_flash_sale_active():
            return self.flash_price
        return self.price

class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='products/gallery/')
    alt_text = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'sort_order', 'id']

    def __str__(self):
        return f"{self.product.name} - image {self.id}"