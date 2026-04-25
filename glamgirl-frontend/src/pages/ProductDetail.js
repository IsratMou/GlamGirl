import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCartPlus, FaMinus, FaPlus, FaTruck, FaShieldAlt, FaBolt, FaTimes } from 'react-icons/fa';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const FALLBACK_IMG = '/no-image.svg';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [quantity, setQuantity] = useState(1);
    const [activeIndex, setActiveIndex] = useState(0);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [animKey, setAnimKey] = useState(0);

    useEffect(() => {
        let mounted = true;

        const fetchProduct = async () => {
            try {
                const res = await getProduct(id);
                if (!mounted) return;
                setProduct(res.data);
                setActiveIndex(0);
                setQuantity(1);
            } catch (e) {
                console.error('Error:', e);
                if (mounted) setProduct(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        setLoading(true);
        fetchProduct();

        return () => {
            mounted = false;
        };
    }, [id]);

    useEffect(() => {
        setAnimKey((k) => k + 1);
    }, [activeIndex]);

    const gallery = useMemo(() => {
        if (!product) return [];
        const imgs = Array.isArray(product.images) ? product.images : [];

        const sorted = imgs
            .slice()
            .sort((a, b) => {
                const ap = a?.is_primary ? 1 : 0;
                const bp = b?.is_primary ? 1 : 0;
                if (bp !== ap) return bp - ap;
                const ao = Number(a?.sort_order ?? 0);
                const bo = Number(b?.sort_order ?? 0);
                if (ao !== bo) return ao - bo;
                return Number(a?.id ?? 0) - Number(b?.id ?? 0);
            })
            .map((x) => ({
                url: x?.image || null,
                alt: x?.alt_text || product.name,
            }))
            .filter((x) => !!x.url);

        if (sorted.length === 0 && product.image) {
            return [{ url: product.image, alt: product.name }];
        }

        return sorted;
    }, [product]);

    const mainImage = gallery[activeIndex]?.url || product?.image || FALLBACK_IMG;

    const hasFlashDiscount =
        product?.is_flash_sale &&
        product?.flash_price &&
        Number(product.flash_price) < Number(product.price);

    const currentPrice = hasFlashDiscount ? Number(product.flash_price) : Number(product?.price || 0);
    const originalPrice = Number(product?.price || 0);
    const discountPercent = hasFlashDiscount && product?.discount_percent ? product.discount_percent : 0;

    const inStock = (product?.stock || 0) > 0;

    const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : q));
    const increaseQty = () => {
        if (!product) return;
        setQuantity((q) => (q < product.stock ? q + 1 : q));
    };

    const handleAddToCart = async () => {
        if (!product) return;
        const result = await addToCart(product.id, quantity);
        if (result.success) toast.success(`Added ${quantity} item(s) to cart! 🛒`);
        else toast.error(result.error);
    };

    const handleBuyNow = async () => {
        if (!product) return;
        const result = await addToCart(product.id, quantity);
        if (result.success) {
            toast.success('Redirecting to checkout...');
            navigate('/checkout');
        } else {
            toast.error(result.error);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-pink" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container py-5 text-center">
                <h4>Product not found</h4>
                <Link to="/products" className="btn btn-pink mt-3">
                    Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-3 gg-pdp3 product-detail-page">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb small mb-0">
                    <li className="breadcrumb-item">
                        <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/products">Products</Link>
                    </li>
                    <li className="breadcrumb-item active">{product.name}</li>
                </ol>
            </nav>

            <div className="row gy-3">
                <div className="col-lg-6">
                    <div className="gg-pdp3__gallery">
                        {gallery.length > 1 && (
                            <div className="gg-pdp3__thumbs">
                                {gallery.map((img, idx) => (
                                    <button
                                        key={`${img.url}-${idx}`}
                                        type="button"
                                        className={`gg-pdp3__thumb ${idx === activeIndex ? 'active' : ''}`}
                                        onClick={() => setActiveIndex(idx)}
                                    >
                                        <img src={img.url} alt={img.alt} loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="gg-pdp3__main">
                            <img
                                key={animKey}
                                className="gg-pdp3__mainImg"
                                src={mainImage}
                                alt={product.name}
                                loading="lazy"
                                onClick={() => setLightboxOpen(true)}
                                style={{ cursor: 'zoom-in' }}
                            />

                            {hasFlashDiscount && (
                                <span className="gg-pdp3__flash">
                                    <FaBolt className="me-1" />
                                    Flash Deal
                                </span>
                            )}

                            {discountPercent > 0 && (
                                <span className="gg-pdp3__off">-{discountPercent}%</span>
                            )}
                        </div>

                        {gallery.length > 1 && (
                            <div className="gg-pdp3__thumbsMobile">
                                {gallery.map((img, idx) => (
                                    <button
                                        key={`${img.url}-m-${idx}`}
                                        type="button"
                                        className={`gg-pdp3__thumbM ${idx === activeIndex ? 'active' : ''}`}
                                        onClick={() => setActiveIndex(idx)}
                                    >
                                        <img src={img.url} alt={img.alt} loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-lg-6">
                    <span className="category-badge mb-2">{product.category_name}</span>

                    <h1 className="gg-pdp3__title">{product.name}</h1>


                    <div className="gg-pdp3__priceBox">
                        <div className="gg-pdp3__priceRow">
                            <span className="gg-pdp3__priceMain">৳{currentPrice.toFixed(0)}</span>
                            {hasFlashDiscount && (
                                <span className="gg-pdp3__priceOld">৳{originalPrice.toFixed(0)}</span>
                            )}
                        </div>

                        <div className="gg-pdp3__stockRow">
                            {inStock ? (
                                <span className="gg-pdp3__stock ok">
                                    In Stock <span className="gg-pdp3__muted">({product.stock} available)</span>
                                </span>
                            ) : (
                                <span className="gg-pdp3__stock bad">Out of Stock</span>
                            )}
                        </div>
                    </div>

                    <div className="gg-pdp3__trust">
                        <div className="gg-pdp3__trustItem">
                            <FaTruck className="text-pink" />
                            <span>Free Delivery in Dhaka</span>
                        </div>
                        <div className="gg-pdp3__trustItem">
                            <FaShieldAlt className="text-pink" />
                            <span>100% Authentic</span>
                        </div>
                    </div>

                    {inStock && (
                        <div className="gg-pdp3__qtyWrap">
                            <span className="gg-pdp3__qtyLabel">Quantity</span>
                            <div className="quantity-selector">
                                <button className="btn btn-outline-secondary" onClick={decreaseQty}>
                                    <FaMinus />
                                </button>
                                <span className="quantity-value">{quantity}</span>
                                <button className="btn btn-outline-secondary" onClick={increaseQty}>
                                    <FaPlus />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="gg-pdp3__ctaRow">
                        <button className="btn btn-pink btn-lg w-100" onClick={handleAddToCart} disabled={!inStock}>
                            <FaCartPlus className="me-2" />
                            Add to Cart
                        </button>

                        <button className="btn btn-outline-pink btn-lg w-100 gg-pdp3__buy" onClick={handleBuyNow} disabled={!inStock}>
                            Buy Now
                        </button>
                    </div>

                    <div className="gg-pdp3__accordion">
                        <details open>
                            <summary>Product details</summary>
                            <p className="gg-pdp3__desc">{product.description}</p>
                        </details>
                        <details>
                            <summary>Shipping</summary>
                            <p className="gg-pdp3__desc">Delivery time may vary by location.</p>
                        </details>
                        <details>
                            <summary>Returns</summary>
                            <p className="gg-pdp3__desc">Return policy applies as per store rules.</p>
                        </details>
                    </div>

                    <div className="gg-pdp3__sticky">
                        <div className="gg-pdp3__stickyPrice">
                            <div className="gg-pdp3__stickyMain">৳{currentPrice.toFixed(0)}</div>
                            {hasFlashDiscount && <div className="gg-pdp3__stickyOld">৳{originalPrice.toFixed(0)}</div>}
                        </div>

                        {inStock && (
                            <div className="gg-pdp3__stickyQty">
                                <button type="button" onClick={decreaseQty}><FaMinus /></button>
                                <span>{quantity}</span>
                                <button type="button" onClick={increaseQty}><FaPlus /></button>
                            </div>
                        )}

                        <button type="button" className="gg-pdp3__stickyBtn" onClick={handleAddToCart} disabled={!inStock}>
                            Add
                        </button>
                    </div>
                </div>
            </div>

            {lightboxOpen && (
                <div className="gg-lb" role="dialog" aria-label="Image preview">
                    <button className="gg-lb__overlay" onClick={() => setLightboxOpen(false)} aria-label="Close" />
                    <div className="gg-lb__box">
                        <button className="gg-lb__close" onClick={() => setLightboxOpen(false)} aria-label="Close">
                            <FaTimes />
                        </button>
                        <img src={mainImage} alt={product.name} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;