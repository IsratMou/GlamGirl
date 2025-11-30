from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

# সব Categories দেখাও
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


# সব Products দেখাও
class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer


# একটা Product এর details দেখাও
class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer


# Category অনুযায়ী Products দেখাও
@api_view(['GET'])
def products_by_category(request, category_id):
    products = Product.objects.filter(category_id=category_id, is_active=True)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)