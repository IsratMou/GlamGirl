"""
URL configuration for glamgirl project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Import views
from products.views import home, products_page, product_detail_page
from cart.views import cart_page, checkout_page

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # ============================================
    # HTML Pages (Frontend)
    # ============================================
    path('', home, name='home'),
    path('products/', products_page, name='products'),
    path('product/<int:pk>/', product_detail_page, name='product-detail-page'),
    path('cart/', cart_page, name='cart'),
    path('checkout/', checkout_page, name='checkout'),
    
    # ============================================
    # API Endpoints (Backend)
    # ============================================
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
]

# Media files serve করার জন্য (development এ)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)