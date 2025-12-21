// src/pages/CategoriesPage.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results; // DRF pagination support
    return [];
};

const getCategoryIdFromProduct = (p) => {
    // supports: category: id, category_id: id, category: {id:..}
    if (!p) return null;
    if (typeof p.category === 'number') return p.category;
    if (typeof p.category_id === 'number') return p.category_id;
    if (p.category && typeof p.category.id === 'number') return p.category.id;
    return null;
};

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeCatId, setActiveCatId] = useState(null);
    const sectionRefs = useRef(new Map());

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const [catRes, prodRes] = await Promise.allSettled([
                    getCategories(),
                    getProducts(),
                ]);

                if (!mounted) return;

                if (catRes.status === 'fulfilled') {
                    setCategories(normalizeList(catRes.value?.data));
                } else {
                    console.error('Categories fetch failed:', catRes.reason);
                    setCategories([]);
                }

                if (prodRes.status === 'fulfilled') {
                    setProducts(normalizeList(prodRes.value?.data));
                } else {
                    console.error('Products fetch failed:', prodRes.reason);
                    setProducts([]);
                }
            } catch (e) {
                console.error('Categories page load error:', e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    const productsByCategory = useMemo(() => {
        const map = new Map();
        for (const p of products) {
            const cid = getCategoryIdFromProduct(p);
            if (!cid) continue;
            if (!map.has(cid)) map.set(cid, []);
            map.get(cid).push(p);
        }
        return map;
    }, [products]);

    const categoriesWithProducts = useMemo(() => {
        const list = categories.map((c) => ({
            ...c,
            items: productsByCategory.get(c.id) || [],
        }));

        // default active: first category
        if (!activeCatId && list.length > 0) {
            // set later to avoid setState during render
            queueMicrotask(() => setActiveCatId(list[0].id));
        }

        return list;
    }, [categories, productsByCategory, activeCatId]);

    // IntersectionObserver: scroll করলে active chip highlight হবে
    useEffect(() => {
        if (!categoriesWithProducts.length) return;

        const sections = categoriesWithProducts
            .map((c) => sectionRefs.current.get(c.id))
            .filter(Boolean);

        if (!sections.length) return;

        const obs = new IntersectionObserver(
            (entries) => {
                // pick the top-most visible section
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top));

                if (visible.length > 0) {
                    const id = Number(visible[0].target.getAttribute('data-cid'));
                    if (!Number.isNaN(id)) setActiveCatId(id);
                }
            },
            {
                root: null,
                threshold: 0.2,
            }
        );

        sections.forEach((el) => obs.observe(el));
        return () => obs.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoriesWithProducts.length]);

    const scrollToCategory = (id) => {
        const el = sectionRefs.current.get(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveCatId(id);
    };

    return (
        <div className="gg-catpage gg-section gg-section--tight">
            <div className="container">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb small mb-0">
                        <li className="breadcrumb-item">
                            <Link to="/">Home</Link>
                        </li>
                        <li className="breadcrumb-item active">Categories</li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="gg-catpage__header">
                    <div className="gg-catpage__titlewrap">
                        <h1 className="gg-catpage__title">Categories</h1>
                        <span className="gg-catpage__badge">Shop by type</span>
                    </div>
                    <p className="gg-catpage__subtitle">
                        Browse all products grouped by category
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border text-pink" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : categoriesWithProducts.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-muted mb-0">No categories found.</p>
                    </div>
                ) : (
                    <>
                        {/* Sticky chips */}
                        <div className="gg-catpage__chips-wrap" aria-label="Category quick navigation">
                            <div className="gg-catpage__chips">
                                {categoriesWithProducts.map((c) => {
                                    const isActive = c.id === activeCatId;
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            className={`gg-catpage__chip ${isActive ? 'active' : ''}`}
                                            onClick={() => scrollToCategory(c.id)}
                                        >
                                            {c.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sections */}
                        <div className="gg-catpage__sections">
                            {categoriesWithProducts.map((c) => (
                                <section
                                    key={c.id}
                                    data-cid={c.id}
                                    ref={(el) => {
                                        if (el) sectionRefs.current.set(c.id, el);
                                    }}
                                    className="gg-catpage__section"
                                    style={{ scrollMarginTop: 'calc(var(--navbar-height) + 90px)' }}
                                    aria-label={`${c.name} category`}
                                >
                                    <div className="gg-catpage__section-head">
                                        <div className="gg-catpage__section-left">
                                            <h2 className="gg-catpage__section-title">{c.name}</h2>
                                            <span className="gg-catpage__count">
                                                {c.items.length} items
                                            </span>
                                        </div>

                                        <Link
                                            to={`/products?category=${c.id}`}
                                            className="gg-catpage__seeall"
                                        >
                                            See all
                                        </Link>
                                    </div>

                                    {c.items.length === 0 ? (
                                        <div className="gg-catpage__empty">
                                            <p className="text-muted mb-0">
                                                No products in this category yet.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="row g-2 gg-catpage__grid">
                                            {c.items.map((p) => (
                                                <ProductCard
                                                    key={p.id}
                                                    product={p}
                                                    compact
                                                    wrapperClassName="col-6 col-md-3 col-lg-2"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;