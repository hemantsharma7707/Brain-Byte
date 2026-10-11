import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (book) => {
    if (items.some((item) => item._id === book._id)) {
      toast.error('Already in cart');
      return;
    }
    setItems((prev) => [...prev, { ...book, quantity: 1 }]);
    toast.success('Added to cart');
  };

  const removeFromCart = (bookId) => {
    setItems((prev) => prev.filter((item) => item._id !== bookId));
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (bookId) => items.some((item) => item._id === bookId);

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  const totalItems = items.length;

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, isInCart, totalAmount, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
};
