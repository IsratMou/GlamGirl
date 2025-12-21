// src/pages/Home.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    FaTruck,
    FaShieldAlt,
    FaUndo,
    FaHeadset,
    FaChevronLeft,
    FaChevronRight,
} from 'react-icons/fa';

import {
    getProducts,
    getCategories,
    getRecommendedProducts,
} from '../services/api';

import ProductCard from '../components/ProductCard';
import FlashSaleSection from '../components/FlashSaleSection';

// Hero Banner Images - public folder থেকে load হবে
const bannerImages = [
    { id: 1, image: '/banner1.png', buttonText: 'Shop Now' },
    { id: 2, image: '/banner2.png', buttonText: 'Buy Now' },
    { id: 3, image: '/banner3.png', buttonText: 'Shop Now' },
    { id: 4, image: '/banner4.png', buttonText: 'Buy Now' },
    { id: 5, image: '/banner5.png', buttonText: 'Shop Now' },
];

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // For You products
    const [recommended, setRecommended] = useState([]);
    const [recLoading, setRecLoading] = useState(true);

    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showAllCategories, setShowAllCategories] = useState(false);

    // Products + Categories + Recommended load (error-safe)
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const results = await Promise.allSettled([
                    getProducts(),
                    getCategories(),
                    getRecommendedProducts(12),
                ]);

                if (!isMounted) return;

                // products
                if (results[0].status === 'fulfilled') {
                    setProducts(results[0].value?.data || []);
                } else {
                    console.error('Products fetch failed:', results[0].reason);
                    setProducts([]);
                }

                // categories
                if (results[1].status === 'fulfilled') {
                    setCategories(results[1].value?.data || []);
                } else {
                    console.error('Categories fetch failed:', results[1].reason);
                    setCategories([]);
                }

                // recommended
                if (results[2].status === 'fulfilled') {
                    const data = results[2].value?.data;
                    setRecommended(Array.isArray(data) ? data : []);
                } else {
                    console.error('Recommended fetch failed:', results[2].reason);
                    setRecommended([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setRecLoading(false);
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
            setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
        }, 5000);

        const handleChange = (event) => {
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
        setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide(
            (prev) => (prev - 1 + bannerImages.length) % bannerImages.length
        );
    };

    const goToSlide = (index) => {
        if (index === currentSlide) return;
        setCurrentSlide(index);
    };

    const visibleCategories = showAllCategories
        ? categories
        : categories.slice(0, 6);

    const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

    // ✅ FIXED: For You always fills up to 12 items (no more showing only 1)
    const forYouProducts = useMemo(() => {
        const featuredIds = new Set(featuredProducts.map((p) => p.id));

        const picked = [];
        const seen = new Set();

        const add = (arr) => {
            (arr || []).forEach((p) => {
                if (!p || seen.has(p.id)) return;
                if (picked.length >= 12) return;
                seen.add(p.id);
                picked.push(p);
            });
        };

        // 1) First: recommended (popular/most bought)
        add(recommended);

        // 2) Fill: products excluding featured
        if (picked.length < 12) {
            add(products.filter((p) => !featuredIds.has(p.id)));
        }

        // 3) Final fill: any remaining products
        if (picked.length < 12) {
            add(products);
        }

        return picked.slice(0, 12);
    }, [recommended, products, featuredProducts]);

    return (
        <>
            {/* Marquee Banner – Navbar এর ঠিক নিচে */}
            <div className="marquee-banner">
                <div className="marquee-content">
                    <span>
                        ✨ WELCOME TO GLAM GIRL 💖 HAPPY SHOPPING 🛍️ ORDER NOW ✨
                        WELCOME TO GLAM GIRL 💖 HAPPY SHOPPING 🛍️ ORDER NOW ✨
                    </span>
                    <span>
                        ✨ WELCOME TO GLAM GIRL 💖 HAPPY SHOPPING 🛍️ ORDER NOW ✨
                        WELCOME TO GLAM GIRL 💖 HAPPY SHOPPING 🛍️ ORDER NOW ✨
                    </span>
                </div>
            </div>

            {/* Hero Section */}
            <section className="simple-hero-section">
                <div className="simple-hero-inner">
                    {/* Banner Slider */}
                    <div className="simple-banner-slider">
                        {bannerImages.map((banner, index) => (
                            <div
                                key={banner.id}
                                className={`simple-banner-slide ${
                                    index === currentSlide ? 'active' : ''
                                }`}
                            >
                                <img
                                    src={banner.image}
                                    alt="GlamGirl banner"
                                    className="hero-banner-img"
                                    loading="lazy"
                                />
                                {/* Single Button - Bottom Center */}
                                <div className="simple-banner-button">
                                    <Link
                                        to="/products"
                                        className="btn btn-pink btn-lg px-5 py-3"
                                    >
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
                                className={`simple-dot ${
                                    index === currentSlide ? 'active' : ''
                                }`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Flash Sale Section */}
            <FlashSaleSection />

            {/* Categories Section (tight padding) */}
            <section className="gg-section gg-section--category">
                <div className="container">
                    <h2 className="section-title category-section-title text-center mb-2">
                        Shop by Category
                    </h2>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-pink" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="row g-3 category-row">
                                {visibleCategories.map((category) => {
                                    const imageUrl = category.image;
                                    const initial =
                                        (category.name || '').charAt(0).toUpperCase() ||
                                        '?';

                                    return (
                                        <div
                                            key={category.id}
                                            className="col-4 col-sm-3 col-md-3 col-lg-2"
                                        >
                                            <Link
                                                to={`/products?category=${category.id}`}
                                                className="text-decoration-none"
                                            >
                                                <div className="category-card h-100">
                                                    <div className="category-photo-frame">
                                                        <div className="category-photo-inner">
                                                            {imageUrl ? (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={category.name}
                                                                    className="category-photo-image"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <span className="category-photo-letter">
                                                                    {initial}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <h5 className="category-name-text mb-1">
                                                        {category.name}
                                                    </h5>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Show more button */}
                            {!showAllCategories && categories.length > 6 && (
                                <div className="text-center mt-3">
                                    <button
                                        type="button"
                                        className="btn btn-outline-pink btn-sm px-4"
                                        onClick={() => setShowAllCategories(true)}
                                    >
                                        Show more
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    <div className="text-center mt-3">
                        <Link to="/products" className="btn btn-outline-pink btn-lg">
                            View All Categories
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products (Daraz-style) */}
            <section className="gg-section gg-section--tight gg-featured">
                <div className="container">
                    <div className="gg-featured__header">
                        <div className="gg-featured__left">
                            <h2 className="gg-featured__title">Featured Products</h2>
                            <span className="gg-featured__tag">Top Picks</span>
                        </div>

                        <Link to="/products" className="gg-featured__more">
                            View All
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-pink" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted mb-0">
                                No products found. Add products from admin panel.
                            </p>
                        </div>
                    ) : (
                        <div className="row g-2 gg-featured__grid">
                            {featuredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    compact
                                    wrapperClassName="col-6 col-md-3 col-lg-2"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* For You (Most Bought / Popular) */}
            <section className="gg-section gg-section--tight gg-for-you" aria-labelledby="for-you-title">
                <div className="container">
                    <div className="gg-for-you__header">
                        <div className="gg-for-you__left">
                            <h2 id="for-you-title" className="gg-for-you__title">
                                For You
                            </h2>
                            <span className="gg-for-you__tag">Popular</span>
                        </div>

                        <Link to="/products" className="gg-for-you__more">
                            See more
                        </Link>
                    </div>

                    {recLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-pink" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : forYouProducts.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted mb-0">No recommendations right now.</p>
                        </div>
                    ) : (
                        <div className="row g-2 gg-for-you__grid">
                            {forYouProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    compact
                                    wrapperClassName="col-6 col-md-3 col-lg-2"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Why Choose Us */}
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
                                <p className="text-muted">
                                    Free delivery in Dhaka for orders above ৳1000
                                </p>
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
                                <p className="text-muted">
                                    7-day return policy for all products
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="feature-card h-100">
                                <div className="feature-icon mb-4">
                                    <FaHeadset size={48} className="text-pink" />
                                </div>
                                <h5>24/7 Support</h5>
                                <p className="text-muted">
                                    Dedicated customer support team
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;