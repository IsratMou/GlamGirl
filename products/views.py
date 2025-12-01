from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import render
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


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