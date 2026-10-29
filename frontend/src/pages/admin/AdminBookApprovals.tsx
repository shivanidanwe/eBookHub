import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { 
  BookOpen, CheckCircle, XCircle, Clock, Eye, AlertCircle, 
  ExternalLink, FileText, Check, X, ShieldAlert, DollarSign 
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import { formatINR } from '../../lib/utils';

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
  coverImageUrl?: string;
  description?: string;
  isbn?: string;
  edition?: string;
  language: string;
  pageCount?: number;
  previewType?: string;
  samplePagesCount?: number;
  rejectionReason?: string;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
  };
  category: {
    id: string;
    name: string;
  };
}

export default function AdminBookApprovals() {
  const { addToast } = useToast();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING_APPROVAL' | 'ALL' | 'APPROVED' | 'REJECTED'>('PENDING_APPROVAL');
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/books');
      if (res.success && res.data) {
        setBooks(res.data);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to load books for moderation', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleReview = async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    try {
      setProcessingId(id);
      const res = await api.post(`/admin/books/${id}/review`, {
        action,
        reason: reason || undefined,
      });

      if (res.success) {
        addToast(
          action === 'APPROVE' 
            ? 'Book approved and published to the marketplace!' 
            : 'Book submission rejected.',
          'success'
        );
        setRejectModalOpen(false);
        setRejectReason('');
        setSelectedBook(null);
        fetchBooks();
      }
    } catch (err: any) {
      addToast(err.message || 'Action failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredBooks = books.filter((b) => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  const pendingCount = books.filter((b) => b.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-purple-600" /> Book Moderation & Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review submitted educational eBooks for content quality, pricing compliance, and completeness before publishing.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingCount} Pending Approval</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(['PENDING_APPROVAL', 'ALL', 'APPROVED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === tab
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'PENDING_APPROVAL' ? 'Pending Review' : tab === 'ALL' ? 'All Books' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className="ml-2 text-xs opacity-80">
              ({books.filter(b => tab === 'ALL' ? true : b.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading books for review...
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">No books found</h3>
          <p className="text-sm text-slate-500 mt-1">No eBook submissions currently match this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Book & Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {book.coverImageUrl ? (
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0 bg-slate-100"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-purple-100 text-purple-700 flex items-center justify-center rounded text-xs font-bold flex-shrink-0">
                            PDF
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{book.title}</div>
                          <div className="text-xs text-slate-500">By {book.author?.fullName || 'Unknown'}</div>
                          {book.subtitle && (
                            <div className="text-xs text-slate-400 truncate max-w-xs">{book.subtitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                        {book.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-800">
                      {formatINR(book.price)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                      {new Date(book.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          book.status === 'APPROVED' ? 'success' : book.status === 'PENDING_APPROVAL' ? 'warning' : 'danger'
                        }
                      >
                        {book.status === 'PENDING_APPROVAL' ? 'PENDING' : book.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => setSelectedBook(book)}
                        className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>

                      {book.status === 'PENDING_APPROVAL' && (
                        <>
                          <button
                            onClick={() => handleReview(book.id, 'APPROVE')}
                            disabled={processingId === book.id}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBook(book);
                              setRejectModalOpen(true);
                            }}
                            disabled={processingId === book.id}
                            className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Inspection Modal */}
      {selectedBook && !rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Book Moderation Details</h3>
                <p className="text-xs text-slate-500">ID: {selectedBook.id}</p>
              </div>
              <button 
                onClick={() => setSelectedBook(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              {selectedBook.coverImageUrl ? (
                <img
                  src={selectedBook.coverImageUrl}
                  alt={selectedBook.title}
                  className="w-32 h-44 object-cover rounded-xl shadow-md border mx-auto sm:mx-0 flex-shrink-0"
                />
              ) : (
                <div className="w-32 h-44 bg-purple-100 text-purple-700 flex flex-col items-center justify-center rounded-xl mx-auto sm:mx-0 flex-shrink-0">
                  <BookOpen className="w-10 h-10 mb-2" />
                  <span className="text-xs font-bold uppercase">No Cover</span>
                </div>
              )}

              <div className="flex-1 space-y-2 text-sm">
                <h2 className="text-xl font-bold text-slate-900">{selectedBook.title}</h2>
                {selectedBook.subtitle && (
                  <p className="text-slate-600 font-medium">{selectedBook.subtitle}</p>
                )}
                <div className="text-xs text-slate-500">
                  Author: <span className="font-semibold text-slate-700">{selectedBook.author?.fullName}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-semibold">
                    {selectedBook.category?.name}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                    Language: {selectedBook.language}
                  </span>
                  {selectedBook.pageCount && (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                      {selectedBook.pageCount} Pages
                    </span>
                  )}
                  {selectedBook.edition && (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                      Edition: {selectedBook.edition}
                    </span>
                  )}
                </div>

                <div className="pt-2 flex items-baseline gap-3">
                  <span className="text-xl font-bold text-slate-900">{formatINR(selectedBook.price)}</span>
                  {selectedBook.discountPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatINR(selectedBook.discountPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Description / Synopsis</span>
              <p className="text-slate-700 text-sm mt-1 whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedBook.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100 text-sm">
              <div className="flex items-center gap-2 text-purple-900 font-medium">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>Sample Preview ({selectedBook.samplePagesCount || 10} pages allowed)</span>
              </div>
              <a
                href={`/books/${selectedBook.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1"
              >
                Public Page <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {selectedBook.rejectionReason && (
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                <span className="text-xs text-rose-800 uppercase font-semibold">Moderation Feedback</span>
                <p className="text-sm text-rose-900 mt-0.5">{selectedBook.rejectionReason}</p>
              </div>
            )}

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedBook.status === 'PENDING_APPROVAL' && (
                <>
                  <button
                    onClick={() => {
                      setRejectModalOpen(true);
                    }}
                    className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-sm font-medium"
                  >
                    Reject Submission
                  </button>
                  <button
                    onClick={() => handleReview(selectedBook.id, 'APPROVE')}
                    disabled={processingId === selectedBook.id}
                    className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-medium disabled:opacity-50"
                  >
                    Approve & Publish
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Reject Book Submission</h3>
            </div>
            <p className="text-sm text-slate-600">
              Please specify the reason for rejecting <span className="font-semibold">{selectedBook.title}</span>. The author will be notified to revise and resubmit.
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Moderation Feedback / Corrections Required
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Please update cover resolution, add missing chapter 3 outline, or review book description."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(selectedBook.id, 'REJECT', rejectReason)}
                disabled={processingId === selectedBook.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
