import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube, FaGem, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-5 mt-5">
            <div className="container">
                <div className="row">
                    {/* About */}
                    <div className="col-md-4 mb-4">
                        <h5 className="mb-3">
                            <FaGem className="me-2" style={{ color: '#e91e63' }} />
                            GlamGirl
                        </h5>
                        <p className="text-muted">
                            Your one-stop shop for all beauty and cosmetic products. 
                            100% authentic products with best prices.
                        </p>
                        <div className="social-links">
                            <a href="#" className="text-white me-3"><FaFacebook size={20} /></a>
                            <a href="#" className="text-white me-3"><FaInstagram size={20} /></a>
                            <a href="#" className="text-white"><FaYoutube size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-md-2 mb-4">
                        <h6 className="mb-3">Quick Links</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
                            <li className="mb-2"><Link to="/products" className="text-muted text-decoration-none">Products</Link></li>
                            <li className="mb-2"><Link to="/cart" className="text-muted text-decoration-none">Cart</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="col-md-3 mb-4">
                        <h6 className="mb-3">Customer Service</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Shipping Info</a></li>
                            <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Returns</a></li>
                            <li className="mb-2"><a href="#" className="text-muted text-decoration-none">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-md-3 mb-4">
                        <h6 className="mb-3">Contact Us</h6>
                        <ul className="list-unstyled text-muted">
                            <li className="mb-2"><FaMapMarkerAlt className="me-2" />Dhaka, Bangladesh</li>
                            <li className="mb-2"><FaPhone className="me-2" />+880 1712-345678</li>
                            <li className="mb-2"><FaEnvelope className="me-2" />info@glamgirl.com</li>
                        </ul>
                    </div>
                </div>

                <hr className="my-4" style={{ borderColor: '#333' }} />

                <div className="text-center text-muted">
                    <p className="mb-0">&copy; 2025 GlamGirl. All rights reserved. Made with ❤️</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;