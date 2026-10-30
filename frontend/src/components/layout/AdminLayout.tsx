import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PenTool,
  UserCheck,
  BookCheck,
  BookOpen,
  FolderTree,
  ShoppingCart,
  CreditCard,
  RotateCcw,
  Percent,
  Receipt,
  Star,
  BarChart3,
  HelpCircle,
  ShieldAlert,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../common/Navbar';

export const AdminLayout: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Strictly require authenticated ADMIN role
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Manage Authors', path: '/admin/authors', icon: PenTool },
    { name: 'Author Applications', path: '/admin/author-applications', icon: UserCheck },
    { name: 'Book Approvals', path: '/admin/book-approvals', icon: BookCheck },
    { name: 'All Books', path: '/admin/books', icon: BookOpen },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Transactions', path: '/admin/transactions', icon: CreditCard },
    { name: 'Refunds', path: '/admin/refunds', icon: RotateCcw },
    { name: 'Commission Settings', path: '/admin/commission', icon: Percent },
    { name: 'Payout Management', path: '/admin/payouts', icon: Receipt },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Support', path: '/admin/support', icon: HelpCircle },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Admin Purple Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-900 text-white px-4 py-2.5 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-200" />
            <span className="font-extrabold text-xs uppercase tracking-wider">Super Administrator Control Console</span>
          </div>
          <span className="text-xs text-purple-200 hidden sm:inline">
            Platform Governance, Financial Engine, Content Moderation & Audit Logs
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Admin Sidebar */}
        <aside className={`${collapsed ? 'w-full md:w-20' : 'w-full md:w-64'} shrink-0 transition-all duration-200`}>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-4 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {/* Admin Mini Profile */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-11 h-11 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-base border-2 border-purple-300 shrink-0">
                A
              </div>
              {!collapsed && (
                <div className="overflow-hidden min-w-0">
                  <p className="font-bold text-slate-900 truncate text-xs">System Admin</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Administrator
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
                    className={`flex items-center ${collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2'} rounded-xl font-medium text-xs transition relative group ${
                      isActive
                        ? 'bg-purple-600 text-white font-bold shadow-sm shadow-purple-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {!collapsed && <span className="truncate">{item.name}</span>}

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
                title={collapsed ? 'Sign Out' : undefined}
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

        {/* Main Admin Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
