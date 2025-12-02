import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCartPlus, FaMinus, FaPlus, FaTruck, FaShieldAlt } from 'react-icons/fa';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await getProduct(id);
            setProduct(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        const result = await addToCart(product.id, quantity);
        if (result.success) {
            toast.success(`Added ${quantity} item(s) to cart! 🛒`);
        } else {
            toast.error(result.error);
        }
    };

    const decreaseQty = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const increaseQty = () => {
        if (quantity < product.stock) setQuantity(quantity + 1);
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-pink" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container py-5 text-center">
                <h4>Product not found</h4>
                <Link to="/products" className="btn btn-pink mt-3">Back to Products</Link>
            </div>
        );
    }

    const imageUrl = product.image || 'https://via.placeholder.com/500x500?text=No+Image';

    return (
        <div className="container py-5">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/products">Products</Link></li>
                    <li className="breadcrumb-item active">{product.name}</li>
                </ol>
            </nav>

            <div className="row">
                {/* Product Image */}
                <div className="col-md-6 mb-4">
                    <div className="product-detail-image">
                        <img src={imageUrl} alt={product.name} className="img-fluid rounded-4 shadow" />
                    </div>
                </div>

                {/* Product Info */}
                <div className="col-md-6">
                    <span className="category-badge mb-3">{product.category_name}</span>
                    <h1 className="product-detail-title">{product.name}</h1>
                    
                    <div className="product-detail-price my-3">
                        ৳{parseFloat(product.price).toFixed(0)}
                    </div>

                    <p className="text-muted mb-4">{product.description}</p>

                    {/* Stock Status */}
                    <div className="mb-4">
                        {product.stock > 0 ? (
                            <span className="badge bg-success">In Stock ({product.stock} available)</span>
                        ) : (
                            <span className="badge bg-danger">Out of Stock</span>
                        )}
                    </div>

                    {/* Quantity */}
                    {product.stock > 0 && (
                        <div className="mb-4">
                            <label className="form-label">Quantity:</label>
                            <div className="quantity-selector">
                                <button className="btn btn-outline-secondary" onClick={decreaseQty}>
                                    <FaMinus />
                                </button>
                                <span className="quantity-value">{quantity}</span>
                                <button className="btn btn-outline-secondary" onClick={increaseQty}>
                                    <FaPlus />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button 
                        className="btn btn-pink btn-lg w-100 mb-4"
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                    >
                        <FaCartPlus className="me-2" />
                        Add to Cart
                    </button>

                    {/* Features */}
                    <div className="row">
                        <div className="col-6">
                            <div className="d-flex align-items-center text-muted">
                                <FaTruck className="me-2 text-pink" />
                                <small>Free Delivery in Dhaka</small>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="d-flex align-items-center text-muted">
                                <FaShieldAlt className="me-2 text-pink" />
                                <small>100% Authentic</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;