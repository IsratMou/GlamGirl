import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaStore, FaTags, FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const MobileBottomNav = () => {
    const { cart } = useCart();
    const { wishlist } = useWishlist();

    return (
        <nav className="mobile-bottom-nav">
            {/* Home */}
            <NavLink
                to="/"
                end
                className={({ isActive }) =>
                    'mb-nav-item' + (isActive ? ' active' : '')
                }
            >
                <FaHome className="mb-nav-icon" />
                <span className="mb-nav-label">Home</span>
            </NavLink>

            {/* Shop / Products */}
            <NavLink
                to="/products"
                className={({ isActive }) =>
                    'mb-nav-item' + (isActive ? ' active' : '')
                }
            >
                <FaStore className="mb-nav-icon" />
                <span className="mb-nav-label">Shop</span>
            </NavLink>

            {/* Flash Sale */}
            <NavLink
                to="/flash-sale"
                className={({ isActive }) =>
                    'mb-nav-item' + (isActive ? ' active' : '')
                }
            >
                <FaTags className="mb-nav-icon" />
                <span className="mb-nav-label">Deals</span>
            </NavLink>

            {/* Wishlist */}
            <NavLink
                to="/wishlist"
                className={({ isActive }) =>
                    'mb-nav-item' + (isActive ? ' active' : '')
                }
            >
                <FaHeart className="mb-nav-icon" />
                <span className="mb-nav-label">Wishlist</span>
                {wishlist.length > 0 && (
                    <span className="mb-nav-badge badge-pink">
                        {wishlist.length}
                    </span>
                )}
            </NavLink>

            {/* Cart */}
            <NavLink
                to="/cart"
                className={({ isActive }) =>
                    'mb-nav-item' + (isActive ? ' active' : '')
                }
            >
                <FaShoppingCart className="mb-nav-icon" />
                <span className="mb-nav-label">Cart</span>
                {cart.total_items > 0 && (
                    <span className="mb-nav-badge badge-orange">
                        {cart.total_items}
                    </span>
                )}
            </NavLink>
        </nav>
    );
};

export default MobileBottomNav;