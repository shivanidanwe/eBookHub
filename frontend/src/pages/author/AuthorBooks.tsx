import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Edit, Eye, Search, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';
import { Badge } from '../../components/common/Badge';

export const AuthorBooks: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Published Books</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor status, edit descriptions, check reviews, and submit new titles for approval.
          </p>
        </div>

        <Link
          to="/author/books/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-author-600 hover:bg-author-700 text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </Link>
      </div>

      {/* Tabs (Matching Screen 4: All, Pending, Approved, Rejected) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === tab
                  ? 'bg-author-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab === 'ALL'
                ? 'All Books'
                : tab === 'PENDING_APPROVAL'
                ? 'Pending Moderation'
                : tab === 'APPROVED'
                ? 'Approved / Live'
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
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-author-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Books Table (Matching Screen 4 of Author Interface) */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No books found matching this filter criteria.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Book</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Sales</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200 p-0.5">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full bg-slate-700" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-slate-900 truncate text-xs">{book.title}</p>
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
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-600">
                      {book.category?.name || 'General'}
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-900">
                      {formatINR(book.discountPrice || book.price)}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {book.totalSales || 0} units
                    </td>

                    <td className="py-4 px-4">
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
                          ? 'Approved'
                          : book.status === 'PENDING_APPROVAL'
                          ? 'Pending'
                          : book.status === 'REJECTED'
                          ? 'Rejected'
                          : 'Draft'}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/author/books/${book.id}`}
                          className="p-1.5 rounded-lg border hover:bg-slate-100 text-slate-600 transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/author/books/${book.id}/edit`}
                          className="p-1.5 rounded-lg border hover:bg-author-50 hover:border-author-300 text-author-700 transition"
                          title="Edit Book"
                        >
                          <Edit className="w-3.5 h-3.5" />
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
    </div>
  );
};
