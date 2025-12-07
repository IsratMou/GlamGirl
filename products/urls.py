from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),

    # সব পণ্য
    path('', views.ProductListView.as_view(), name='product-list'),

    # 🔥 Flash Sale products
    path('flash-sale/', views.FlashSaleListView.as_view(), name='flash-sale-products'),

    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('category/<int:category_id>/', views.products_by_category, name='products-by-category'),
]