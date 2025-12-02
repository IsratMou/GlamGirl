import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaFilter, FaTimes, FaSearch } from 'react-icons/fa';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

const Products = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [priceRange, setPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    useEffect(() => {
        fetchData();
    }, []);

    // Update search when URL changes
    useEffect(() => {
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        setSearchQuery(search);
        setSelectedCategory(category);
    }, [searchParams]);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                getProducts(),
                getCategories()
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter & Sort Products
    const getFilteredProducts = () => {
        let filtered = [...products];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category == selectedCategory);
        }

        // Price filter
        if (priceRange === 'under500') {
            filtered = filtered.filter(p => parseFloat(p.price) < 500);
        } else if (priceRange === '500to1000') {
            filtered = filtered.filter(p => parseFloat(p.price) >= 500 && parseFloat(p.price) <= 1000);
        } else if (priceRange === 'above1000') {
            filtered = filtered.filter(p => parseFloat(p.price) > 1000);
        }

        // Sort
        if (sortBy === 'price_low') {
            filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortBy === 'price_high') {
            filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        } else if (sortBy === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        return filtered;
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setPriceRange('all');
        setSortBy('newest');
        setSearchQuery('');
    };

    const filteredProducts = getFilteredProducts();

    return (
        <div className="container py-5">
            <div className="row">
                {/* Sidebar Filters */}
                <div className="col-lg-3 mb-4">
                    <div className="filter-card">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">
                                <FaFilter className="me-2" />
                                Filters
                            </h5>
                            <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                                <FaTimes className="me-1" /> Clear
                            </button>
                        </div>

                        {/* Search in sidebar */}
                        <div className="mb-4">
                            <h6 className="filter-title">Search</h6>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <span className="input-group-text">
                                    <FaSearch />
                                </span>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="mb-4">
                            <h6 className="filter-title">Categories</h6>
                            <div className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name="category"
                                    id="catAll"
                                    checked={selectedCategory === ''}
                                    onChange={() => setSelectedCategory('')}
                                />
                                <label className="form-check-label" htmlFor="catAll">
                                    All Categories
                                </label>
                            </div>
                            {categories.map(cat => (
                                <div className="form-check" key={cat.id}>
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        name="category"
                                        id={`cat${cat.id}`}
                                        checked={selectedCategory == cat.id}
                                        onChange={() => setSelectedCategory(cat.id)}
                                    />
                                    <label className="form-check-label" htmlFor={`cat${cat.id}`}>
                                        {cat.name}
                                    </label>
                                </div>
                            ))}
                        </div>

                        {/* Price Range */}
                        <div className="mb-4">
                            <h6 className="filter-title">Price Range</h6>
                            {[
                                { value: 'all', label: 'All Prices' },
                                { value: 'under500', label: 'Under ৳500' },
                                { value: '500to1000', label: '৳500 - ৳1000' },
                                { value: 'above1000', label: 'Above ৳1000' },
                            ].map(option => (
                                <div className="form-check" key={option.value}>
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        name="price"
                                        id={`price${option.value}`}
                                        checked={priceRange === option.value}
                                        onChange={() => setPriceRange(option.value)}
                                    />
                                    <label className="form-check-label" htmlFor={`price${option.value}`}>
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="col-lg-9">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                        <div>
                            <h4 className="mb-0">
                                {searchQuery ? `Search: "${searchQuery}"` : 'Products'}
                                <span className="text-muted ms-2">({filteredProducts.length} items)</span>
                            </h4>
                        </div>
                        <select
                            className="form-select w-auto"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="name">Name: A-Z</option>
                        </select>
                    </div>

                    {/* Products */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-pink" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <div className="col-12 text-center py-5">
                                    <h5 className="text-muted">No products found</h5>
                                    <p className="text-muted">Try different search or filters</p>
                                    <button className="btn btn-pink mt-3" onClick={clearFilters}>
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;