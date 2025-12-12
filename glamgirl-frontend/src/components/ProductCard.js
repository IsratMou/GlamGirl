import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaCartPlus,
    FaStar,
    FaHeart,
    FaRegHeart,
    FaBolt,
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        const result = await addToCart(product.id, 1);
        if (result.success) {
            toast.success('Added to cart! 🛒');
        } else {
            toast.error(result.error);
        }
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        const result = toggleWishlist(product);
        if (result.success) {
            toast.success(result.message);
        }
    };

    const imageUrl =
        product.image ||
        'https://via.placeholder.com/400x400?text=GlamGirl+Product';
    const inWishlist = isInWishlist(product.id);

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
        // Mobile এ 2 column: col-6, tablet+ এ bootstrap অনুযায়ী
        <div className="col-6 col-md-4 col-lg-3 mb-3">
            <Link
                to={`/product/${product.id}`}
                className="text-decoration-none"
            >
                <div className="product-card h-100">
                    {/* Image */}
                    <div className="product-image-wrapper">
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="product-image"
                            loading="lazy"
                        />

                        {/* Flash sale badge */}
                        {hasFlashDiscount && (
                            <span className="product-flash-badge">
                                <FaBolt className="me-1" />
                                Flash Deal
                            </span>
                        )}

                        {/* Discount badge */}
                        {discountPercent > 0 && (
                            <span className="product-discount-pill">
                                -{discountPercent}%
                            </span>
                        )}

                        {/* Wishlist Button */}
                        <button
                            className={`wishlist-btn ${
                                inWishlist ? 'active' : ''
                            }`}
                            onClick={handleWishlist}
                        >
                            {inWishlist ? <FaHeart /> : <FaRegHeart />}
                        </button>

                        {product.stock <= 0 && (
                            <div className="out-of-stock-badge">
                                Out of Stock
                            </div>
                        )}
                    </div>

                    {/* Body */}
                    <div className="product-card-body">
                        {product.category_name && (
                            <span className="category-badge mb-1">
                                {product.category_name}
                            </span>
                        )}

                        <h6 className="product-title">{product.name}</h6>

                        {/* Rating placeholder (Daraz-style simple) */}
                        <div className="product-rating-row mb-1">
                            <FaStar className="text-warning me-1" />
                            <small className="text-muted">4.5</small>
                            <small className="text-muted ms-1">(120)</small>
                        </div>

                        {/* Price row */}
                        <div className="product-price-row mb-1">
                            <span className="product-price-main">
                                ৳{currentPrice.toFixed(0)}
                            </span>
                            {hasFlashDiscount && (
                                <span className="product-price-old">
                                    ৳{originalPrice.toFixed(0)}
                                </span>
                            )}
                        </div>

                        {/* Add to cart button */}
                        <button
                            className="btn btn-pink w-100 product-add-btn"
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                        >
                            <FaCartPlus className="me-2" />
                            Add to Cart
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;