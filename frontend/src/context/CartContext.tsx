import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface CartItem {
  id: string;
  bookId: string;
  title: string;
  coverImage: string;
  authorName: string;
  price: number;
  discountPrice: number | null;
  effectivePrice: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  appliedCoupon: string | null;
  total: number;
  isLoading: boolean;
  addToCart: (bookId: string) => Promise<boolean>;
  removeFromCart: (bookId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      setSubtotal(0);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.get<any>('/cart');
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setSubtotal(res.data.subtotal || 0);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (bookId: string): Promise<boolean> => {
    if (!user) {
      toast('Please login to add books to your cart.', 'info');
      return false;
    }

    try {
      const res = await api.post('/cart/add', { bookId });
      if (res.success) {
        toast('Book added to cart!', 'success');
        await refreshCart();
        return true;
      }
      return false;
    } catch (err: any) {
      toast(err.message || 'Could not add to cart', 'error');
      return false;
    }
  };

  const removeFromCart = async (bookId: string) => {
    try {
      await api.delete(`/cart/item/${bookId}`);
      toast('Item removed from cart', 'info');
      await refreshCart();
    } catch (err: any) {
      toast(err.message || 'Could not remove item', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setItems([]);
      setSubtotal(0);
      setDiscount(0);
      setAppliedCoupon(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await api.post<any>('/cart/apply-coupon', { code, subtotal });
      if (res.success && res.data) {
        setDiscount(res.data.discount);
        setAppliedCoupon(res.data.code);
        toast(`Coupon "${res.data.code}" applied successfully!`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      toast(err.message || 'Invalid coupon code', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    toast('Coupon removed', 'info');
  };

  const total = Math.max(0, subtotal - discount);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.length,
        subtotal,
        discount,
        appliedCoupon,
        total,
        isLoading,
        addToCart,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
