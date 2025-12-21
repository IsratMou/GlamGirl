import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaFilter, FaTimes, FaSearch, FaSortAmountDown } from 'react-icons/fa';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

const safeLower = (v) => (typeof v === 'string' ? v.toLowerCase() : '');
const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const SORTS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Low Price' },
    { value: 'price_high', label: 'High Price' },
    { value: 'name', label: 'A-Z' },
];

const PRICES = [
    { value: 'all', label: 'All' },
    { value: 'under500', label: '< ৳500' },
    { value: '500to1000', label: '৳500-1000' },
    { value: 'above1000', label: '> ৳1000' },
];

const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
};

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters (URL-driven)
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [priceRange, setPriceRange] = useState(searchParams.get('price') || 'all');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

    // Search (input + debounced query)
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    // Bottom sheet
    const [sheetOpen, setSheetOpen] = useState(false);

    // Load more
    const [visibleCount, setVisibleCount] = useState(30);
    const sentinelRef = useRef(null);

    // Fetch data
    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                const [pRes, cRes] = await Promise.all([getProducts(), getCategories()]);
                if (!mounted) return;

                setProducts(normalizeList(pRes.data));
                setCategories(normalizeList(cRes.data));
            } catch (e) {
                console.error('Products page error:', e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchData();
        return () => {
            mounted = false;
        };
    }, []);

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => setSearchQuery(searchInput.trim()), 250);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Sync state when URL changes (back/forward)
    useEffect(() => {
        setSelectedCategory(searchParams.get('category') || '');
        setPriceRange(searchParams.get('price') || 'all');
        setSortBy(searchParams.get('sort') || 'newest');

        const s = searchParams.get('search') || '';
        setSearchInput(s);
        setSearchQuery(s);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Push filters to URL
    useEffect(() => {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory) params.category = String(selectedCategory);
        if (priceRange !== 'all') params.price = priceRange;
        if (sortBy !== 'newest') params.sort = sortBy;

        setSearchParams(params, { replace: true });
        setVisibleCount(30);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, selectedCategory, priceRange, sortBy]);

    const filteredProducts = useMemo(() => {
        let list = products.slice();

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter((p) => {
                const name = safeLower(p?.name);
                const desc = safeLower(p?.description);
                const catName = safeLower(p?.category_name);
                return name.includes(q) || desc.includes(q) || catName.includes(q);
            });
        }

        // Category
        if (selectedCategory) {
            const cid = String(selectedCategory);
            list = list.filter((p) => String(p?.category) === cid);
        }

        // Price
        if (priceRange === 'under500') list = list.filter((p) => toNum(p?.price) < 500);
        if (priceRange === '500to1000') {
            list = list.filter((p) => {
                const pr = toNum(p?.price);
                return pr >= 500 && pr <= 1000;
            });
        }
        if (priceRange === 'above1000') list = list.filter((p) => toNum(p?.price) > 1000);

        // Sort
        if (sortBy === 'price_low') list.sort((a, b) => toNum(a?.price) - toNum(b?.price));
        else if (sortBy === 'price_high') list.sort((a, b) => toNum(b?.price) - toNum(a?.price));
        else if (sortBy === 'name') list.sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')));
        else list.sort((a, b) => toNum(b?.id) - toNum(a?.id)); // newest

        return list;
    }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

    const visibleProducts = useMemo(
        () => filteredProducts.slice(0, visibleCount),
        [filteredProducts, visibleCount]
    );

    const canLoadMore = visibleCount < filteredProducts.length;

    // Auto load more (light)
    useEffect(() => {
        if (!sentinelRef.current) return;
        const el = sentinelRef.current;

        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && canLoadMore && !loading) {
                    setVisibleCount((v) => Math.min(v + 24, filteredProducts.length));
                }
            },
            { threshold: 0.2 }
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, [canLoadMore, loading, filteredProducts.length]);

    const clearAll = () => {
        setSelectedCategory('');
        setPriceRange('all');
        setSortBy('newest');
        setSearchInput('');
        setSearchQuery('');
        setSheetOpen(false);
    };

    const activeCount =
        (selectedCategory ? 1 : 0) +
        (priceRange !== 'all' ? 1 : 0) +
        (sortBy !== 'newest' ? 1 : 0) +
        (searchQuery ? 1 : 0);

    return (
        <div className="gg-plp3 gg-section gg-section--tight">
            <div className="container">
                {/* Sticky search + actions */}
                <div className="gg-plp3__bar">
                    <div className="gg-plp3__search">
                        <FaSearch className="gg-plp3__searchicon" />
                        <input
                            className="gg-plp3__searchinput"
                            placeholder="Search products..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        {searchInput && (
                            <button
                                type="button"
                                className="gg-plp3__x"
                                onClick={() => setSearchInput('')}
                                aria-label="Clear search"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        className="gg-plp3__action"
                        onClick={() => setSheetOpen(true)}
                    >
                        <FaFilter />
                        <span>Filter</span>
                        {activeCount > 0 && <span className="gg-plp3__badge">{activeCount}</span>}
                    </button>

                    <button
                        type="button"
                        className="gg-plp3__action gg-plp3__sortbtn"
                        onClick={() => setSheetOpen(true)}
                    >
                        <FaSortAmountDown />
                        <span>Sort</span>
                    </button>
                </div>

                {/* Category chips (tap-friendly) */}
                <div className="gg-plp3__chips">
                    <button
                        type="button"
                        className={`gg-plp3__chip ${selectedCategory === '' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('')}
                    >
                        All
                    </button>

                    {categories.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            className={`gg-plp3__chip ${
                                String(selectedCategory) === String(c.id) ? 'active' : ''
                            }`}
                            onClick={() => setSelectedCategory(c.id)}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                {/* Meta + quick clear chips */}
                <div className="gg-plp3__meta">
                    <div className="gg-plp3__title">
                        Products <span className="gg-plp3__count">{filteredProducts.length}</span>
                        {searchQuery && <span className="gg-plp3__q">“{searchQuery}”</span>}
                    </div>

                    {activeCount > 0 && (
                        <button type="button" className="gg-plp3__clear" onClick={clearAll}>
                            Clear
                        </button>
                    )}
                </div>

                {activeCount > 0 && (
                    <div className="gg-plp3__activechips">
                        {selectedCategory && (
                            <button type="button" className="gg-plp3__activechip" onClick={() => setSelectedCategory('')}>
                                Category <FaTimes />
                            </button>
                        )}
                        {priceRange !== 'all' && (
                            <button type="button" className="gg-plp3__activechip" onClick={() => setPriceRange('all')}>
                                Price <FaTimes />
                            </button>
                        )}
                        {sortBy !== 'newest' && (
                            <button type="button" className="gg-plp3__activechip" onClick={() => setSortBy('newest')}>
                                Sort <FaTimes />
                            </button>
                        )}
                        {searchQuery && (
                            <button
                                type="button"
                                className="gg-plp3__activechip"
                                onClick={() => {
                                    setSearchInput('');
                                    setSearchQuery('');
                                }}
                            >
                                Search <FaTimes />
                            </button>
                        )}
                    </div>
                )}

                {/* Product grid */}
                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border text-pink" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="gg-plp3__empty">
                        <h5 className="text-muted mb-1">No products found</h5>
                        <p className="text-muted mb-3">Try different search or filters</p>
                        <button className="btn btn-pink" onClick={clearAll}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="row g-2 gg-plp3__grid">
                            {visibleProducts.map((p) => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    compact
                                    wrapperClassName="col-6 col-md-3 col-lg-2"
                                />
                            ))}
                        </div>

                        <div ref={sentinelRef} style={{ height: 1 }} />

                        {canLoadMore && (
                            <div className="text-center mt-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-pink"
                                    onClick={() => setVisibleCount((v) => Math.min(v + 24, filteredProducts.length))}
                                >
                                    Load more
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Sheet: Filter + Sort (NO dropdowns) */}
            <div
                className={`gg-plp3__overlay ${sheetOpen ? 'open' : ''}`}
                onClick={() => setSheetOpen(false)}
            />

            <div className={`gg-plp3__sheet ${sheetOpen ? 'open' : ''}`} role="dialog" aria-label="Filter and sort">
                <div className="gg-plp3__sheethead">
                    <div className="gg-plp3__sheettitle">Filter & Sort</div>
                    <button
                        type="button"
                        className="gg-plp3__sheetclose"
                        onClick={() => setSheetOpen(false)}
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="gg-plp3__sheetbody">
                    <div className="gg-plp3__block">
                        <div className="gg-plp3__blocktitle">Sort</div>
                        <div className="gg-plp3__pillrow">
                            {SORTS.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    className={`gg-plp3__pill ${sortBy === s.value ? 'active' : ''}`}
                                    onClick={() => setSortBy(s.value)}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="gg-plp3__block">
                        <div className="gg-plp3__blocktitle">Price</div>
                        <div className="gg-plp3__pillrow">
                            {PRICES.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    className={`gg-plp3__pill ${priceRange === p.value ? 'active' : ''}`}
                                    onClick={() => setPriceRange(p.value)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="gg-plp3__block">
                        <div className="gg-plp3__blocktitle">Category</div>
                        <div className="gg-plp3__catgrid">
                            <button
                                type="button"
                                className={`gg-plp3__catpill ${selectedCategory === '' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('')}
                            >
                                All
                            </button>

                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`gg-plp3__catpill ${
                                        String(selectedCategory) === String(c.id) ? 'active' : ''
                                    }`}
                                    onClick={() => setSelectedCategory(c.id)}
                                    title={c.name}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="gg-plp3__sheetfoot">
                    <button type="button" className="btn btn-outline-pink w-100" onClick={clearAll}>
                        Clear
                    </button>
                    <button type="button" className="btn btn-pink w-100" onClick={() => setSheetOpen(false)}>
                        Show results
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Products;