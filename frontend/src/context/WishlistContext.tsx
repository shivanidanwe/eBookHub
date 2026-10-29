import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistCount: number;
  toggleWishlist: (bookId: string) => Promise<boolean>;
  isInWishlist: (bookId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const refreshWishlist = async () => {
    if (!user) {
      setWishlistIds([]);
      return;
    }
    try {
      const res = await api.get<any>('/wishlist');
      if (res.success && Array.isArray(res.data)) {
        setWishlistIds(res.data.map((item: any) => item.bookId));
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const toggleWishlist = async (bookId: string): Promise<boolean> => {
    if (!user) {
      toast('Please login to save books to your wishlist.', 'info');
      return false;
    }

    try {
      const res = await api.post<any>('/wishlist/toggle', { bookId });
      if (res.success) {
        const inList = res.data.inWishlist;
        if (inList) {
          setWishlistIds((prev) => [...prev, bookId]);
          toast('Added to wishlist', 'success');
        } else {
          setWishlistIds((prev) => prev.filter((id) => id !== bookId));
          toast('Removed from wishlist', 'info');
        }
        return inList;
      }
      return false;
    } catch (err: any) {
      toast(err.message || 'Error updating wishlist', 'error');
      return false;
    }
  };

  const isInWishlist = (bookId: string) => wishlistIds.includes(bookId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        toggleWishlist,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
