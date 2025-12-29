from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import render

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, ProductDetailSerializer

from django.db.models import Sum, IntegerField, Case, When


# ============================================
# Template Views (HTML Pages)  (legacy)
# ============================================

def home(request):
    return render(request, 'home.html')


def products_page(request):
    return render(request, 'products.html')


def product_detail_page(request, pk):
    return render(request, 'product_detail.html', {'product_id': pk})


# ============================================
# API Views (JSON Data)
# ============================================

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductListView(generics.ListAPIView):
    queryset = (
        Product.objects.filter(is_active=True)
        .select_related('category')
        .prefetch_related('images')
    )
    serializer_class = ProductSerializer


class ProductDetailView(generics.RetrieveAPIView):
    queryset = (
        Product.objects.filter(is_active=True)
        .select_related('category')
        .prefetch_related('images')
    )
    serializer_class = ProductDetailSerializer


@api_view(['GET'])
def products_by_category(request, category_id):
    products = (
        Product.objects.filter(category_id=category_id, is_active=True)
        .select_related('category')
        .prefetch_related('images')
    )
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)


class FlashSaleListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        return (
            Product.objects.filter(is_active=True, is_flash_sale=True)
            .select_related('category')
            .prefetch_related('images')
        )


class RecommendedProductsListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        limit = int(self.request.query_params.get('limit', 12))
        limit = max(1, min(limit, 50))

        base_qs = (
            Product.objects.filter(is_active=True)
            .select_related('category')
            .prefetch_related('images')
        )

        try:
            from orders.models import OrderItem

            top = (
                OrderItem.objects
                .values('product_id')
                .annotate(total_sold=Sum('quantity'))
                .order_by('-total_sold')
            )

            top_ids = [row['product_id'] for row in top[:limit]]

            if not top_ids:
                return base_qs.order_by('-id')[:limit]

            preserved = Case(
                *[When(id=pid, then=pos) for pos, pid in enumerate(top_ids)],
                output_field=IntegerField(),
            )

            return (
                base_qs.filter(id__in=top_ids)
                .annotate(_order=preserved)
                .order_by('_order')[:limit]
            )

        except Exception:
            return base_qs.order_by('-id')[:limit]
        