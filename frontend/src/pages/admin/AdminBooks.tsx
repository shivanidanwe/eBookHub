import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Filter, Eye, CheckCircle, XCircle, 
  AlertCircle, ExternalLink, RefreshCw, X, ShieldAlert, Check, Ban
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import { formatINR, formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

interface BookItem {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  authorId: string;
  categoryId: string;
  price: number;
  discountPrice?: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  coverImage?: string;
  coverImageUrl?: string;
  description?: string;
  language?: string;
  salesCount?: number;
  averageRating: number;
  createdAt: string;
  rejectionReason?: string;
  author: {
    id: string;
    fullName: string;
  };
  category: {
    id: string;
    name: string;
  };
}

export default function AdminBooks() {
  const { success, error } = useToast();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [reviewModalBook, setReviewModalBook] = useState<BookItem | null>(null);
  const [unpublishModalBook, setUnpublishModalBook] = useState<BookItem | null>(null);
  const [unpublishReason, setUnpublishReason] = useState('Catalog quality audit / moderation');
  const [rejectModalBook, setRejectModalBook] = useState<BookItem | null>(null);
  const [rejectReason, setRejectReason] = useState('Content does not meet syllabus guidelines');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/books');
      if (res.success && res.data) {
        setBooks(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load books catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleApprove = async (bookId: string) => {
    try {
      setIsProcessing(true);
      const res = await api.post(`/admin/books/${bookId}/review`, { action: 'APPROVE' });
      if (res.success) {
        success('Book approved and published to public marketplace!');
        setReviewModalBook(null);
        fetchBooks();
      }
    } catch (err: any) {
      error(err.message || 'Approval failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalBook) return;

    try {
      setIsProcessing(true);
      const res = await api.post(`/admin/books/${rejectModalBook.id}/review`, {
        action: 'REJECT',
        reason: rejectReason,
      });
      if (res.success) {
        success('Book submission rejected.');
        setRejectModalBook(null);
        setReviewModalBook(null);
        fetchBooks();
      }
    } catch (err: any) {
      error(err.message || 'Rejection failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnpublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unpublishModalBook) return;

    try {
      setIsProcessing(true);
      const res = await api.post(`/admin/books/${unpublishModalBook.id}/unpublish`, {
        reason: unpublishReason,
      });
      if (res.success) {
        success('Book unpublished and removed from public catalog.');
        setUnpublishModalBook(null);
        setReviewModalBook(null);
        fetchBooks();
      }
    } catch (err: any) {
      error(err.message || 'Unpublish failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = books.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      b.title.toLowerCase().includes(q) ||
      b.author?.fullName.toLowerCase().includes(q) ||
      b.category?.name.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-purple-600" />
            <span>Platform Books Catalog & Moderation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Global catalog of all educational textbooks, prices, moderation states, and store publishing status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/book-approvals"
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition shadow-xs flex items-center gap-1.5"
          >
            Review Queue
          </Link>
          <button
            onClick={fetchBooks}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by book title, author name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 bg-white text-slate-700 font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Published (Approved)</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
            <option value="ARCHIVED">Archived / Unpublished</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No books found matching this filter.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Book</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((book) => {
                  const cover = book.coverImage || book.coverImageUrl;
                  const isApproved = book.status === 'APPROVED';

                  return (
                    <tr key={book.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200 p-0.5">
                            {cover ? (
                              <img src={cover} alt={book.title} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full bg-purple-100 text-purple-700 flex items-center justify-center text-[9px] font-bold">
                                PDF
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-900 truncate">{book.title}</p>
                            <p className="text-[11px] text-slate-400">Created {formatDate(book.createdAt)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {book.author?.fullName || 'Unknown'}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {book.category?.name || 'General'}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatINR(book.discountPrice || book.price)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-amber-600 font-semibold text-xs">
                          ★ {book.averageRating ? book.averageRating.toFixed(1) : '5.0'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                            book.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : book.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800'
                              : book.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {book.status === 'PENDING_APPROVAL' ? 'Pending Review' : book.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Review Book */}
                          <button
                            onClick={() => setReviewModalBook(book)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>Review Book</span>
                          </button>

                          {/* Unpublish Book if Approved */}
                          {isApproved && (
                            <button
                              onClick={() => setUnpublishModalBook(book)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                              title="Unpublish from store"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Unpublish</span>
                            </button>
                          )}

                          {/* Store link if approved */}
                          {isApproved && (
                            <a
                              href={`/books/${book.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-slate-600"
                              title="View in public store"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Book Moderation Modal */}
      {reviewModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-extrabold text-slate-900 text-base">Book Moderation Screen</h3>
              <button
                onClick={() => setReviewModalBook(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-20 h-28 bg-slate-100 rounded-xl overflow-hidden shrink-0 border p-0.5">
                {reviewModalBook.coverImage || reviewModalBook.coverImageUrl ? (
                  <img
                    src={reviewModalBook.coverImage || reviewModalBook.coverImageUrl}
                    alt={reviewModalBook.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700" />
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                  {reviewModalBook.category?.name}
                </span>
                <h4 className="font-black text-slate-900 text-base">{reviewModalBook.title}</h4>
                <p className="text-xs text-slate-500">By {reviewModalBook.author?.fullName}</p>
                <p className="text-xs font-bold text-slate-900 mt-1">
                  Price: {formatINR(reviewModalBook.discountPrice || reviewModalBook.price)}
                </p>
                <p className="text-[11px] text-slate-400">Current Status: <strong>{reviewModalBook.status}</strong></p>
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t">
              <span className="text-xs font-bold text-slate-700">Manuscript Description:</span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl max-h-36 overflow-y-auto">
                {reviewModalBook.description || 'No description provided.'}
              </p>
            </div>

            {reviewModalBook.rejectionReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                <p className="font-bold">Prior Rejection Note:</p>
                <p className="text-[11px] mt-0.5">{reviewModalBook.rejectionReason}</p>
              </div>
            )}

            {/* Moderation Actions */}
            <div className="pt-4 border-t flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewModalBook(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Close
              </button>

              {reviewModalBook.status !== 'APPROVED' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectModalBook(reviewModalBook);
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition"
                  >
                    Reject Book
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleApprove(reviewModalBook.id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
                  >
                    {isProcessing ? 'Approving...' : 'Approve Book for Publication'}
                  </button>
                </>
              )}

              {reviewModalBook.status === 'APPROVED' && (
                <button
                  type="button"
                  onClick={() => setUnpublishModalBook(reviewModalBook)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
                >
                  Unpublish from Catalog
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unpublish Book Confirmation Modal */}
      {unpublishModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Unpublish eBook</h3>
                <p className="text-xs text-slate-500">Removing "{unpublishModalBook.title}" from store</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This book will be removed from the public marketplace and set to Archived. Existing purchasers retain reader access.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Reason for removal</label>
              <input
                type="text"
                value={unpublishReason}
                onChange={(e) => setUnpublishReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUnpublishModalBook(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleUnpublish}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
              >
                {isProcessing ? 'Unpublishing...' : 'Confirm Unpublish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Book Modal */}
      {rejectModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Reject Book Submission</h3>
              <p className="text-xs text-slate-500">Provide rejection explanation to the author</p>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Rejection Explanation *</label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalBook(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
                >
                  {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
