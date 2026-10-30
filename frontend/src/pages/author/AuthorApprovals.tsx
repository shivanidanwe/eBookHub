import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, Plus, Eye, Edit, BookOpen } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const AuthorApprovals: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING_APPROVAL' | 'REJECTED' | 'APPROVED'>('PENDING_APPROVAL');
  const [isLoading, setIsLoading] = useState(true);

  async function loadBooks() {
    try {
      setIsLoading(true);
      const res = await api.get<any>(`/author/books?status=${activeTab}`);
      if (res.success && Array.isArray(res.data)) {
        setBooks(res.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Book Moderation Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track the verification, content review, and publishing status of your manuscripts.
          </p>
        </div>

        <Link
          to="/author/books/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Book</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['PENDING_APPROVAL', 'REJECTED', 'APPROVED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab === 'PENDING_APPROVAL'
              ? 'Pending Review'
              : tab === 'REJECTED'
              ? 'Action Required (Rejected)'
              : 'Approved & Live'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            {activeTab === 'PENDING_APPROVAL'
              ? 'No books currently awaiting moderation.'
              : activeTab === 'REJECTED'
              ? 'No rejected book submissions.'
              : 'No approved books in this tab.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload new textbooks and study guides to submit them for administrator approval.
          </p>
          <div className="pt-2">
            <Link
              to="/author/books/new"
              className="inline-block px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Add New Book
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:shadow-sm transition"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-22 bg-slate-100 rounded-xl overflow-hidden shrink-0 border p-0.5">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-slate-800" />
                  )}
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                        book.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : book.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {book.status === 'PENDING_APPROVAL' ? 'Pending Administrator Review' : book.status}
                    </span>
                    <span className="text-xs text-slate-500">{book.category?.name}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 truncate">{book.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{book.description}</p>

                  {/* Status Banner */}
                  {book.status === 'PENDING_APPROVAL' && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-0.5">
                      <p className="font-bold flex items-center gap-1.5 text-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Your book is awaiting administrator review.</span>
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Submitted on: <strong>{formatDate(book.createdAt)}</strong>
                      </p>
                    </div>
                  )}

                  {book.status === 'REJECTED' && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-0.5">
                      <p className="font-bold flex items-center gap-1.5 text-rose-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Submission rejected by administrator:</span>
                      </p>
                      <p className="text-[11px] text-rose-700">
                        {book.rejectionReason || 'Please verify copyright ownership and curriculum quality.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                <Link
                  to={`/author/books/${book.id}`}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Details</span>
                </Link>

                <Link
                  to={`/author/books/${book.id}/edit`}
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Book</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
