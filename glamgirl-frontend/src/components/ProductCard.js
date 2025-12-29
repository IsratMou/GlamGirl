import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaCartPlus,
    FaStar,
    FaHeart,
    FaRegHeart,
    FaBolt,
    FaShoppingBag,
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';

const ProductCard = ({
    product,
    wrapperClassName = 'col-6 col-md-4 col-lg-3 mb-3',
    compact = false,
}) => {
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const navigate = useNavigate();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const result = await addToCart(product.id, 1);
        if (result.success) toast.success('Added to cart! 🛒');
        else toast.error(result.error);
    };

    const handleBuyNow = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const result = await addToCart(product.id, 1);
        if (result.success) {
            toast.success('Redirecting to checkout... 🛍️');
            navigate('/checkout');
        } else {
            toast.error(result.error);
        }
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const result = toggleWishlist(product);
        if (result.success) toast.success(result.message);
    };

    const imageUrl =
        product.image ||
        'https://via.placeholder.com/400x400?text=GlamGirl+Product';

    const inWishlist = isInWishlist(product.id);

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

    const preview = Array.isArray(product.images_preview) ? product.images_preview : [];
    const baseImg = preview[0] || imageUrl;
    const overlayImg = preview[1] || null;

    return (
        <div className={wrapperClassName}>
            <Link to={`/product/${product.id}`} className="text-decoration-none">
                <div className={`product-card h-100 ${compact ? 'product-card--compact' : ''}`}>
                    {/* Image */}
                    <div className={`product-image-wrapper gg-cardslide ${overlayImg ? 'multi' : 'single'}`}>
                        {/* base image defines height (important) */}
                        <img
                            src={baseImg}
                            alt={product.name}
                            className="product-image gg-cardimg gg-cardimg--base"
                            loading="lazy"
                            decoding="async"
                        />

                        {/* overlay (optional) */}
                        {overlayImg && (
                            <img
                                src={overlayImg}
                                alt={product.name}
                                className="product-image gg-cardimg gg-cardimg--overlay"
                                loading="lazy"
                                decoding="async"
                            />
                        )}

                        {hasFlashDiscount && (
                            <span className="product-flash-badge">
                                <FaBolt className="me-1" />
                                Flash Deal
                            </span>
                        )}

                        {discountPercent > 0 && (
                            <span className="product-discount-pill">
                                -{discountPercent}%
                            </span>
                        )}

                        <button
                            className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                            onClick={handleWishlist}
                            aria-label="Toggle wishlist"
                        >
                            {inWishlist ? <FaHeart /> : <FaRegHeart />}
                        </button>

                        {product.stock <= 0 && (
                            <div className="out-of-stock-badge">Out of Stock</div>
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

                        <div className="product-rating-row mb-1">
                            <FaStar className="text-warning me-1" />
                            <small className="text-muted">4.5</small>
                            <small className="text-muted ms-1">(120)</small>
                        </div>

                        <div className="product-price-row mb-2">
                            <span className="product-price-main">
                                ৳{currentPrice.toFixed(0)}
                            </span>
                            {hasFlashDiscount && (
                                <span className="product-price-old">
                                    ৳{originalPrice.toFixed(0)}
                                </span>
                            )}
                        </div>

                        <div className="product-btn-group">
                            <button
                                className="product-cart-btn"
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                            >
                                <FaCartPlus />
                                <span>Add to Cart</span>
                            </button>

                            <button
                                className="product-buy-btn"
                                onClick={handleBuyNow}
                                disabled={product.stock <= 0}
                            >
                                <FaShoppingBag />
                                <span>Buy Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;