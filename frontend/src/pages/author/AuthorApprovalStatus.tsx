import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, BookPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthorApprovalStatus: React.FC = () => {
  const { user } = useAuth();
  const status = user?.authorStatus || (user?.role === 'AUTHOR' ? 'APPROVED' : 'PENDING');

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-6">
        {status === 'APPROVED' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Author Status: Approved</h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Congratulations! Your author account is fully active. You have full publishing permissions on the marketplace.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/author/dashboard"
                className="px-5 py-2.5 bg-author-600 hover:bg-author-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Go to Author Studio
              </Link>
              <Link
                to="/author/books/new"
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <BookPlus className="w-4 h-4 text-author-600" />
                <span>Upload a Book</span>
              </Link>
            </div>
          </>
        ) : status === 'REJECTED' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Needs Revision</h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your author application did not meet current catalog requirements. Please update your profile or reach out to administration.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/register/author"
                className="inline-block px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Re-submit Application
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Under Review</h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Thank you for applying to publish on eBookHub. Our administrative team is reviewing your profile and credentials. Approvals typically complete within 24 hours.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border text-xs text-slate-600 max-w-sm mx-auto">
              <span>Account: </span>
              <span className="font-bold text-slate-900">{user?.email}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
