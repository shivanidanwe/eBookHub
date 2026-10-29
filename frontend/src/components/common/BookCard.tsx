import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export interface BookCardData {
  id: string;
  slug?: string;
  title: string;
  coverImage?: string | null;
  price: number;
  discountPrice?: number | null;
  averageRating?: number;
  totalRatings?: number;
  author?: {
    id?: string;
    fullName: string;
  };
  category?: {
    name: string;
    slug?: string;
  };
}

interface BookCardProps {
  book: BookCardData;
  className?: string;
}

export const BookCard: React.FC<BookCardProps> = ({ book, className = '' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const inWishlist = isInWishlist(book.id);
  const bookSlug = book.slug || book.id;
  const authorName = book.author?.fullName || 'eBookHub Verified Author';
  const categoryName = book.category?.name || 'Educational';

  const hasDiscount = book.discountPrice && book.discountPrice < book.price;
  const effectivePrice = hasDiscount ? book.discountPrice! : book.price;

  return (
    <div className={`group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative ${className}`}>
      {/* Cover Image & Quick Action */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 flex items-center justify-center p-3">
        <Link to={`/books/${bookSlug}`} className="w-full h-full flex items-center justify-center">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-contain rounded-lg drop-shadow-md group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-brand-600 to-slate-900 flex flex-col justify-between p-4 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/80 self-start px-2 py-0.5 rounded">
                {categoryName}
              </span>
              <p className="font-bold text-sm leading-snug line-clamp-3">{book.title}</p>
              <p className="text-[11px] text-slate-300 truncate">{authorName}</p>
            </div>
          )}
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(book.id);
          }}
          aria-label="Save to Wishlist"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow hover:bg-white transition text-slate-400 hover:text-rose-500 z-10"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-4 left-4 text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full shadow">
            {Math.round(((book.price - book.discountPrice!) / book.price) * 100)}% OFF
          </span>
        )}
      </div>

      {/* Book Information */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-brand-600 truncate">{categoryName}</span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{book.averageRating ? book.averageRating.toFixed(1) : '4.8'}</span>
              <span className="text-slate-400 font-normal">({book.totalRatings || 120})</span>
            </div>
          </div>

          <Link to={`/books/${bookSlug}`} className="block">
            <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug line-clamp-2 hover:text-brand-600 transition">
              {book.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
            <span>{authorName}</span>
            <CheckCircle2 className="w-3 h-3 text-brand-500 shrink-0" />
          </p>
        </div>

        {/* Price & Add to Cart button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-slate-900">{formatINR(effectivePrice)}</span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">{formatINR(book.price)}</span>
            )}
          </div>

          <button
            onClick={() => addToCart(book.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-600 hover:text-white rounded-lg font-semibold text-xs transition duration-200"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
