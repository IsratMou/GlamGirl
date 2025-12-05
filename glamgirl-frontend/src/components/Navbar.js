import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
    FaShoppingCart, 
    FaSearch, 
    FaHeart, 
    FaHome, 
    FaStore, 
    FaTags, 
    FaBars,
    FaTimes,
    FaGem,
    FaSparkles
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
    const { cart } = useCart();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    // Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Search Function
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${searchQuery.trim()}`);
            setSearchQuery('');
            setSearchOpen(false);
        }
    };

    // Close menu on body scroll lock
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [menuOpen]);

    return (
        <>
            <nav className={`cute-navbar ${scrolled ? 'scrolled' : ''}`}>
                
                {/* Floating Sparkles Decoration */}
                <div className="navbar-sparkles">
                    <span className="sparkle s1">✦</span>
                    <span className="sparkle s2">✧</span>
                    <span className="sparkle s3">✦</span>
                    <span className="sparkle s4">♡</span>
                    <span className="sparkle s5">✧</span>
                </div>

                <div className="navbar-wrapper">
                    
                    {/* LEFT - Navigation Links */}
                    <div className="nav-left">
                        <NavLink to="/" className={({isActive}) => `nav-pill ${isActive ? 'active' : ''}`}>
                            <FaHome className="pill-icon" />
                            <span>Home</span>
                        </NavLink>
                        <NavLink to="/products" className={({isActive}) => `nav-pill ${isActive ? 'active' : ''}`}>
                            <FaStore className="pill-icon" />
                            <span>Shop</span>
                        </NavLink>
                    </div>

                    {/* CENTER - Logo */}
                    <Link to="/" className="center-logo">
                        <div className="logo-glow"></div>
                        <div className="logo-container">
                            <img 
                                src="/glamgirl-logo.png" 
                                alt="GlamGirl" 
                                className="logo-image"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="logo-fallback">
                                <FaGem className="fallback-icon" />
                                <span>GlamGirl</span>
                            </div>
                        </div>
                        <div className="logo-sparkle-left">✦</div>
                        <div className="logo-sparkle-right">✦</div>
                    </Link>

                    {/* RIGHT - Actions */}
                    <div className="nav-right">
                        <NavLink to="/products?filter=sale" className={({isActive}) => `nav-pill sale-pill ${isActive ? 'active' : ''}`}>
                            <FaTags className="pill-icon" />
                            <span>Sale</span>
                            <span className="hot-badge">HOT</span>
                        </NavLink>
                        
                        {/* Search Toggle */}
                        <button 
                            className={`icon-btn search-btn ${searchOpen ? 'active' : ''}`}
                            onClick={() => setSearchOpen(!searchOpen)}
                        >
                            {searchOpen ? <FaTimes /> : <FaSearch />}
                        </button>

                        {/* Wishlist */}
                        <Link to="/wishlist" className="icon-btn wishlist-btn">
                            <FaHeart />
                            {wishlist.length > 0 && (
                                <span className="icon-badge">{wishlist.length}</span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link to="/cart" className="icon-btn cart-btn">
                            <FaShoppingCart />
                            {cart.total_items > 0 && (
                                <span className="icon-badge cart-badge">{cart.total_items}</span>
                            )}
                        </Link>

                        {/* Mobile Toggle */}
                        <button 
                            className={`icon-btn menu-btn ${menuOpen ? 'active' : ''}`}
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <div className="hamburger">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Expandable Search Bar */}
                <div className={`search-dropdown ${searchOpen ? 'open' : ''}`}>
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search for cute products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus={searchOpen}
                            />
                            {searchQuery && (
                                <button 
                                    type="button" 
                                    className="clear-btn"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                        <button type="submit" className="search-submit">
                            Search ✨
                        </button>
                    </form>
                </div>
            </nav>

            {/* Mobile Overlay */}
            <div 
                className={`mobile-overlay ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(false)}
            ></div>

            {/* Mobile Menu */}
            <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <Link to="/" onClick={() => setMenuOpen(false)} className="drawer-logo">
                        <img 
                            src="/glamgirl-logo.png" 
                            alt="GlamGirl" 
                            className="drawer-logo-img"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <span>GlamGirl</span>
                    </Link>
                    <button className="close-btn" onClick={() => setMenuOpen(false)}>
                        <FaTimes />
                    </button>
                </div>

                {/* Mobile Search */}
                <form className="drawer-search" onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }}>
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                <nav className="drawer-nav">
                    <NavLink to="/" onClick={() => setMenuOpen(false)} className={({isActive}) => isActive ? 'drawer-link active' : 'drawer-link'}>
                        <div className="link-icon"><FaHome /></div>
                        <span>Home</span>
                    </NavLink>
                    <NavLink to="/products" onClick={() => setMenuOpen(false)} className={({isActive}) => isActive ? 'drawer-link active' : 'drawer-link'}>
                        <div className="link-icon"><FaStore /></div>
                        <span>Shop All</span>
                    </NavLink>
                    <NavLink to="/products?filter=sale" onClick={() => setMenuOpen(false)} className={({isActive}) => isActive ? 'drawer-link active sale' : 'drawer-link sale'}>
                        <div className="link-icon"><FaTags /></div>
                        <span>Sale</span>
                        <span className="drawer-badge">HOT</span>
                    </NavLink>
                    <NavLink to="/wishlist" onClick={() => setMenuOpen(false)} className={({isActive}) => isActive ? 'drawer-link active' : 'drawer-link'}>
                        <div className="link-icon"><FaHeart /></div>
                        <span>Wishlist</span>
                        {wishlist.length > 0 && <span className="drawer-count">{wishlist.length}</span>}
                    </NavLink>
                    <NavLink to="/cart" onClick={() => setMenuOpen(false)} className={({isActive}) => isActive ? 'drawer-link active' : 'drawer-link'}>
                        <div className="link-icon"><FaShoppingCart /></div>
                        <span>Cart</span>
                        {cart.total_items > 0 && <span className="drawer-count">{cart.total_items}</span>}
                    </NavLink>
                </nav>

                <div className="drawer-footer">
                    <p>✨ Free shipping over ৳1000 ✨</p>
                </div>
            </div>
        </>
    );
};

export default Navbar;