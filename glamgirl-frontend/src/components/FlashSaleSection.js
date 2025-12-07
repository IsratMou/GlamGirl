import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBolt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getFlashSaleProducts } from '../services/api';

const FlashSaleSection = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [endTime, setEndTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const sliderRef = useRef(null);

    // Flash sale products load
    useEffect(() => {
        const fetchFlashSale = async () => {
            try {
                const res = await getFlashSaleProducts();
                const data = res.data || [];
                setProducts(data);

                // যার flash_ends_at আছে, তাদের মধ্যে earliest time নেয়া (timer এর জন্য)
                const withEnd = data.filter((p) => p.flash_ends_at);
                if (withEnd.length > 0) {
                    const earliest = withEnd.reduce(
                        (min, p) =>
                            new Date(p.flash_ends_at) < new Date(min.flash_ends_at)
                                ? p
                                : min,
                        withEnd[0]
                    );
                    setEndTime(new Date(earliest.flash_ends_at).getTime());
                }
            } catch (err) {
                console.error('Error loading flash sale products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFlashSale();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!endTime) return;

        const updateTime = () => {
            const now = Date.now();
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeLeft({
                    hours: '00',
                    minutes: '00',
                    seconds: '00',
                    expired: true,
                });
                return;
            }

            const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(
                2,
                '0'
            );
            const minutes = String(
                Math.floor((diff / (1000 * 60)) % 60)
            ).padStart(2, '0');
            const seconds = String(
                Math.floor((diff / 1000) % 60)
            ).padStart(2, '0');

            setTimeLeft({
                hours,
                minutes,
                seconds,
                expired: false,
            });
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    const scrollLeft = () => {
        if (!sliderRef.current) return;
        sliderRef.current.scrollBy({ left: -600, behavior: 'smooth' });
    };

    const scrollRight = () => {
        if (!sliderRef.current) return;
        sliderRef.current.scrollBy({ left: 600, behavior: 'smooth' });
    };

    // কোনো flash sale না থাকলে section hide
    if (!loading && products.length === 0) {
        return null;
    }

    return (
        <section className="flash-sale-section">
            <div className="container">
                {/* Header */}
                <div className="flash-sale-header">
                    <div className="flash-sale-left">
                        <div className="flash-sale-title">
                            <span className="flash-sale-icon">
                                <FaBolt />
                            </span>
                            <span className="flash-sale-text">Flash Sale</span>
                        </div>

                        <span className="flash-sale-subtitle">On Sale Now</span>

                        {timeLeft && !timeLeft.expired && (
                            <div className="flash-sale-timer">
                                <span className="timer-label">Ends in</span>
                                <div className="timer-boxes">
                                    <span className="timer-box">
                                        {timeLeft.hours}
                                    </span>
                                    <span className="timer-sep">:</span>
                                    <span className="timer-box">
                                        {timeLeft.minutes}
                                    </span>
                                    <span className="timer-sep">:</span>
                                    <span className="timer-box">
                                        {timeLeft.seconds}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flash-sale-right">
                        <Link to="/products" className="flash-sale-view-all">
                            Shop more
                        </Link>
                        <div className="flash-sale-arrows">
                            <button
                                type="button"
                                className="flash-arrow-btn"
                                onClick={scrollLeft}
                                aria-label="Scroll left"
                            >
                                <FaChevronLeft />
                            </button>
                            <button
                                type="button"
                                className="flash-arrow-btn"
                                onClick={scrollRight}
                                aria-label="Scroll right"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border text-pink" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="flash-sale-slider-wrapper">
                        <div className="flash-sale-slider" ref={sliderRef}>
                            {products.map((product) => {
                                const hasDiscount =
                                    product.flash_price &&
                                    Number(product.flash_price) <
                                        Number(product.price);

                                const price = hasDiscount
                                    ? Number(product.flash_price)
                                    : Number(product.price);

                                const originalPrice = Number(product.price);

                                const discountPercent =
                                    hasDiscount && product.discount_percent
                                        ? product.discount_percent
                                        : 0;

                                const stock = product.stock || 0;
                                // demo calculation: stock কম হলে bar ছোট হবে
                                const stockPercent = Math.max(
                                    8,
                                    Math.min(100, stock * 7)
                                );

                                const imageUrl =
                                    product.image ||
                                    'https://via.placeholder.com/300x300?text=Product';

                                return (
                                    <Link
                                        key={product.id}
                                        to={`/product/${product.id}`}
                                        className="flash-sale-card"
                                    >
                                        <div className="flash-sale-image-wrapper">
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                className="flash-sale-image"
                                            />
                                            {discountPercent > 0 && (
                                                <span className="flash-sale-discount-badge">
                                                    -{discountPercent}%
                                                </span>
                                            )}
                                        </div>

                                        <div className="flash-sale-info">
                                            <p className="flash-sale-name">
                                                {product.name}
                                            </p>

                                            <div className="flash-sale-price-row">
                                                <span className="flash-sale-price">
                                                    ৳{price.toFixed(0)}
                                                </span>
                                                {hasDiscount && (
                                                    <span className="flash-sale-original">
                                                        ৳{originalPrice.toFixed(0)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flash-sale-stock-row">
                                                <div className="stock-bar">
                                                    <div
                                                        className="stock-bar-fill"
                                                        style={{
                                                            width: `${stockPercent}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="stock-text">
                                                    Stock: {stock}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FlashSaleSection;