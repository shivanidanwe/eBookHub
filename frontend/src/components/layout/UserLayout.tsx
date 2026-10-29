import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  Heart,
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../common/Navbar';

export const UserLayout: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Browse Books', path: '/books', icon: Compass },
    { name: 'My Library', path: '/user/library', icon: BookOpen },
    { name: 'My Orders', path: '/user/orders', icon: ShoppingCart },
    { name: 'Wishlist', path: '/user/wishlist', icon: Heart },
    { name: 'Personal Profile', path: '/user/profile', icon: User },
    { name: 'Notifications', path: '/user/notifications', icon: Bell },
    { name: 'Account Settings', path: '/user/settings', icon: Settings },
    { name: 'Help & Support', path: '/user/support', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* User Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-6 sticky top-24">
            {/* User Profile Mini Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-lg border-2 border-brand-200">
                {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 truncate">{user.fullName || 'Student'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  Student / Reader
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
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
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

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
