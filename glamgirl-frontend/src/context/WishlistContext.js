import React, { createContext, useState, useContext, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('glamgirl_wishlist');
        if (saved) {
            setWishlist(JSON.parse(saved));
        }
    }, []);

    // Save to localStorage whenever wishlist changes
    useEffect(() => {
        localStorage.setItem('glamgirl_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    // Add to wishlist
    const addToWishlist = (product) => {
        const exists = wishlist.find(item => item.id === product.id);
        if (!exists) {
            setWishlist([...wishlist, product]);
            return { success: true, message: 'Added to wishlist!' };
        }
        return { success: false, message: 'Already in wishlist!' };
    };

    // Remove from wishlist
    const removeFromWishlist = (productId) => {
        setWishlist(wishlist.filter(item => item.id !== productId));
    };

    // Check if product is in wishlist
    const isInWishlist = (productId) => {
        return wishlist.some(item => item.id === productId);
    };

    // Toggle wishlist
    const toggleWishlist = (product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
            return { success: true, message: 'Removed from wishlist!' };
        } else {
            return addToWishlist(product);
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};