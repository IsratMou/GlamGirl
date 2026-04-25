from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import Product


def get_or_create_cart(request):
    """
    Smart cart lookup:
    - Authenticated users  → persistent Cart linked to their User account.
    - Anonymous users      → session-based Cart (existing behaviour).
    - If a user logs in while a guest cart exists, the guest items are merged
      into their user cart automatically so nothing is lost.
    """
    if request.user.is_authenticated:
        # --- User cart (persistent across sessions / devices) ---
        user_cart, _ = Cart.objects.get_or_create(user=request.user)

        # Merge any existing guest cart for this session
        session_key = request.session.session_key
        if session_key:
            try:
                guest_cart = Cart.objects.get(session_key=session_key, user__isnull=True)
                # Move each guest item into the user cart
                for guest_item in guest_cart.items.all():
                    existing = user_cart.items.filter(product=guest_item.product).first()
                    if existing:
                        # Accumulate quantity, but don't exceed stock
                        new_qty = existing.quantity + guest_item.quantity
                        existing.quantity = min(new_qty, guest_item.product.stock)
                        existing.save()
                    else:
                        guest_item.cart = user_cart
                        guest_item.save()
                guest_cart.delete()  # Remove the now-empty guest cart
            except Cart.DoesNotExist:
                pass  # No guest cart to merge — that's fine

        return user_cart

    else:
        # --- Guest / anonymous cart (session-based) ---
        if not request.session.session_key:
            request.session.create()
        session_key = request.session.session_key
        cart, _ = Cart.objects.get_or_create(session_key=session_key, user__isnull=True)
        return cart


@api_view(['GET'])
def get_cart(request):
    """Cart দেখাও"""
    cart = get_or_create_cart(request)
    serializer = CartSerializer(cart)
    return Response(serializer.data)


@csrf_exempt
@api_view(['POST'])
def add_to_cart(request):
    """Cart এ product add করো"""
    cart = get_or_create_cart(request)
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)

    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if product.stock < quantity:
        return Response(
            {'error': 'Not enough stock available'},
            status=status.HTTP_400_BAD_REQUEST
        )

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )

    if not created:
        cart_item.quantity += quantity
        cart_item.save()

    serializer = CartSerializer(cart)
    return Response(serializer.data)


@csrf_exempt
@api_view(['PUT'])
def update_cart_item(request, item_id):
    """Cart item এর quantity update করো"""
    cart = get_or_create_cart(request)
    quantity = request.data.get('quantity', 1)

    try:
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
    except CartItem.DoesNotExist:
        return Response(
            {'error': 'Item not found in cart'},
            status=status.HTTP_404_NOT_FOUND
        )

    if cart_item.product.stock < quantity:
        return Response(
            {'error': 'Not enough stock available'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if quantity <= 0:
        cart_item.delete()
    else:
        cart_item.quantity = quantity
        cart_item.save()

    serializer = CartSerializer(cart)
    return Response(serializer.data)


@csrf_exempt
@api_view(['DELETE'])
def remove_from_cart(request, item_id):
    """Cart থেকে item remove করো"""
    cart = get_or_create_cart(request)

    try:
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
        cart_item.delete()
    except CartItem.DoesNotExist:
        return Response(
            {'error': 'Item not found in cart'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = CartSerializer(cart)
    return Response(serializer.data)


@csrf_exempt
@api_view(['DELETE'])
def clear_cart(request):
    """পুরো Cart খালি করো"""
    cart = get_or_create_cart(request)
    cart.items.all().delete()

    serializer = CartSerializer(cart)
    return Response(serializer.data)


# ============================================
# Template Views (HTML Pages)
# ============================================

def cart_page(request):
    """Cart page"""
    return render(request, 'cart.html')


def checkout_page(request):
    """Checkout page"""
    return render(request, 'checkout.html')