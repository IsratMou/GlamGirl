import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaTruck,
    FaShieldAlt,
    FaUndo,
    FaHeadset,
    FaChevronLeft,
    FaChevronRight
} from 'react-icons/fa';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

// Hero Banner Images - public folder থেকে load হবে
const bannerImages = [
    { id: 1, image: '/banner1.png', buttonText: 'Shop Now' },
    { id: 2, image: '/banner2.png', buttonText: 'Buy Now' },
    { id: 3, image: '/banner3.png', buttonText: 'Shop Now' },
    { id: 4, image: '/banner4.png', buttonText: 'Buy Now' },
    { id: 5, image: '/banner5.png', buttonText: 'Shop Now' }
];

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Products + Categories load
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    getProducts(),
                    getCategories()
                ]);

                if (!isMounted) return;

                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Auto-slide (reduce-motion হলে বন্ধ)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (mediaQuery.matches) {
            return;
        }

        const intervalId = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % bannerImages.length);
        }, 5000);

        const handleChange = event => {
            if (event.matches) {
                clearInterval(intervalId);
            }
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else if (mediaQuery.addListener) {
            mediaQuery.addListener(handleChange);
        }

        return () => {
            clearInterval(intervalId);
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            } else if (mediaQuery.removeListener) {
                mediaQuery.removeListener(handleChange);
            }
        };
    }, []);

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % bannerImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + bannerImages.length) % bannerImages.length);
    };

    const goToSlide = (index) => {
        if (index === currentSlide) return;
        setCurrentSlide(index);
    };

    return (
        <>
            {/* 🔔 Marquee Banner – এখন Navbar-এর ঠিক নিচে */}
            <div className="marquee-banner">
                <div className="marquee-content">
                    <span>
                        ✨ WELCOME TO GLAM GIRL 💖 HAPPY SHOPPING 🛍️ ORDER NOW ✨ WELCOME TO GLAM GIRL 💖
                        HAPPY SHOPPING 🛍️ ORDER NOW ✨ WELCOME TO GLAM GIRL 💖 HAPPY SHOPPING 🛍️ ORDER NOW ✨
                        WELCOME TO GLAM GIRL 💖 HAPPY SHOPPING 🛍️ ORDER NOW ✨
                    </span>
                </div>
            </div>

            {/* 🎀 Hero Section – এখন marquee-এর নিচে */}
            <section className="simple-hero-section">
                <div className="simple-hero-inner">
                    {/* Banner Slider */}
                    <div className="simple-banner-slider">
                        {bannerImages.map((banner, index) => (
                            <div
                                key={banner.id}
                                className={`simple-banner-slide ${index === currentSlide ? 'active' : ''}`}
                                style={{ backgroundImage: `url(${banner.image})` }}
                            >
                                {/* Single Button - Bottom Center */}
                                <div className="simple-banner-button">
                                    <Link to="/products" className="btn btn-pink btn-lg px-5 py-3">
                                        {banner.buttonText}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        type="button"
                        className="simple-banner-nav prev"
                        onClick={prevSlide}
                        aria-label="Previous banner"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        type="button"
                        className="simple-banner-nav next"
                        onClick={nextSlide}
                        aria-label="Next banner"
                    >
                        <FaChevronRight />
                    </button>

                    {/* Dots Indicator */}
                    <div className="simple-banner-dots">
                        {bannerImages.map((_, index) => (
                            <button
                                type="button"
                                key={index}
                                className={`simple-dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-5">
                <div className="container">
                    <h2 className="section-title text-center mb-5">Shop by Category</h2>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-pink" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {categories.slice(0, 8).map(category => (
                                <div key={category.id} className="col-xl-3 col-lg-4 col-md-6">
                                    <Link
                                        to={`/products?category=${category.id}`}
                                        className="text-decoration-none"
                                    >
                                        <div className="category-card h-100">
                                            <div className="category-icon">💎</div>
                                            <h5 className="fw-semibold">{category.name}</h5>
                                            <p className="text-muted small mb-0">Shop Collection</p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-5">
                        <Link to="/products" className="btn btn-outline-pink btn-lg">
                            View All Categories
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-5 bg-light">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center mb-5">
                        <h2 className="section-title mb-0">Featured Products</h2>
                        <Link to="/products" className="btn btn-pink">
                            View All
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-pink" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="row g-4">
                                {products.slice(0, 8).map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {products.length === 0 && (
                                <div className="text-center py-5">
                                    <p className="text-muted">
                                        No products found. Add products from admin panel.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-5">
                <div className="container">
                    <h2 className="section-title text-center mb-5">Why Choose Us</h2>
                    <div className="row g-4">
                        <div className="col-lg-3 col-md-6">
                            <div className="feature-card h-100">
                                <div className="feature-icon mb-4">
                                    <FaTruck size={48} className="text-pink" />
                                </div>
                                <h5>Free Delivery</h5>
                                <p className="text-muted">Free delivery in Dhaka for orders above ৳1000</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="feature-card h-100">
                                <div className="feature-icon mb-4">
                                    <FaShieldAlt size={48} className="text-pink" />
                                </div>
                                <h5>100% Authentic</h5>
                                <p className="text-muted">
                                    Guaranteed original products with certificates
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="feature-card h-100">
                                <div className="feature-icon mb-4">
                                    <FaUndo size={48} className="text-pink" />
                                </div>
                                <h5>Easy Returns</h5>
                                <p className="text-muted">7-day return policy for all products</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="feature-card h-100">
                                <div className="feature-icon mb-4">
                                    <FaHeadset size={48} className="text-pink" />
                                </div>
                                <h5>24/7 Support</h5>
                                <p className="text-muted">Dedicated customer support team</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;