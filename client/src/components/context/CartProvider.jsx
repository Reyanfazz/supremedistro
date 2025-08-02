// src/context/CartProvider.jsx
import React, { useState, useEffect } from 'react';
import CartContext from './CartContext';

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
      return [];
    }
  });

  const [selectedItems, setSelectedItems] = useState(() => {
    try {
      const stored = localStorage.getItem('selectedItems');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Failed to load selectedItems from localStorage:', err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    } catch (err) {
      console.error('Failed to save selectedItems to localStorage:', err);
    }
  }, [selectedItems]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item._id === product._id);
      if (exists) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedItems([]);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      selectedItems,
      setSelectedItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
