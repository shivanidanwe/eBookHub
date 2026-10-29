import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookPlus,
  BookOpen,
  TrendingUp,
  DollarSign,
  Star,
  CreditCard,
  User,
  Settings,
  HelpCircle,
  LogOut,
  PenTool,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../common/Navbar';

export const AuthorLayout: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-author-600"></div>
      </div>
    );
  }

  // Author or Admin access
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== 'AUTHOR' && user.role !== 'ADMIN') {
    return <Navigate to="/author/approval-status" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/author/dashboard', icon: LayoutDashboard },
    { name: 'Add New Book', path: '/author/books/new', icon: BookPlus },
    { name: 'Manage Books', path: '/author/books', icon: BookOpen },
    { name: 'Sales & Orders', path: '/author/sales', icon: TrendingUp },
    { name: 'Financial Ledger', path: '/author/ledger', icon: DollarSign },
    { name: 'Reviews & Ratings', path: '/author/reviews', icon: Star },
    { name: 'Payouts', path: '/author/payouts', icon: CreditCard },
    { name: 'Author Profile', path: '/author/profile', icon: User },
    { name: 'Application Status', path: '/author/approval-status', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Author Accent Banner */}
      <div className="bg-author-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wider">Author & Publisher Studio</span>
          </div>
          <span className="text-xs text-author-100 hidden sm:inline">
            Flat 15% Platform Commission | 85% Net Direct Earnings
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Author Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-6 sticky top-24">
            {/* Author Profile Card */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-author-100 text-author-700 font-bold flex items-center justify-center text-lg border-2 border-author-300">
                {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 truncate">{user.fullName || 'Author'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-author-50 text-author-700 border border-author-200">
                  Verified Author
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
                      isActive
                        ? 'bg-author-600 text-white shadow-sm shadow-author-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs text-rose-600 hover:bg-rose-50 transition text-left mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Author Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
