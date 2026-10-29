import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';

export const Authors: React.FC = () => {
  const [authors, setAuthors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuthors() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/authors');
        if (res.success && Array.isArray(res.data)) {
          setAuthors(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuthors();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Verified Educational Authors</h1>
        <p className="text-sm text-slate-500">
          Connect directly with industry practitioners, university educators, and civil service mentors publishing authoritative textbooks.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {authors.map((author) => (
            <div
              key={author.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition flex flex-col sm:flex-row gap-5 items-center sm:items-start"
            >
              <div className="w-20 h-20 rounded-2xl bg-brand-100 text-brand-700 font-bold text-2xl flex items-center justify-center shrink-0 border border-brand-200">
                {author.fullName?.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <h3 className="font-bold text-slate-900 text-lg">{author.fullName}</h3>
                    <CheckCircle2 className="w-4 h-4 text-brand-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{author.bio}</p>
                </div>

                <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                  {(author.expertise || []).slice(0, 3).map((exp: string, idx: number) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                      {exp}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-3 text-slate-600">
                    <span>{author.totalBooks || 0} Books</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      4.8
                    </span>
                  </div>
                  <Link
                    to={`/authors/${author.id}`}
                    className="text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
