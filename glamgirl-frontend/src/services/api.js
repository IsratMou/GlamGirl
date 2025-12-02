import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Products API
export const getCategories = () => api.get('/products/categories/');
export const getProducts = () => api.get('/products/');
export const getProduct = (id) => api.get(`/products/${id}/`);
export const getProductsByCategory = (categoryId) => api.get(`/products/category/${categoryId}/`);

// Cart API
export const getCart = () => api.get('/cart/');
export const addToCart = (productId, quantity = 1) => api.post('/cart/add/', { product_id: productId, quantity });
export const updateCartItem = (itemId, quantity) => api.put(`/cart/update/${itemId}/`, { quantity });
export const removeFromCart = (itemId) => api.delete(`/cart/remove/${itemId}/`);
export const clearCart = () => api.delete('/cart/clear/');

// Orders API
export const createOrder = (orderData) => api.post('/orders/create/', orderData);
export const getOrders = () => api.get('/orders/');
export const getOrder = (orderId) => api.get(`/orders/${orderId}/`);

export default api;
