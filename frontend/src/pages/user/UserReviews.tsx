import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export const UserReviews: React.FC = () => {
  const { success, error } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadReviews() {
    try {
      setIsLoading(true);
      const res = await api.get<any>('/reviews/my');
      if (res.success && Array.isArray(res.data)) {
        setReviews(res.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove your review for "${title}"?`)) return;
    try {
      const res = await api.delete(`/reviews/${id}`);
      if (res.success) {
        success('Review deleted successfully.');
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err: any) {
      error(err.message || 'Could not delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Ratings & Reviews</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Reviews and feedback you have shared on published educational eBooks.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <Star className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No reviews submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you read textbooks from your library, share your ratings and comments to help fellow learners.
          </p>
          <Link
            to="/user/library"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition"
          >
            Go to My Library
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 hover:shadow-sm transition"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-18 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 p-0.5">
                  {r.book?.coverImage ? (
                    <img src={r.book.coverImage} alt={r.book.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-blue-700 flex items-center justify-center text-white text-[10px] font-bold">
                      PDF
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">Reviewed on {formatDate(r.createdAt)}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{r.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>

                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Book:</span>
                    <Link
                      to={`/books/${r.book?.slug || r.bookId}`}
                      className="text-xs font-bold text-blue-600 hover:underline truncate max-w-md inline-block"
                    >
                      {r.book?.title}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleDelete(r.id, r.book?.title || 'this book')}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
