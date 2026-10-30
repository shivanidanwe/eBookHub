import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Send, AlertCircle, BookOpen } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export const AuthorEditBook: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [language, setLanguage] = useState('English');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        const [catRes, bookRes] = await Promise.all([
          api.get<any>('/categories'),
          api.get<any>(`/author/books/${bookId}`),
        ]);

        if (catRes.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }

        if (bookRes.success && bookRes.data) {
          const b = bookRes.data;
          setTitle(b.title || '');
          setSubtitle(b.subtitle || '');
          setDescription(b.description || '');
          setCategoryId(b.categoryId || '');
          setLanguage(b.language || 'English');
          setPrice((b.price / 100).toString());
          setDiscountPrice(b.discountPrice ? (b.discountPrice / 100).toString() : '');
        }
      } catch (err: any) {
        error(err.message || 'Failed to load book data');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [bookId]);

  const handleSubmit = async (submitForReview: boolean) => {
    if (!title.trim() || !description.trim() || !price) {
      error('Please complete title, description, and price.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.put<any>(`/author/books/${bookId}`, {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim(),
        categoryId,
        language,
        price,
        discountPrice: discountPrice || undefined,
        submitForReview,
      });

      if (res.success) {
        success(
          submitForReview
            ? 'Book changes saved and submitted to administrator review queue!'
            : 'Book changes saved as draft.'
        );
        navigate('/author/books');
      }
    } catch (err: any) {
      error(err.message || 'Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading book details for editing...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          to="/author/books"
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Books</span>
        </Link>
        <span className="text-xs text-slate-400 font-mono">Book ID: {bookId?.slice(0, 8)}...</span>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit eBook Details</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update pricing, curriculum description, or submit your manuscript for moderation.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Book Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Subtitle (Optional)</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Book Description *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Bilingual">Bilingual</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Original Price (₹) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Discounted Price (₹)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4 text-slate-400" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Submit for Approval'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
