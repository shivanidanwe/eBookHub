import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const AccessDenied: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-md w-full p-8 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Access Restricted</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            You do not possess the required role permissions to view this resource. Please login with an authorized account or return to the main portal.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            to="/"
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Go to Marketplace Home
          </Link>
          <Link
            to="/login"
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Switch Account / Login
          </Link>
        </div>
      </div>
    </div>
  );
};
