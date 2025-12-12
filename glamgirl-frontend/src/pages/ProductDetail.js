import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FaCartPlus,
    FaMinus,
    FaPlus,
    FaTruck,
    FaShieldAlt,
    FaBolt,
} from 'react-icons/fa';
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <Link to="/products" className="btn btn-pink mt-3">
                    Back to Products
                </Link>
            </div>
        );
    }

    const imageUrl =
        product.image ||
        'https://via.placeholder.com/500x500?text=No+Image';

    // ✅ Flash sale / discount logic
    const hasFlashDiscount =
        product.is_flash_sale &&
        product.flash_price &&
        Number(product.flash_price) < Number(product.price);

    const currentPrice = hasFlashDiscount
        ? Number(product.flash_price)
        : Number(product.price);
    const originalPrice = Number(product.price);
    const discountPercent =
        hasFlashDiscount && product.discount_percent
            ? product.discount_percent
            : 0;

    return (
        <div className="container py-4 product-detail-page">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb small">
                    <li className="breadcrumb-item">
                        <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/products">Products</Link>
                    </li>
                    <li className="breadcrumb-item active">{product.name}</li>
                </ol>
            </nav>

            <div className="row gy-4">
                {/* Product Image */}
                <div className="col-md-5">
                    <div className="product-detail-image">
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="img-fluid"
                            loading="lazy"
                        />
                        {hasFlashDiscount && (
                            <span className="product-detail-flash-pill">
                                <FaBolt className="me-1" />
                                Flash Deal
                            </span>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="col-md-7">
                    <span className="category-badge mb-2">
                        {product.category_name}
                    </span>

                    <h1 className="product-detail-title">{product.name}</h1>

                    {/* Rating placeholder */}
                    <div className="product-detail-rating mb-2">
                        <span className="badge bg-warning text-dark me-2">
                            ★ 4.5
                        </span>
                        <small className="text-muted">(120 reviews)</small>
                    </div>

                    {/* ✅ Price row */}
                    <div className="product-detail-price-row my-3">
                        <span className="product-detail-price-main">
                            ৳{currentPrice.toFixed(0)}
                        </span>
                        {hasFlashDiscount && (
                            <span className="product-detail-price-old">
                                ৳{originalPrice.toFixed(0)}
                            </span>
                        )}
                        {discountPercent > 0 && (
                            <span className="product-detail-discount-badge">
                                -{discountPercent}%
                            </span>
                        )}
                    </div>

                    <p className="text-muted mb-3 product-detail-desc">
                        {product.description}
                    </p>

                    {/* Stock Status */}
                    <div className="mb-3">
                        {product.stock > 0 ? (
                            <span className="badge bg-success">
                                In Stock ({product.stock} available)
                            </span>
                        ) : (
                            <span className="badge bg-danger">
                                Out of Stock
                            </span>
                        )}
                    </div>

                    {/* Quantity */}
                    {product.stock > 0 && (
                        <div className="mb-3">
                            <label className="form-label small">Quantity</label>
                            <div className="quantity-selector">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={decreaseQty}
                                >
                                    <FaMinus />
                                </button>
                                <span className="quantity-value">
                                    {quantity}
                                </span>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={increaseQty}
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                        className="btn btn-pink btn-lg w-100 mb-3"
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                    >
                        <FaCartPlus className="me-2" />
                        Add to Cart
                    </button>

                    {/* Features */}
                    <div className="row g-2 product-detail-extra">
                        <div className="col-6">
                            <div className="d-flex align-items-center text-muted small">
                                <FaTruck className="me-2 text-pink" />
                                <span>Free Delivery in Dhaka</span>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="d-flex align-items-center text-muted small">
                                <FaShieldAlt className="me-2 text-pink" />
                                <span>100% Authentic</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;