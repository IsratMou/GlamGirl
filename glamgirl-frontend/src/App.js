import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import './styles/base.css';
import './styles/responsive.css';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import FlashSalePage from './pages/FlashSalePage';
import CategoriesPage from './pages/CategoriesPage';

function App() {
    // ✅ global synced time (no React re-render, only CSS var update)
    useEffect(() => {
        const D = 4; // seconds (2 images => 2s each)
        const tick = () => {
            const t = (Date.now() / 1000) % D;
            document.documentElement.style.setProperty('--gg-sync', t.toFixed(3));
        };
        tick();
        const id = setInterval(tick, 250);
        return () => clearInterval(id);
    }, []);

    return (
        <CartProvider>
            <WishlistProvider>
                <Router>
                    <div className="app">
                        <Navbar />

                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/products" element={<Products />} />
                                <Route path="/product/:id" element={<ProductDetail />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/wishlist" element={<Wishlist />} />
                                <Route path="/flash-sale" element={<FlashSalePage />} />
                                <Route path="/categories" element={<CategoriesPage />} />
                            </Routes>
                        </main>

                        <Footer />
                        <MobileBottomNav />

                        <ToastContainer
                            position="top-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop
                            closeOnClick
                            pauseOnHover
                        />
                    </div>
                </Router>
            </WishlistProvider>
        </CartProvider>
    );
}

export default App;