import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, Search, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export const UserLibrary: React.FC = () => {
  const { toast, success, error } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'RECENT' | 'FAVORITES'>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLibrary() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/library');
        if (res.success && Array.isArray(res.data)) {
          setItems(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLibrary();
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
        success(`"${title}" PDF downloaded successfully.`);
      })
      .catch((err) => {
        error('Could not download file. Ensure you have active entitlement.');
      });
  };

  const filteredItems = items.filter((item) => {
    if (!item.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTab === 'RECENT') {
      const isRecent = new Date().getTime() - new Date(item.purchasedAt).getTime() < 30 * 86400000;
      return isRecent;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Digital Library</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            You own {items.length} licensed educational eBooks. Read online or download authorized PDFs.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search my library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Segmented Filter Tabs (Matching Screen 8) */}
      <div className="flex gap-2">
        {(['ALL', 'RECENT', 'FAVORITES'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL' ? 'All eBooks' : tab === 'RECENT' ? 'Recently Added' : 'Favorites'}
          </button>
        ))}
      </div>

      {/* Library Books List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No books found in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our catalog to discover and purchase curriculum-aligned textbooks.
          </p>
          <Link to="/books" className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((book) => (
            <div
              key={book.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 hover:shadow-md transition"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-16 h-22 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 p-1">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-contain rounded" />
                  ) : (
                    <div className="w-full h-full bg-brand-700" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200">
                      {book.categoryName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Purchased on {formatDate(book.purchasedAt)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 truncate">{book.title}</h3>
                  <p className="text-xs text-slate-500">By {book.authorName}</p>

                  {/* Reading Progress */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: `${book.progressPercent}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Page {book.currentPage} of {book.totalPages} ({book.progressPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Read Online & Download PDF */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                <Link
                  to={`/user/reader/${book.bookId}`}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Online</span>
                </Link>

                <button
                  onClick={() => handleDownload(book.bookId, book.title)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
