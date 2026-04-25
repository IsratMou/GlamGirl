# orders/views.py
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer
from cart.models import Cart, CartItem


def get_cart_by_session(request):
    """Cart নিয়ে আসো — user cart first, then session fallback"""
    if request.user.is_authenticated:
        try:
            return request.user.cart
        except Exception:
            pass

    session_key = request.session.session_key
    if not session_key:
        return None
    try:
        return Cart.objects.get(session_key=session_key, user__isnull=True)
    except Cart.DoesNotExist:
        return None


@csrf_exempt
@api_view(['POST'])
def create_order(request):
    """
    🛍️ Cart থেকে Order তৈরি করো
    POST /api/orders/create/
    """
    # Input validate করো
    serializer = CreateOrderSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Cart নিয়ে আসো
    cart = get_cart_by_session(request)
    if not cart or not cart.items.exists():
        return Response(
            {'error': 'Cart is empty'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Stock check করো
    for item in cart.items.all():
        if item.product.stock < item.quantity:
            return Response(
                {'error': f'Not enough stock for {item.product.name}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Transaction দিয়ে order create করো (একসাথে সব হবে অথবা কিছুই হবে না)
    with transaction.atomic():
        # Order create করো
        order = Order.objects.create(
            customer_name=serializer.validated_data['customer_name'],
            customer_email=serializer.validated_data['customer_email'],
            customer_phone=serializer.validated_data['customer_phone'],
            shipping_address=serializer.validated_data['shipping_address'],
            city=serializer.validated_data['city'],
            postal_code=serializer.validated_data.get('postal_code', ''),
            payment_method=serializer.validated_data['payment_method'],
            note=serializer.validated_data.get('note', ''),
            total_amount=cart.get_total(),
            shipping_cost=60 if serializer.validated_data['city'].lower(
            ) != 'dhaka' else 0,
        )

        # Order items create করো ও stock কমাও
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                product_price=cart_item.product.get_current_price(),
                quantity=cart_item.quantity,
            )

            # Stock কমাও
            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save()

        # Cart clear করো
        cart.items.all().delete()

    # Response দাও
    order_serializer = OrderSerializer(order)
    return Response({
        'message': 'Order placed successfully!',
        'order': order_serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def order_detail(request, order_id):
    """
    📄 Order details দেখাও
    GET /api/orders/<order_id>/
    Admin: sees any order.
    Customer: only sees their own order (matched by user account or email).
    """
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Permission check: must be admin, the linked user, or matching email
    is_admin = request.user.is_authenticated and request.user.is_staff
    is_owner = (
        (request.user.is_authenticated and order.user == request.user)
        or (request.data.get('email') == order.customer_email)  # guest lookup
    )

    if not is_admin and not is_owner:
        return Response(
            {'error': 'You do not have permission to view this order.'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = OrderSerializer(order)
    return Response(serializer.data)


@api_view(['GET'])
def order_list(request):
    """
    📋 সব orders দেখাও — Admin only
    GET /api/orders/
    """
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response(
            {'error': 'Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )

    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def track_order(request, order_id):
    """
    🚚 Order track করো — limited public info (status only, no customer PII)
    GET /api/orders/track/<order_id>/
    Anyone who knows the order ID can check its status.
    Full customer details are never exposed here.
    """
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({
        'order_id': order.id,
        'status': order.status,
        'status_display': order.get_status_display(),
        'is_paid': order.is_paid,
        'created_at': order.created_at,
        'updated_at': order.updated_at,
        # ✅ No customer_name, email, phone, address — safe to expose
    })
