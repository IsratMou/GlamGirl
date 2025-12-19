from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('flash-sale/', views.FlashSaleListView.as_view(), name='flash-sale-products'),
    path('recommended/', views.RecommendedProductsListView.as_view(), name='recommended-products'),

    path('category/<int:category_id>/', views.products_by_category, name='products-by-category'),
    path('', views.ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
]