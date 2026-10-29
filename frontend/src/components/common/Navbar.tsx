import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  PenTool,
  ChevronDown,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro bar for demo switcher & announcements */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-brand-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">
              INDIA
            </span>
            <span className="hidden sm:inline text-slate-400">
              India's Premier Educational eBook Marketplace | Flat 15% Platform Commission
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold bg-slate-800/80 px-2.5 py-1 rounded-md border border-amber-500/30 transition"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-52 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 text-xs"
                  onClick={() => setDemoMenuOpen(false)}
                >
                  <div className="px-3 py-1 font-bold text-slate-400 uppercase text-[10px]">
                    Switch Account Role:
                  </div>
                  <button
                    onClick={() => switchDemoRole('STUDENT')}
                    className="w-full text-left px-3 py-2 hover:bg-brand-50 flex items-center gap-2 text-brand-700 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-brand-600" />
                    Student: Shivani Sharma
                  </button>
                  <button
                    onClick={() => switchDemoRole('AUTHOR')}
                    className="w-full text-left px-3 py-2 hover:bg-author-50 flex items-center gap-2 text-author-700 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-author-600" />
                    Author: Rohan Mehta
                  </button>
                  <button
                    onClick={() => switchDemoRole('ADMIN')}
                    className="w-full text-left px-3 py-2 hover:bg-admin-50 flex items-center gap-2 text-admin-700 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-admin-600" />
                    Admin: System Administrator
                  </button>
                </div>
              )}
            </div>

            <Link to="/help" className="hover:text-white transition hidden md:inline">
              Help & Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center">
              eBook<span className="text-brand-600">Hub</span>
            </span>
            <span className="block text-[10px] text-slate-500 font-medium -mt-1 tracking-wide">
              Learn Anywhere, Grow Everywhere
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search programming, AI, UPSC, aptitude books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white rounded-full border border-transparent focus:border-brand-500 focus:outline-none text-sm transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/books" className="hover:text-brand-600 transition">
            Browse Books
          </Link>
          <Link to="/categories" className="hover:text-brand-600 transition">
            Categories
          </Link>
          <Link to="/authors" className="hover:text-brand-600 transition">
            Authors
          </Link>
          <Link to="/about" className="hover:text-brand-600 transition">
            About
          </Link>
          <Link to="/contact" className="hover:text-brand-600 transition">
            Contact
          </Link>
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-3">
          {/* Wishlist Link */}
          <Link
            to="/user/wishlist"
            className="p-2 text-slate-600 hover:text-rose-600 rounded-full hover:bg-slate-100 transition relative"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            to="/user/cart"
            className="p-2 text-slate-600 hover:text-brand-600 rounded-full hover:bg-slate-100 transition relative"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Account / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs border border-brand-200">
                  {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline max-w-[100px] truncate">
                  {user.fullName || user.email.split('@')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 text-sm animate-in fade-in zoom-in-95"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{user.fullName || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                      ROLE: {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {/* Role-specific dashboard links */}
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-admin-700 font-semibold hover:bg-admin-50 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-admin-600" />
                        Admin Portal
                      </Link>
                    )}

                    {user.role === 'AUTHOR' && (
                      <Link
                        to="/author/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-author-700 font-semibold hover:bg-author-50 transition"
                      >
                        <PenTool className="w-4 h-4 text-author-600" />
                        Author Dashboard
                      </Link>
                    )}

                    <Link
                      to="/user/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Student Dashboard
                    </Link>

                    <Link
                      to="/user/library"
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      My Library
                    </Link>

                    <Link
                      to="/user/orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                    >
                      <ShoppingCart className="w-4 h-4 text-slate-400" />
                      My Orders
                    </Link>

                    <Link
                      to="/user/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Profile & Settings
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm rounded-xl transition"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <nav className="flex flex-col gap-2 pt-2 text-sm font-medium text-slate-700">
            <Link to="/books" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-50">
              Browse All Books
            </Link>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-50">
              Categories
            </Link>
            <Link to="/authors" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-50">
              Featured Authors
            </Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-50">
              About Us
            </Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-50">
              Contact & Support
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
