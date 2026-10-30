import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  ShoppingCart,
  Heart,
  Package,
  Star,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../common/Navbar';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const UserLayout: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
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
    { name: 'My Cart', path: '/user/cart', icon: ShoppingCart, badge: itemCount },
    { name: 'My Wishlist', path: '/user/wishlist', icon: Heart, badge: wishlistCount },
    { name: 'My Orders', path: '/user/orders', icon: Package },
    { name: 'My Reviews', path: '/user/reviews', icon: Star },
    { name: 'Notifications', path: '/user/notifications', icon: Bell },
    { name: 'My Profile', path: '/user/profile', icon: User },
    { name: 'Settings', path: '/user/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Student Blue Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-4 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-200" />
            <span className="font-extrabold text-xs uppercase tracking-wider">Student & Reader Portal</span>
          </div>
          <span className="text-xs text-blue-100 hidden sm:inline">
            Curriculum Textbooks, Instant PDF Access & Academic Notes
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* User Sidebar */}
        <aside className={`${collapsed ? 'w-full md:w-20' : 'w-full md:w-64'} shrink-0 transition-all duration-200`}>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-5 sticky top-24">
            {/* User Mini Profile Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base border-2 border-blue-200 shrink-0">
                {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="overflow-hidden min-w-0">
                  <p className="font-bold text-slate-900 truncate text-xs">{user.fullName || 'Student'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Student / Reader
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
                        ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!collapsed && typeof item.badge === 'number' && item.badge > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip on collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition shadow-md">
                        {item.name}
                        {typeof item.badge === 'number' && item.badge > 0 ? ` (${item.badge})` : ''}
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

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
