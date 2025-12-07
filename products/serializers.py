from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name', read_only=True
    )

    # 🔥 শুধু serializer এর জন্য extra computed field
    discount_percent = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'price',
            'flash_price',
            'discount_percent',
            'image',
            'category',
            'category_name',
            'stock',
            'is_active',
            'is_flash_sale',
            'flash_starts_at',
            'flash_ends_at',
            'created_at',
        ]

    def get_discount_percent(self, obj):
        """
        price vs flash_price থেকে discount % হিসাব করে।
        example: price=1000, flash_price=700 => 30
        """
        try:
            if obj.flash_price is not None and obj.flash_price < obj.price:
                diff = obj.price - obj.flash_price
                percent = (diff / obj.price) * 100
                # round to nearest int
                return int(round(percent))
        except Exception:
            pass
        return 0