import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Edit, Eye, Search, AlertCircle, FileText, Star, X } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';

export const AuthorBooks: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'DRAFT' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [previewBook, setPreviewBook] = useState<any | null>(null);

  useEffect(() => {
    async function loadBooks() {
      try {
        setIsLoading(true);
        const query = activeTab !== 'ALL' ? `?status=${activeTab}` : '';
        const res = await api.get<any>(`/author/books${query}`);
        if (res.success && Array.isArray(res.data)) {
          setBooks(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBooks();
  }, [activeTab]);

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Published Books</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your educational publications, review moderation status, and check reader ratings.
          </p>
        </div>

        <Link
          to="/author/books/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {(['ALL', 'APPROVED', 'PENDING_APPROVAL', 'DRAFT', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === tab
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab === 'ALL'
                ? 'All Books'
                : tab === 'APPROVED'
                ? 'Approved / Live'
                : tab === 'PENDING_APPROVAL'
                ? 'Pending Moderation'
                : tab === 'DRAFT'
                ? 'Drafts'
                : 'Rejected'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search my titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Book Management Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No books found in this view.</p>
          <Link
            to="/author/books/new"
            className="inline-block px-4 py-2 bg-orange-600 text-white font-bold rounded-xl text-xs"
          >
            Add New Book
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Cover</th>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Publication Status</th>
                  <th className="py-3.5 px-4">Sales</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/50 transition">
                    {/* Cover */}
                    <td className="py-3.5 px-4">
                      <div className="w-11 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200 p-0.5">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white text-[9px] font-bold">
                            PDF
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Book Title */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-0 max-w-xs">
                        <Link to={`/author/books/${book.id}`} className="font-bold text-slate-900 hover:text-orange-600 truncate block">
                          {book.title}
                        </Link>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Created {formatDate(book.createdAt)}
                        </p>
                        {book.rejectionReason && (
                          <p className="text-[10px] text-rose-600 mt-0.5 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>Reason: {book.rejectionReason}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {book.category?.name || 'General'}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatINR(book.discountPrice || book.price)}
                    </td>

                    {/* Publication Status */}
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
                        {book.status === 'APPROVED'
                          ? 'Approved & Live'
                          : book.status === 'PENDING_APPROVAL'
                          ? 'Pending Review'
                          : book.status === 'REJECTED'
                          ? 'Rejected'
                          : 'Draft'}
                      </span>
                    </td>

                    {/* Sales */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {book.totalSales || 0} units
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview */}
                        <button
                          onClick={() => setPreviewBook(book)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-[11px] transition flex items-center gap-1"
                          title="Preview Book Summary"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>Preview</span>
                        </button>

                        {/* Edit Book */}
                        <Link
                          to={`/author/books/${book.id}/edit`}
                          className="px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-700 font-bold text-[11px] transition flex items-center gap-1"
                          title="Edit Book Details"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>

                        {/* View Reviews */}
                        <Link
                          to="/author/reviews"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-amber-600 transition"
                          title="View Reviews"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Quick Preview Modal */}
      {previewBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden border p-0.5 shrink-0">
                  {previewBook.coverImage ? (
                    <img src={previewBook.coverImage} alt={previewBook.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-slate-700" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{previewBook.title}</h3>
                  <p className="text-xs text-slate-500">{previewBook.category?.name} • {previewBook.language || 'English'}</p>
                  <p className="text-xs font-bold text-orange-600 mt-0.5">{formatINR(previewBook.discountPrice || previewBook.price)}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewBook(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 border-t pt-3">
              <p className="text-xs font-bold text-slate-700">Description:</p>
              <p className="text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto">
                {previewBook.description}
              </p>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <Link
                to={`/author/books/${previewBook.id}`}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
              >
                Full Analytics
              </Link>
              <Link
                to={`/author/books/${previewBook.id}/edit`}
                className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700"
              >
                Edit Book
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
