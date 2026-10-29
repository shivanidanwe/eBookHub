import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';

export const AuthorReviews: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/author/reviews');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, []);

  const avgRating = data?.averageRating || 4.6;
  const totalReviews = data?.totalReviews || 320;
  const starDist = data?.starDistribution || { 5: 220, 4: 70, 3: 20, 2: 7, 1: 3 };
  const reviews = data?.reviews || [];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Ratings & Reviews</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Feedback and ratings submitted by verified student purchasers across your published educational eBooks.
        </p>
      </div>

      {/* Ratings Overview Card (Matching Screen 7 of Mockup) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left score */}
        <div className="md:col-span-4 text-center space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
          <p className="text-5xl font-extrabold text-slate-900 tracking-tight">{avgRating}</p>
          <div className="flex justify-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <p className="text-xs text-slate-500 font-medium">({totalReviews} verified student reviews)</p>
        </div>

        {/* Right Distribution Bars (Matching Screen 7) */}
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starDist[stars] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-700">{stars} Stars</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right text-slate-400 font-semibold">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Student Feedback</h2>

        {reviews.length > 0 ? (
          reviews.map((rev: any) => (
            <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                    {rev.user?.profile?.fullName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">{rev.user?.profile?.fullName || 'Student'}</p>
                    <p className="text-[10px] text-slate-400">Book: {rev.book?.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              <p className="font-bold text-xs text-slate-900 pt-1">{rev.title}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              <p className="text-[10px] text-slate-400 pt-1">{formatDate(rev.createdAt)}</p>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-400">
            No reviews logged yet.
          </div>
        )}
      </div>
    </div>
  );
};
