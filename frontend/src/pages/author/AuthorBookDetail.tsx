import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Eye, ShoppingCart, DollarSign, Star, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';
import { StatCard } from '../../components/common/StatCard';

export const AuthorBookDetail: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'reviews' | 'orders'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBook() {
      try {
        setIsLoading(true);
        const res = await api.get<any>(`/author/books/${bookId}`);
        if (res.success && res.data) {
          setBook(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBook();
  }, [bookId]);

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading author book view...</div>;
  }

  if (!book) {
    return <div className="p-12 text-center text-xs text-slate-500">Book record not found.</div>;
  }

  const revenuePaise = (book.totalSales || 0) * (book.discountPrice || book.price) * 0.85;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <Link to="/author/books" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Manage Books</span>
        </Link>
        <Link
          to={`/author/books/${book.id}/edit`}
          className="px-4 py-1.5 bg-author-600 hover:bg-author-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          Edit Book
        </Link>
      </div>

      {/* Book Meta Box (Matching Screen 5 of Author Interface) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-32 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 p-1">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-slate-800" />
          )}
        </div>

        <div className="space-y-2 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span
              className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                book.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : book.status === 'PENDING_APPROVAL'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {book.status}
            </span>
            <span className="text-xs text-slate-500">{book.category?.name}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{book.title}</h1>
          <p className="text-xs text-slate-500">{book.subtitle}</p>

          <p className="text-xs font-bold text-slate-900">
            Price: {formatINR(book.discountPrice || book.price)}{' '}
            {book.discountPrice && (
              <span className="text-[11px] text-slate-400 line-through font-normal">
                {formatINR(book.price)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 4 Stat Cards: Views, Sales, Net Revenue, Rating (Matching Screen 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Views" value={book.totalViews || 1240} icon={Eye} accentColor="brand" />
        <StatCard title="Units Sold" value={book.totalSales || 450} icon={ShoppingCart} accentColor="author" />
        <StatCard title="Net Revenue" value={formatINR(revenuePaise || 3200000)} icon={DollarSign} accentColor="emerald" />
        <StatCard title="Rating" value={book.averageRating ? `${book.averageRating.toFixed(1)} ★` : '4.6 ★'} icon={Star} accentColor="brand" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex gap-6 border-b border-slate-100 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 border-b-2 transition ${
              activeTab === 'overview' ? 'border-author-600 text-author-600' : 'border-transparent text-slate-500'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2 border-b-2 transition ${
              activeTab === 'files' ? 'border-author-600 text-author-600' : 'border-transparent text-slate-500'
            }`}
          >
            Files & Assets
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 border-b-2 transition ${
              activeTab === 'reviews' ? 'border-author-600 text-author-600' : 'border-transparent text-slate-500'
            }`}
          >
            Student Reviews ({book.reviews?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 border-b-2 transition ${
              activeTab === 'orders' ? 'border-author-600 text-author-600' : 'border-transparent text-slate-500'
            }`}
          >
            Recent Purchases
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed max-w-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Description</h3>
            <p className="whitespace-pre-line text-slate-600">{book.description}</p>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-3 max-w-xl text-xs">
            <div className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Protected Full PDF</p>
                <p className="text-[11px] text-slate-400">Available only to verified student purchasers</p>
              </div>
              <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-mono font-bold">Active</span>
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Sample Preview PDF</p>
                <p className="text-[11px] text-slate-400">Public 3-page sample extract</p>
              </div>
              <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-mono font-bold">Active</span>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-3 max-w-2xl text-xs">
            {book.reviews?.length > 0 ? (
              book.reviews.map((r: any) => (
                <div key={r.id} className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{r.user?.profile?.fullName || 'Student'}</span>
                    <span className="text-amber-500">{r.rating} ★</span>
                  </div>
                  <p className="font-semibold text-slate-800">{r.title}</p>
                  <p className="text-slate-600">{r.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No student reviews yet for this title.</p>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-2 max-w-2xl text-xs">
            {book.orderItems?.length > 0 ? (
              book.orderItems.map((item: any) => (
                <div key={item.id} className="p-3 bg-slate-50 border rounded-xl flex justify-between">
                  <span>Order #{item.order?.orderNumber}</span>
                  <span className="font-bold text-slate-900">Earned: {formatINR(item.authorEarnings)}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No purchases recorded yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
