import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Compass,
  Download,
  Package,
  User,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';
import { StatCard } from '../../components/common/StatCard';
import { BookCard } from '../../components/common/BookCard';
import { useToast } from '../../context/ToastContext';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
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

  const handleDownload = (bookId: string, title: string) => {
    const token = localStorage.getItem('ebookhub_token');
    fetch(`/api/library/${bookId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-eBookHub.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        success(`"${title}" PDF downloaded.`);
      })
      .catch(() => {
        error('Could not download file. Ensure you own this eBook.');
      });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
      {/* Welcome Banner - Student Blue Theme */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            Active Student Account
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user.fullName}!
          </h1>
          <p className="text-xs text-blue-100 max-w-md">
            Resume your learning right where you left off or browse through curated educational syllabus guides.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/books"
            className="px-4 py-2.5 bg-blue-500/40 hover:bg-blue-500/60 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Books</span>
          </Link>
          <Link
            to="/user/profile"
            className="px-4 py-2.5 bg-white text-blue-700 hover:bg-slate-100 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <User className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>
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
          title="Recent Orders"
          value={stats.orders}
          icon={Package}
          accentColor="author"
          subtitle="Lifetime purchases"
        />
      </div>

      {/* Continue Reading / Currently Reading */}
      {continueReading.length > 0 && (
        <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Currently Reading</h2>
            </div>
            <Link to="/user/library" className="text-xs font-bold text-blue-600 hover:underline">
              View All in Library &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {continueReading.map((prog: any) => (
              <div
                key={prog.id}
                className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 flex items-center justify-between gap-4"
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
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${prog.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Page {prog.currentPage} of {prog.totalPages} ({prog.progressPercent}%)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <Link
                    to={`/user/reader/${prog.bookId}`}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Book</span>
                  </Link>
                  <button
                    onClick={() => handleDownload(prog.bookId, prog.book?.title || 'eBook')}
                    className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                    title="Download offline copy"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Purchased Books */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Purchased Books & Library</h2>
          </div>
          <Link to="/user/library" className="text-xs font-bold text-blue-600 hover:underline">
            Open Library &rarr;
          </Link>
        </div>

        {recentlyPurchased.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">You haven't purchased any educational books yet.</p>
            <Link
              to="/books"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyPurchased.map((b: any) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition flex gap-3.5"
              >
                <div className="w-16 h-22 bg-slate-100 rounded-lg overflow-hidden shrink-0 border p-0.5">
                  {b.coverImage ? (
                    <img src={b.coverImage} alt={b.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-blue-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {b.category?.name || 'Education'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs truncate mt-1">{b.title}</h3>
                    <p className="text-[11px] text-slate-400">By {b.author?.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      to={`/user/reader/${b.id}`}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition"
                    >
                      Read Book
                    </Link>
                    <button
                      onClick={() => handleDownload(b.id, b.title)}
                      className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Books Section */}
      {recommended.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Recommended for You</h2>
            </div>
            <Link to="/books" className="text-xs font-bold text-blue-600 hover:underline">
              Explore All Books &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {recommended.slice(0, 3).map((book: any) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
