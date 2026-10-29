import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { 
  BookOpen, Search, Filter, Eye, CheckCircle, XCircle, 
  AlertCircle, ExternalLink, RefreshCw 
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import { formatINR } from '../../lib/utils';
import { Link } from 'react-router-dom';

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
  salesCount: number;
  averageRating: number;
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

export default function AdminBooks() {
  const { addToast } = useToast();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/books');
      if (res.success && res.data) {
        setBooks(res.data);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to load books catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filtered = books.filter((b) => {
    const matchesSearch = 
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.fullName.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-purple-600" /> Platform Books Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global catalog of all educational eBooks, sales metrics, and publishing status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/book-approvals"
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition shadow-sm flex items-center gap-2"
          >
            Review Queue
          </Link>
          <button
            onClick={fetchBooks}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by book title, author name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Published (Approved)</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading platform books...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">No books found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria or status filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Book</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {book.coverImageUrl ? (
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            className="w-9 h-12 object-cover rounded shadow-xs bg-slate-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-12 bg-purple-100 text-purple-700 flex items-center justify-center rounded text-xs font-bold flex-shrink-0">
                            PDF
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 line-clamp-1">{book.title}</div>
                          <div className="text-xs text-slate-400">ID: {book.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                      {book.author?.fullName || 'Unknown'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                        {book.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-900">
                      {formatINR(book.price)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-amber-600 font-semibold text-xs">
                        ★ {book.averageRating ? book.averageRating.toFixed(1) : '5.0'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          book.status === 'APPROVED' ? 'success' : book.status === 'PENDING_APPROVAL' ? 'warning' : 'danger'
                        }
                      >
                        {book.status === 'PENDING_APPROVAL' ? 'PENDING' : book.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <a
                        href={`/books/${book.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Store
                      </a>
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
}
