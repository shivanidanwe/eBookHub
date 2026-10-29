import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, PenTool, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';

export const RegisterChoice: React.FC = () => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-2xl w-full p-8 sm:p-12 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to eBookHub
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Choose your role to get started with India's educational eBook marketplace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 1. Student / Reader */}
          <Link
            to="/register/user"
            className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-brand-600 hover:bg-brand-50/30 transition-all flex flex-col justify-between text-left space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition">
                Student / Reader
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse, buy, read online with built-in viewer, and download authorized PDFs.
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform">
              <span>Sign Up as Student</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* 2. Author */}
          <Link
            to="/register/author"
            className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-author-600 hover:bg-author-50/30 transition-all flex flex-col justify-between text-left space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-author-100 text-author-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-author-600 transition">
                Author & Educator
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Publish educational manuscripts and earn 85% revenue share with direct payouts.
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-author-600 group-hover:translate-x-1 transition-transform">
              <span>Apply as Author</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* 3. Administrator */}
          <Link
            to="/admin/login"
            className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-admin-600 hover:bg-admin-50/30 transition-all flex flex-col justify-between text-left space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-admin-100 text-admin-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-admin-600 transition">
                Administrator
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Manage the platform, review author applications, approve books, and audit transactions.
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-admin-600 group-hover:translate-x-1 transition-transform">
              <span>Admin Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
