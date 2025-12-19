import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

// Custom CSS
import './styles/base.css';
import './styles/responsive.css';

// Context
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import FlashSalePage from './pages/FlashSalePage';

function App() {
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
                            </Routes>
                        </main>

                        <Footer />

                        {/* ✅ Mobile bottom nav - শুধু mobile এ show করবো CSS দিয়ে */}
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