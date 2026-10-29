import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Heart,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import { StatCard } from '../../components/common/StatCard';
import { BookCard } from '../../components/common/BookCard';

export const UserDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/user/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const user = data?.user || { fullName: 'Student' };
  const stats = data?.stats || { purchasedBooks: 0, wishlist: 0, orders: 0 };
  const recentlyPurchased = data?.recentlyPurchased || [];
  const continueReading = data?.continueReading || [];
  const recommended = data?.recommended || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner (Matching Screen 2 of User Interface) */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            Active Student Account
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user.fullName}!
          </h1>
          <p className="text-xs text-brand-100 max-w-md">
            Resume your learning right where you left off or explore new syllabus study guides.
          </p>
        </div>
        <Link
          to="/user/library"
          className="px-5 py-2.5 bg-white text-brand-700 hover:bg-slate-100 font-extrabold text-xs rounded-xl shadow transition shrink-0"
        >
          Open My Library
        </Link>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Purchased Books"
          value={stats.purchasedBooks}
          icon={BookOpen}
          accentColor="brand"
          subtitle="Instant PDF access"
        />
        <StatCard
          title="Wishlist Items"
          value={stats.wishlist}
          icon={Heart}
          accentColor="emerald"
          subtitle="Saved for later"
        />
        <StatCard
          title="Completed Orders"
          value={stats.orders}
          icon={ShoppingCart}
          accentColor="author"
          subtitle="All transactions"
        />
      </div>

      {/* Continue Reading Section */}
      {continueReading.length > 0 && (
        <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-bold text-slate-900">Continue Reading</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {continueReading.map((prog: any) => (
              <div
                key={prog.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {prog.book?.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">By {prog.book?.author?.fullName}</p>
                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-600 h-1.5 rounded-full"
                        style={{ width: `${prog.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Page {prog.currentPage} of {prog.totalPages} ({prog.progressPercent}%)
                    </span>
                  </div>
                </div>

                <Link
                  to={`/user/reader/${prog.bookId}`}
                  className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
                >
                  Resume
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Purchased (Matching Screen 2 of User Interface) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recently Purchased</h2>
          <Link to="/user/library" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
            <span>View All Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentlyPurchased.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentlyPurchased.map((book: any) => (
              <div
                key={book.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition"
              >
                <div className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-brand-700" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs truncate">{book.title}</h3>
                  <p className="text-[11px] text-slate-500 truncate">By {book.author?.fullName}</p>
                  <Link
                    to={`/user/reader/${book.id}`}
                    className="inline-block px-3 py-1 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white rounded-lg font-bold text-[11px] transition"
                  >
                    Read Online
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-xs text-slate-500">
            You have not purchased any educational eBooks yet.
          </div>
        )}
      </section>

      {/* Recommended for You */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900">Recommended for You</h2>
          </div>
          <Link to="/books" className="text-xs font-bold text-brand-600 hover:underline">
            Explore More &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recommended.map((book: any) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
};
