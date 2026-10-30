import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  BookPlus,
  Clock,
  TrendingUp,
  DollarSign,
  CreditCard,
  Star,
  User,
  Bell,
  Settings,
  LogOut,
  PenTool,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../common/Navbar';

export const AuthorLayout: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Strictly require authenticated session
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // If a student tries to access author studio without applying, send to application
  if (user.role !== 'AUTHOR' && user.role !== 'ADMIN') {
    return <Navigate to="/author/approval-status" replace />;
  }

  const isPendingOrRejected = user.authorStatus === 'PENDING' || user.authorStatus === 'REJECTED';

  const navItems = [
    { name: 'Dashboard', path: '/author/dashboard', icon: LayoutDashboard },
    { name: 'My Books', path: '/author/books', icon: BookOpen },
    { name: 'Add New Book', path: '/author/books/new', icon: BookPlus },
    { name: 'Book Approvals', path: '/author/approvals', icon: Clock },
    { name: 'Orders & Sales', path: '/author/sales', icon: TrendingUp },
    { name: 'Earnings', path: '/author/earnings', icon: DollarSign },
    { name: 'Payouts', path: '/author/payouts', icon: CreditCard },
    { name: 'Reviews', path: '/author/reviews', icon: Star },
    { name: 'Author Profile', path: '/author/profile', icon: User },
    { name: 'Notifications', path: '/author/notifications', icon: Bell },
    { name: 'Settings', path: '/author/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Author Orange Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white px-4 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-orange-200" />
            <span className="font-extrabold text-xs uppercase tracking-wider">Author & Publisher Studio</span>
          </div>
          <span className="text-xs text-orange-100 hidden sm:inline">
            Flat 15% Platform Commission | 85% Direct Royalties | Automated Settlements
          </span>
        </div>
      </div>

      {/* Rejection / Pending alert banner if applicable */}
      {isPendingOrRejected && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Your author account status is <strong>{user.authorStatus}</strong>. Publishing features remain locked until administrative approval.
            </span>
            <Link to="/author/approval-status" className="font-bold underline ml-2 text-amber-950">
              Check Status
            </Link>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Author Sidebar */}
        <aside className={`${collapsed ? 'w-full md:w-20' : 'w-full md:w-64'} shrink-0 transition-all duration-200`}>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-5 sticky top-24">
            {/* Author Profile Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-base border-2 border-orange-300 shrink-0">
                {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="overflow-hidden min-w-0">
                  <p className="font-bold text-slate-900 truncate text-xs">{user.fullName || 'Author'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    user.authorStatus === 'APPROVED' || user.role === 'ADMIN'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {user.authorStatus === 'APPROVED' || user.role === 'ADMIN' ? 'Verified Author' : user.authorStatus || 'Author'}
                  </span>
                </div>
              )}
            </div>

            {/* Collapse / Expand Toggle Button (Desktop only) */}
            <div className="hidden md:flex justify-end">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition text-xs flex items-center gap-1"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                {!collapsed && <span className="text-[10px] font-semibold text-slate-400">Collapse</span>}
              </button>
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
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center ${collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3.5 py-2.5'} rounded-xl font-medium text-xs transition relative group ${
                      isActive
                        ? 'bg-orange-600 text-white font-bold shadow-sm shadow-orange-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {/* Tooltip on collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition shadow-md">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}

              <button
                onClick={logout}
                title={collapsed ? 'Log Out' : undefined}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-3.5'} py-2.5 rounded-xl font-medium text-xs text-rose-600 hover:bg-rose-50 transition text-left mt-2 relative group`}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Logout</span>}

                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition shadow-md">
                    Logout
                  </div>
                )}
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
