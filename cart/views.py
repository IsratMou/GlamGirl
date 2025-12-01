from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import Product

def get_or_create_cart(request):
    """Session based cart তৈরি বা get করো"""
    if not request.session.session_key:
        request.session.create()
    
    session_key = request.session.session_key
    cart, created = Cart.objects.get_or_create(session_key=session_key)
    return cart


@api_view(['GET'])
def get_cart(request):
    """Cart দেখাও"""
    cart = get_or_create_cart(request)
    serializer = CartSerializer(cart)
    return Response(serializer.data)


@api_view(['POST'])
def add_to_cart(request):
    """Cart এ product add করো"""
    cart = get_or_create_cart(request)
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)
    
    # Product আছে কিনা check করো
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Stock check করো
    if product.stock < quantity:
        return Response(
            {'error': 'Not enough stock available'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Cart এ আগে থেকে আছে কিনা দেখো
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart, 
        product=product,
        defaults={'quantity': quantity}
    )
    
    # যদি আগে থেকে থাকে, quantity বাড়াও
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    
    serializer = CartSerializer(cart)
    return Response(serializer.data)


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
    
    # Stock check করো
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


@api_view(['DELETE'])
def clear_cart(request):
    """পুরো Cart খালি করো"""
    cart = get_or_create_cart(request)
    cart.items.all().delete()
    
    serializer = CartSerializer(cart)
    return Response(serializer.data)