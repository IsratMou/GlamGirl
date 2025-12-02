import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, loading } = useCart();

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-pink" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="container py-5">
                <div className="empty-cart text-center py-5">
                    <FaShoppingBag size={80} className="text-muted mb-4" />
                    <h3>Your cart is empty</h3>
                    <p className="text-muted">Looks like you haven't added anything yet.</p>
                    <Link to="/products" className="btn btn-pink btn-lg mt-3">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4">Shopping Cart</h2>

            <div className="row">
                {/* Cart Items */}
                <div className="col-lg-8 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            {cart.items.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="row align-items-center">
                                        <div className="col-md-2 col-3">
                                            <img 
                                                src={item.product.image || 'https://via.placeholder.com/80'} 
                                                alt={item.product.name}
                                                className="cart-item-image"
                                            />
                                        </div>
                                        <div className="col-md-4 col-9">
                                            <h6 className="mb-1">{item.product.name}</h6>
                                            <small className="text-muted">
                                                ৳{parseFloat(item.product.price).toFixed(0)} each
                                            </small>
                                        </div>
                                        <div className="col-md-3 col-6 mt-2 mt-md-0">
                                            <div className="quantity-selector-sm">
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <FaMinus />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <FaPlus />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-md-2 col-4 mt-2 mt-md-0 text-end">
                                            <strong>৳{item.subtotal}</strong>
                                        </div>
                                        <div className="col-md-1 col-2 mt-2 mt-md-0 text-end">
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="col-lg-4">
                    <div className="order-summary">
                        <h5 className="mb-4">Order Summary</h5>
                        
                        <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal ({cart.total_items} items)</span>
                            <span>৳{cart.total}</span>
                        </div>
                        
                        <div className="d-flex justify-content-between mb-2">
                            <span>Shipping</span>
                            <span className="text-success">Free</span>
                        </div>
                        
                        <hr />
                        
                        <div className="d-flex justify-content-between mb-4">
                            <strong>Total</strong>
                            <strong className="text-pink fs-4">৳{cart.total}</strong>
                        </div>

                        <Link to="/checkout" className="btn btn-pink w-100 btn-lg">
                            Proceed to Checkout
                        </Link>
                        
                        <Link to="/products" className="btn btn-outline-pink w-100 mt-2">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;