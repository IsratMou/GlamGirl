import React from 'react';
import { Link } from 'react-router-dom';
import { FaCartPlus, FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
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

    const imageUrl = product.image || 'https://via.placeholder.com/300x300?text=No+Image';
    const inWishlist = isInWishlist(product.id);

    return (
        <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div className="card product-card h-100 border-0 shadow-sm">
                <div className="product-image-wrapper">
                    <Link to={`/product/${product.id}`}>
                        <img 
                            src={imageUrl} 
                            alt={product.name} 
                            className="card-img-top product-image"
                        />
                    </Link>
                    
                    {/* Wishlist Button */}
                    <button 
                        className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                        onClick={handleWishlist}
                    >
                        {inWishlist ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    
                    {product.stock <= 0 && (
                        <div className="out-of-stock-badge">Out of Stock</div>
                    )}
                </div>
                
                <div className="card-body d-flex flex-column">
                    <span className="category-badge mb-2">{product.category_name}</span>
                    
                    <Link to={`/product/${product.id}`} className="text-decoration-none">
                        <h6 className="product-title">{product.name}</h6>
                    </Link>
                    
                    <div className="d-flex align-items-center mb-2">
                        <FaStar className="text-warning me-1" />
                        <small className="text-muted">4.5 (120)</small>
                    </div>
                    
                    <div className="mt-auto">
                        <p className="product-price mb-2">৳{parseFloat(product.price).toFixed(0)}</p>
                        
                        <button 
                            className="btn btn-pink w-100"
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                        >
                            <FaCartPlus className="me-2" />
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;