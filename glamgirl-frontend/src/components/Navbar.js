import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaGem, FaSearch, FaHeart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
    const { cart } = useCart();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${searchQuery.trim()}`);
            setSearchQuery('');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className="container">
                {/* Logo */}
                <Link to="/" className="navbar-brand fw-bold" style={{ color: '#e91e63' }}>
                    <FaGem className="me-2" />
                    GlamGirl
                </Link>

                {/* Mobile Toggle */}
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Nav Links */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <NavLink to="/" className="nav-link">Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/products" className="nav-link">Products</NavLink>
                        </li>
                    </ul>

                    {/* Search Bar */}
                    <form className="d-flex me-3" onSubmit={handleSearch}>
                        <div className="input-group">
                            <input 
                                type="text" 
                                className="form-control search-input" 
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-pink" type="submit">
                                <FaSearch />
                            </button>
                        </div>
                    </form>

                    {/* Wishlist */}
                    <Link to="/wishlist" className="btn btn-outline-pink me-2 position-relative">
                        <FaHeart />
                        {wishlist.length > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {wishlist.length}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <Link to="/cart" className="btn btn-pink position-relative">
                        <FaShoppingCart className="me-1" /> Cart
                        {cart.total_items > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {cart.total_items}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;