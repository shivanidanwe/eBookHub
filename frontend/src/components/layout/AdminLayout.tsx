import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookCheck,
  BookOpen,
  FolderTree,
  CreditCard,
  ShoppingCart,
  Receipt,
  TicketPercent,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../common/Navbar';

export const AdminLayout: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-admin-600"></div>
      </div>
    );
  }

  // Strictly require ADMIN role
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Author Applications', path: '/admin/author-applications', icon: UserCheck },
    { name: 'Book Approvals', path: '/admin/book-approvals', icon: BookCheck },
    { name: 'All Books Catalog', path: '/admin/books', icon: BookOpen },
    { name: 'Categories Management', path: '/admin/categories', icon: FolderTree },
    { name: 'Platform Transactions', path: '/admin/transactions', icon: CreditCard },
    { name: 'Orders & Sales', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Author Payouts', path: '/admin/payouts', icon: Receipt },
    { name: 'Coupons & Promos', path: '/admin/coupons', icon: TicketPercent },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Admin Purple Banner */}
      <div className="bg-admin-700 text-white px-4 py-3 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wider">eBookHub Administration Console</span>
          </div>
          <span className="text-xs text-admin-200 hidden sm:inline">
            Platform Governance, Commission Engine & Content Moderation
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Admin Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-6 sticky top-24">
            {/* Admin Mini Profile */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-admin-100 text-admin-700 font-bold flex items-center justify-center text-lg border-2 border-admin-300">
                A
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 truncate">System Admin</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-admin-50 text-admin-700 border border-admin-200">
                  Super Administrator
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
                        ? 'bg-admin-600 text-white shadow-sm shadow-admin-500/20'
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
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Admin Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
