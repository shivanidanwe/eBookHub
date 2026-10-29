import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { BookCard } from '../../components/common/BookCard';

export const UserWishlist: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/wishlist');
        if (res.success && Array.isArray(res.data)) {
          setItems(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWishlist();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Wishlist</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Books you've bookmarked to read or purchase for your upcoming exam cycles.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-500">Explore catalog to add books to your personal wishlist.</p>
          <Link to="/books" className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {items.map((item) => (
            <BookCard key={item.id} book={item.book} />
          ))}
        </div>
      )}
    </div>
  );
};
