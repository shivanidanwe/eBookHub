import React, { useState, useEffect } from 'react';
import { PenTool, Search, Eye, X, BookOpen, DollarSign, Building2, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export default function AdminAuthors() {
  const { success, error } = useToast();
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<any | null>(null);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/authors');
      if (res.success && res.data) {
        setAuthors(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch authors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const filteredAuthors = authors.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.expertise && a.expertise.some((e: string) => e.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <PenTool className="w-7 h-7 text-purple-600" />
            <span>Manage Authors & Publishers</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Directory of registered educational authors, published titles, bank details, and royalties.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search author name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAuthors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No authors found matching search.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Books (Live)</th>
                  <th className="py-3.5 px-4">Lifetime Earnings</th>
                  <th className="py-3.5 px-4">Available Balance</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuthors.map((author) => (
                  <tr key={author.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{author.fullName}</p>
                        <p className="text-[11px] text-slate-400">{author.email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                          author.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {author.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {author.publishedCount} / {author.booksCount} books
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatINR(author.totalEarnings)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-700">
                      {formatINR(author.availableBalance)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedAuthor(author)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Author Details Modal */}
      {selectedAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{selectedAuthor.fullName}</h3>
                <p className="text-xs text-slate-500">{selectedAuthor.email}</p>
              </div>
              <button
                onClick={() => setSelectedAuthor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700">Expertise:</span>
                <p className="text-slate-600 mt-0.5">
                  {Array.isArray(selectedAuthor.expertise)
                    ? selectedAuthor.expertise.join(', ')
                    : selectedAuthor.expertise || 'Not specified'}
                </p>
              </div>

              {selectedAuthor.bio && (
                <div>
                  <span className="font-bold text-slate-700">Biography:</span>
                  <p className="text-slate-600 mt-0.5">{selectedAuthor.bio}</p>
                </div>
              )}

              <div className="p-3 bg-purple-50 rounded-xl space-y-1">
                <span className="font-bold text-purple-900">Banking Details:</span>
                <p className="text-[11px] text-purple-800">
                  Bank: <strong>{selectedAuthor.bankName || 'Not configured'}</strong> • A/C: <strong>{selectedAuthor.accountNumber || 'N/A'}</strong>
                </p>
                <p className="text-[11px] text-purple-800">
                  IFSC: <strong>{selectedAuthor.ifscCode || 'N/A'}</strong> • UPI: <strong>{selectedAuthor.upiId || 'N/A'}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] text-slate-500">Published Books</span>
                  <p className="font-bold text-slate-900 text-base">{selectedAuthor.publishedCount}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] text-slate-500">Available Balance</span>
                  <p className="font-bold text-slate-900 text-base">{formatINR(selectedAuthor.availableBalance)}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAuthor(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
