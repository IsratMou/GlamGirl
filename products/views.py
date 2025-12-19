from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import render

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

from django.db.models import Sum, IntegerField, Case, When
from django.utils import timezone
from datetime import timedelta



# ============================================
# Template Views (HTML Pages)
# ============================================

def home(request):
    """Homepage"""
    return render(request, 'home.html')


def products_page(request):
    """Products listing page"""
    return render(request, 'products.html')


def product_detail_page(request, pk):
    """Single product detail page"""
    return render(request, 'product_detail.html', {'product_id': pk})


# ============================================
# API Views (JSON Data)
# ============================================

class CategoryListView(generics.ListAPIView):
    """সব Categories দেখাও"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductListView(generics.ListAPIView):
    """সব Products দেখাও"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer


class ProductDetailView(generics.RetrieveAPIView):
    """একটা Product এর details দেখাও"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer


@api_view(['GET'])
def products_by_category(request, category_id):
    """Category অনুযায়ী Products দেখাও"""
    products = Product.objects.filter(category_id=category_id, is_active=True)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


# 🔥 নতুন: Flash Sale Products List
class FlashSaleListView(generics.ListAPIView):
    """
    শুধু Flash Sale products দেখাবে।
    Simple version: is_flash_sale=True & is_active=True
    (চাইলে পরে time window অনুযায়ী filter করা যাবে)
    """
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            is_flash_sale=True
        )
        

# ✅ "For You" Recommended (Most Bought / Popular)
class RecommendedProductsListView(generics.ListAPIView):
    """
    "For You" = Most bought / popular products (global recommendation)
    Query params:
      - limit: how many products (default 12, max 50)
    """
    serializer_class = ProductSerializer

    def get_queryset(self):
        limit = int(self.request.query_params.get('limit', 12))
        limit = max(1, min(limit, 50))

        base_qs = Product.objects.filter(is_active=True)

        try:
            # orders app থেকে OrderItem model import
            from orders.models import OrderItem

            top = (
                OrderItem.objects
                .values('product_id')
                .annotate(total_sold=Sum('quantity'))
                .order_by('-total_sold')
            )

            top_ids = [row['product_id'] for row in top[:limit]]

            # যদি order data না থাকে → fallback latest products
            if not top_ids:
                return base_qs.order_by('-id')[:limit]

            # top_ids order preserve করার জন্য Case/When
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
            # orders app/model mismatch হলে → safe fallback
            return base_qs.order_by('-id')[:limit]