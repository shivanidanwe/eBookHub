import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle2, BookOpen, Users, Award, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { BookCard } from '../../components/common/BookCard';

export const AuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuthor() {
      try {
        setIsLoading(true);
        const res = await api.get<any>(`/authors/${id}`);
        if (res.success && res.data) {
          setAuthor(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuthor();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mb-4"></div>
        <p className="text-xs text-slate-500">Loading author profile...</p>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="text-2xl font-bold text-slate-900">Author Not Found</h2>
        <Link to="/authors" className="text-xs font-bold text-brand-600 hover:underline">
          Return to Author Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/authors" className="hover:text-brand-600">Authors</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900">{author.fullName}</span>
      </nav>

      {/* Author Profile Header Box (Matching Screen 5) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-24 h-24 rounded-3xl bg-brand-100 text-brand-700 font-bold text-3xl flex items-center justify-center shrink-0 border-2 border-brand-200 shadow-sm">
            {author.fullName?.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{author.fullName}</h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Author
                </span>
              </div>
              <p className="text-xs text-brand-600 font-semibold mt-1">
                Educational Content Creator & Subject Matter Specialist
              </p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{author.bio}</p>

            {/* Stats row */}
            <div className="flex items-center justify-center sm:justify-start gap-6 pt-2">
              <div className="text-center sm:text-left">
                <p className="text-xl font-extrabold text-slate-900">{author.stats?.totalBooks || author.books?.length || 0}</p>
                <p className="text-[11px] text-slate-400 font-medium">Books Published</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center sm:text-left">
                <p className="text-xl font-extrabold text-slate-900 flex items-center gap-1 justify-center sm:justify-start text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {author.stats?.averageRating || '4.8'}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">Author Rating</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center sm:text-left">
                <p className="text-xl font-extrabold text-slate-900">
                  {author.stats?.totalStudents?.toLocaleString('en-IN') || '25K+'}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">Students Enrolled</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Books by Author Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Books by {author.fullName}</h2>
        {author.books && author.books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {author.books.map((book: any) => (
              <BookCard key={book.id} book={{ ...book, author: { fullName: author.fullName } }} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No published books found for this author currently.</p>
        )}
      </section>
    </div>
  );
};
