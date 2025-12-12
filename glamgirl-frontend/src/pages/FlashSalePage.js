import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBolt } from 'react-icons/fa';
import { getFlashSaleProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const FlashSalePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getFlashSaleProducts();
                setProducts(res.data || []);
            } catch (error) {
                console.error('Error loading flash sale products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container py-4">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb small">
                    <li className="breadcrumb-item">
                        <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item active">Flash Sale</li>
                </ol>
            </nav>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                    <span className="flash-sale-icon">
                        <FaBolt />
                    </span>
                    <h1 className="h4 m-0">Flash Sale</h1>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-pink" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">
                        No flash sale products available right now.
                    </p>
                </div>
            ) : (
                <div className="row g-3">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FlashSalePage;