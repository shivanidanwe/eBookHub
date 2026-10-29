import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Tag, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';

export const UserCart: React.FC = () => {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, discount, appliedCoupon, total, removeFromCart, clearCart, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponCode.trim());
    setIsApplying(false);
    setCouponCode('');
  };

  if (itemCount === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-xl mx-auto my-8">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          Explore educational eBooks across Computer Science, Data Science, UPSC, and Placements.
        </p>
        <Link
          to="/books"
          className="inline-block px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          Discover eBooks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Review items before proceeding to secure sandbox checkout.</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 p-1">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt={item.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-brand-700" />
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{item.title}</h3>
                  <p className="text-xs text-slate-500">By {item.authorName}</p>
                  <p className="text-xs font-bold text-brand-600">
                    {formatINR(item.effectivePrice)}
                    {item.discountPrice && item.discountPrice < item.price && (
                      <span className="text-[11px] text-slate-400 line-through ml-2 font-normal">
                        {formatINR(item.price)}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.bookId)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Educational Trust note */}
          <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200/50 text-xs text-brand-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
            <span>Digital eBooks are delivered immediately to your library upon verified payment.</span>
          </div>
        </div>

        {/* Order Summary Sidebar (Matching Screen 5 of Mockup) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h2>

          {/* Coupon Input Form */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Promo / Coupon Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. WELCOME50, LEARN20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono focus:bg-white focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={isApplying || !couponCode.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition shrink-0"
              >
                Apply
              </button>
            </div>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span className="font-bold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {appliedCoupon} Applied!
                </span>
                <button type="button" onClick={removeCoupon} className="text-emerald-800 underline font-semibold">
                  Remove
                </button>
              </div>
            )}
          </form>

          {/* Breakdown */}
          <div className="space-y-3 text-xs pt-3 border-t border-slate-100">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({itemCount} items)</span>
              <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount</span>
                <span>-{formatINR(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (GST)</span>
              <span className="font-semibold text-slate-900">₹0 (Included)</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-sm font-extrabold text-slate-900">
              <span>Total Payable</span>
              <span className="text-xl text-brand-600">{formatINR(total)}</span>
            </div>
          </div>

          {/* Proceed to Checkout Button */}
          <button
            onClick={() => navigate('/user/checkout')}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
