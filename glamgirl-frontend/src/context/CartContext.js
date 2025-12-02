import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCart, addToCart as addToCartAPI, updateCartItem, removeFromCart as removeFromCartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], total: 0, total_items: 0 });
    const [loading, setLoading] = useState(false);

    // Fetch cart on load
    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await getCart();
            setCart(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // Add to cart
    const addToCart = async (productId, quantity = 1) => {
        try {
            const response = await addToCartAPI(productId, quantity);
            setCart(response.data);
            return { success: true };
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, error: error.response?.data?.error || 'Failed to add' };
        }
    };

    // Update quantity
    const updateQuantity = async (itemId, quantity) => {
        try {
            const response = await updateCartItem(itemId, quantity);
            setCart(response.data);
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };

    // Remove from cart
    const removeFromCart = async (itemId) => {
        try {
            const response = await removeFromCartAPI(itemId);
            setCart(response.data);
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addToCart,
            updateQuantity,
            removeFromCart,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};