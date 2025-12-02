import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaUndo, FaHeadset } from 'react-icons/fa';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                getProducts(),
                getCategories()
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h1 className="hero-title">
                                Discover Your <span style={{ color: '#e91e63' }}>Beauty</span>
                            </h1>
                            <p className="lead text-muted mb-4">
                                Shop the best cosmetics and beauty products at amazing prices.
                                Free delivery in Dhaka!
                            </p>
                            <div className="hero-buttons">
                                <Link to="/products" className="btn btn-pink btn-lg me-3">
                                    Shop Now
                                </Link>
                                <Link to="/products" className="btn btn-outline-pink btn-lg">
                                    View Products
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-6 text-center mt-4 mt-md-0">
                            <img 
                                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500" 
                                alt="Beauty Products" 
                                className="img-fluid rounded-4 shadow hero-image"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-5">
                <div className="container">
                    <h2 className="section-title text-center">Shop by Category</h2>
                    
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-pink" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            {categories.map(category => (
                                <div key={category.id} className="col-md-3 col-6 mb-4">
                                    <Link 
                                        to={`/products?category=${category.id}`} 
                                        className="text-decoration-none"
                                    >
                                        <div className="category-card">
                                            <div className="category-icon">💄</div>
                                            <h5>{category.name}</h5>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-5 bg-light">
                <div className="container">
                    <h2 className="section-title text-center">Featured Products</h2>
                    
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-pink" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="row">
                                {products.slice(0, 8).map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            
                            {products.length === 0 && (
                                <div className="text-center py-5">
                                    <p className="text-muted">No products found. Add products from admin panel.</p>
                                </div>
                            )}
                            
                            <div className="text-center mt-4">
                                <Link to="/products" className="btn btn-pink btn-lg">
                                    View All Products
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-5">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-md-3 col-6 mb-4">
                            <div className="feature-card">
                                <FaTruck size={40} className="text-pink mb-3" />
                                <h5>Free Delivery</h5>
                                <p className="text-muted small">Free delivery in Dhaka</p>
                            </div>
                        </div>
                        <div className="col-md-3 col-6 mb-4">
                            <div className="feature-card">
                                <FaShieldAlt size={40} className="text-pink mb-3" />
                                <h5>100% Authentic</h5>
                                <p className="text-muted small">Guaranteed original</p>
                            </div>
                        </div>
                        <div className="col-md-3 col-6 mb-4">
                            <div className="feature-card">
                                <FaUndo size={40} className="text-pink mb-3" />
                                <h5>Easy Returns</h5>
                                <p className="text-muted small">7 days return policy</p>
                            </div>
                        </div>
                        <div className="col-md-3 col-6 mb-4">
                            <div className="feature-card">
                                <FaHeadset size={40} className="text-pink mb-3" />
                                <h5>24/7 Support</h5>
                                <p className="text-muted small">Dedicated support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;