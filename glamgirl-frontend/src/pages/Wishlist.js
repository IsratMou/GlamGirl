import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaCartPlus } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const Wishlist = () => {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleAddToCart = async (product) => {
        const result = await addToCart(product.id, 1);
        if (result.success) {
            toast.success('Added to cart! 🛒');
        } else {
            toast.error(result.error);
        }
    };

    const handleRemove = (productId) => {
        removeFromWishlist(productId);
        toast.success('Removed from wishlist!');
    };

    if (wishlist.length === 0) {
        return (
            <div className="container py-5">
                <div className="empty-wishlist text-center py-5">
                    <FaHeart size={80} className="text-muted mb-4" />
                    <h3>Your wishlist is empty</h3>
                    <p className="text-muted">Save your favorite products here!</p>
                    <Link to="/products" className="btn btn-pink btn-lg mt-3">
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4">
                <FaHeart className="text-pink me-2" />
                My Wishlist ({wishlist.length} items)
            </h2>

            <div className="row">
                {wishlist.map(product => (
                    <div key={product.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                        <div className="card wishlist-card h-100 border-0 shadow-sm">
                            <div className="position-relative">
                                <Link to={`/product/${product.id}`}>
                                    <img 
                                        src={product.image || 'https://via.placeholder.com/300'} 
                                        alt={product.name}
                                        className="card-img-top wishlist-image"
                                    />
                                </Link>
                                <button 
                                    className="btn btn-danger btn-sm wishlist-remove-btn"
                                    onClick={() => handleRemove(product.id)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                            
                            <div className="card-body d-flex flex-column">
                                <span className="category-badge mb-2">{product.category_name}</span>
                                
                                <Link to={`/product/${product.id}`} className="text-decoration-none">
                                    <h6 className="product-title">{product.name}</h6>
                                </Link>
                                
                                <p className="product-price mt-auto mb-2">
                                    ৳{parseFloat(product.price).toFixed(0)}
                                </p>
                                
                                <button 
                                    className="btn btn-pink w-100"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stock <= 0}
                                >
                                    <FaCartPlus className="me-2" />
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
