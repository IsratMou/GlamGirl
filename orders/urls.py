# orders/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.order_list, name='order-list'),
    path('create/', views.create_order, name='create-order'),
    path('<int:order_id>/', views.order_detail, name='order-detail'),
    path('track/<int:order_id>/', views.track_order, name='track-order'),
]