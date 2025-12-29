from rest_framework import serializers
from .models import Category, Product, ProductImage


def absolute_media_url(request, url: str | None):
    if not url:
        return None
    if request is None:
        return url
    return request.build_absolute_uri(url)


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image']

    def get_image(self, obj):
        request = self.context.get('request')
        if not obj.image:
            return None
        return absolute_media_url(request, obj.image.url)


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'sort_order', 'is_primary']

    def get_image(self, obj):
        request = self.context.get('request')
        if not obj.image:
            return None
        return absolute_media_url(request, obj.image.url)


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    discount_percent = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()  # primary image absolute
    images_preview = serializers.SerializerMethodField()  # ✅ max 2 images for card slideshow

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
            'images_preview',  # ✅ add
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
        try:
            if obj.flash_price is not None and obj.flash_price < obj.price:
                diff = obj.price - obj.flash_price
                percent = (diff / obj.price) * 100
                return int(round(percent))
        except Exception:
            pass
        return 0

    def get_image(self, obj):
        """
        Primary image priority:
        1) ProductImage (primary first)
        2) fallback Product.image
        """
        request = self.context.get('request')

        primary = None
        try:
            primary = obj.images.all().order_by('-is_primary', 'sort_order', 'id').first()
        except Exception:
            primary = None

        if primary and primary.image:
            return absolute_media_url(request, primary.image.url)

        if obj.image:
            return absolute_media_url(request, obj.image.url)

        return None

    def get_images_preview(self, obj):
        """
        Return max 2 images for product cards (fast, no heavy payload).
        Order: primary first then sort_order.
        """
        request = self.context.get('request')
        urls = []

        try:
            qs = obj.images.all().order_by('-is_primary', 'sort_order', 'id')[:2]
            for im in qs:
                if im.image:
                    urls.append(absolute_media_url(request, im.image.url))
        except Exception:
            urls = []

        # fallback old single image
        if not urls and obj.image:
            urls = [absolute_media_url(request, obj.image.url)]

        return urls


class ProductDetailSerializer(ProductSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ['images']