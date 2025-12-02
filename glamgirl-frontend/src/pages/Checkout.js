import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';
import { toast } from 'react-toastify';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, fetchCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        shipping_address: '',
        city: 'Dhaka',
        postal_code: '',
        payment_method: 'cod',
        note: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await createOrder(formData);
            if (response.data.order) {
                setOrderId(response.data.order.id);
                setOrderPlaced(true);
                fetchCart(); // Refresh cart (will be empty now)
                toast.success('Order placed successfully! 🎉');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const shipping = formData.city.toLowerCase() === 'dhaka' ? 0 : 60;
    const total = cart.total + shipping;

    // Order Success Screen
    if (orderPlaced) {
        return (
            <div className="container py-5">
                <div className="text-center py-5">
                    <FaCheckCircle size={80} className="text-success mb-4" />
                    <h2>Order Placed Successfully!</h2>
                    <p className="text-muted fs-5">Your Order ID: <strong>#{orderId}</strong></p>
                    <p className="text-muted">We'll contact you soon to confirm your order.</p>
                    <button 
                        className="btn btn-pink btn-lg mt-3"
                        onClick={() => navigate('/')}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Redirect if cart is empty
    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="container py-5 text-center">
                <h4>Your cart is empty</h4>
                <button className="btn btn-pink mt-3" onClick={() => navigate('/products')}>
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4">Checkout</h2>

            <div className="row">
                {/* Checkout Form */}
                <div className="col-lg-7 mb-4">
                    <div className="checkout-form">
                        <h5 className="mb-4">Shipping Information</h5>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Full Name *</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Phone Number *</label>
                                    <input 
                                        type="tel" 
                                        className="form-control" 
                                        name="customer_phone"
                                        value={formData.customer_phone}
                                        onChange={handleChange}
                                        placeholder="01XXXXXXXXX"
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email Address *</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    name="customer_email"
                                    value={formData.customer_email}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Shipping Address *</label>
                                <textarea 
                                    className="form-control" 
                                    name="shipping_address"
                                    value={formData.shipping_address}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="House, Road, Area"
                                    required
                                ></textarea>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">City *</label>
                                    <select 
                                        className="form-select" 
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Dhaka">Dhaka</option>
                                        <option value="Chittagong">Chittagong</option>
                                        <option value="Sylhet">Sylhet</option>
                                        <option value="Rajshahi">Rajshahi</option>
                                        <option value="Khulna">Khulna</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Postal Code</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <h5 className="mt-4 mb-3">Payment Method</h5>
                            
                            <div className="mb-3">
                                {[
                                    { value: 'cod', label: '💵 Cash on Delivery' },
                                    { value: 'bkash', label: '📱 bKash' },
                                    { value: 'nagad', label: '📱 Nagad' },
                                ].map(method => (
                                    <div className="form-check mb-2" key={method.value}>
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            name="payment_method"
                                            id={method.value}
                                            value={method.value}
                                            checked={formData.payment_method === method.value}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor={method.value}>
                                            {method.label}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Order Note (Optional)</label>
                                <textarea 
                                    className="form-control" 
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Any special instructions..."
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-pink btn-lg w-100"
                                disabled={loading}
                            >
                                {loading ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="col-lg-5">
                    <div className="order-summary">
                        <h5 className="mb-4">Order Summary</h5>

                        {cart.items.map(item => (
                            <div key={item.id} className="d-flex justify-content-between mb-2">
                                <span>{item.product.name} × {item.quantity}</span>
                                <span>৳{item.subtotal}</span>
                            </div>
                        ))}

                        <hr />

                        <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal</span>
                            <span>৳{cart.total}</span>
                        </div>
                        
                        <div className="d-flex justify-content-between mb-2">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'Free' : `৳${shipping}`}</span>
                        </div>

                        <hr />

                        <div className="d-flex justify-content-between">
                            <strong>Total</strong>
                            <strong className="text-pink fs-4">৳{total}</strong>
                        </div>

                        <p className="text-muted text-center mt-4 small">
                            🔒 Your information is secure
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;