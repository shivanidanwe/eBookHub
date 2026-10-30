import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  GraduationCap,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalsOpen, setPortalsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const portalsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const demoMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (portalsRef.current && !portalsRef.current.contains(event.target as Node)) {
        setPortalsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (demoMenuRef.current && !demoMenuRef.current.contains(event.target as Node)) {
        setDemoMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchTerm.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handlePortalNavigate = (portal: 'student' | 'author' | 'admin') => {
    setPortalsOpen(false);
    setMobileMenuOpen(false);

    if (portal === 'student') {
      if (user) {
        navigate('/user/dashboard');
      } else {
        navigate('/login?portal=student');
      }
    } else if (portal === 'author') {
      if (user?.role === 'AUTHOR' || user?.role === 'ADMIN') {
        navigate('/author/dashboard');
      } else if (user?.role === 'USER') {
        navigate('/register/author');
      } else {
        navigate('/login?portal=author');
      }
    } else if (portal === 'admin') {
      if (user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/admin/login');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro bar for quick demo switcher & announcement */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-brand-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">
              INDIA
            </span>
            <span className="hidden sm:inline text-slate-400">
              India's Premier Educational eBook Marketplace | Student, Author & Admin Ecosystem
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative" ref={demoMenuRef}>
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 text-[11px] text-amber-400 hover:text-amber-300 font-semibold bg-slate-800/90 px-2.5 py-0.5 rounded-md border border-amber-500/30 transition"
                title="Quickly test the platform as different roles"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Test Role Switcher</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 text-xs"
                  onClick={() => setDemoMenuOpen(false)}
                >
                  <div className="px-3 py-1 font-bold text-slate-400 uppercase text-[10px]">
                    Switch Account Role:
                  </div>
                  <button
                    onClick={() => switchDemoRole('STUDENT')}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 text-blue-700 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Student: Shivani Sharma
                  </button>
                  <button
                    onClick={() => switchDemoRole('AUTHOR')}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center gap-2 text-orange-700 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-600" />
                    Author: Rohan Mehta
                  </button>
                  <button
                    onClick={() => switchDemoRole('ADMIN')}
                    className="w-full text-left px-3 py-2 hover:bg-purple-50 flex items-center gap-2 text-purple-700 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    Admin: Super Administrator
                  </button>
                </div>
              )}
            </div>

            <Link to="/contact" className="hover:text-white transition hidden md:inline text-[11px]">
              Support
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
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm relative">
          <input
            type="text"
            placeholder="Search programming, AI, exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white rounded-full border border-transparent focus:border-brand-500 focus:outline-none text-xs transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-slate-700">
          <Link
            to="/"
            className={`transition hover:text-brand-600 ${
              location.pathname === '/' ? 'text-brand-600 font-bold' : ''
            }`}
          >
            Home
          </Link>
          <Link
            to="/books"
            className={`transition hover:text-brand-600 ${
              location.pathname.startsWith('/books') ? 'text-brand-600 font-bold' : ''
            }`}
          >
            Browse Books
          </Link>
          <Link
            to="/categories"
            className={`transition hover:text-brand-600 ${
              location.pathname === '/categories' ? 'text-brand-600 font-bold' : ''
            }`}
          >
            Categories
          </Link>
          <Link
            to="/authors"
            className={`transition hover:text-brand-600 ${
              location.pathname.startsWith('/authors') ? 'text-brand-600 font-bold' : ''
            }`}
          >
            Authors
          </Link>

          {/* Prominent PORTALS Dropdown */}
          <div className="relative" ref={portalsRef}>
            <button
              onClick={() => setPortalsOpen(!portalsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs"
            >
              <span>PORTALS</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${portalsOpen ? 'rotate-180' : ''}`} />
            </button>

            {portalsOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-in fade-in zoom-in-95 space-y-3">
                <div className="px-2 pt-1 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Select Your Portal
                  </span>
                  {user && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Logged in as: {user.role}
                    </span>
                  )}
                </div>

                {/* 1. Student / User Portal - Blue Theme */}
                <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-xs">Student / User Portal</h4>
                        {user?.role === 'USER' && (
                          <span className="text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Browse, purchase, and read educational eBooks.
                      </p>
                    </div>
                  </div>
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => handlePortalNavigate('student')}
                      className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Enter Student Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Author Portal - Orange Theme */}
                <div className="p-3.5 rounded-xl border border-orange-100 bg-orange-50/50 hover:bg-orange-50 transition space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
                      <PenTool className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-xs">Author Portal</h4>
                        {user?.role === 'AUTHOR' && (
                          <span className="text-[9px] font-extrabold bg-orange-600 text-white px-1.5 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Publish books, manage sales, and track earnings.
                      </p>
                    </div>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => handlePortalNavigate('author')}
                      className="w-full py-1.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>
                        {user?.role === 'USER' ? 'Apply for Author Portal' : 'Enter Author Portal'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. Admin Portal - Purple Theme (Strictly NO public registration exposed) */}
                <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-xs">Admin Portal</h4>
                        {user?.role === 'ADMIN' ? (
                          <span className="text-[9px] font-extrabold bg-purple-600 text-white px-1.5 py-0.5 rounded">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-purple-700 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Protected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Manage users, approve books, and monitor the platform.
                      </p>
                    </div>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => handlePortalNavigate('admin')}
                      className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{user?.role === 'ADMIN' ? 'Enter Admin Console' : 'Admin Login'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Icons & User Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist Link */}
          <Link
            to="/user/wishlist"
            className="p-2 text-slate-600 hover:text-rose-600 rounded-full hover:bg-slate-100 transition relative"
            title="My Wishlist"
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
            title="My Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Account / Login State */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <div
                  className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs border ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700 border-purple-300'
                      : user.role === 'AUTHOR'
                      ? 'bg-orange-100 text-orange-700 border-orange-300'
                      : 'bg-blue-100 text-blue-700 border-blue-300'
                  }`}
                >
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
                    <span
                      className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : user.role === 'AUTHOR'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      ROLE: {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {/* Role-specific direct dashboard link */}
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-purple-700 font-semibold hover:bg-purple-50 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    {user.role === 'AUTHOR' && (
                      <Link
                        to="/author/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-orange-700 font-semibold hover:bg-orange-50 transition"
                      >
                        <PenTool className="w-4 h-4 text-orange-600" />
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
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition text-left font-semibold text-xs"
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
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm rounded-xl transition"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Clean Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search educational books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Standard Navigation */}
          <nav className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Home</span>
            </Link>
            <Link
              to="/books"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Browse Books</span>
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Categories</span>
            </Link>
            <Link
              to="/authors"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Authors</span>
            </Link>
          </nav>

          {/* Portals Section in Mobile Drawer */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="px-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Role Portals
            </div>

            {/* Mobile Student Portal Card */}
            <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/60 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Student / User Portal</h4>
                  <p className="text-[10px] text-slate-500">Browse, purchase, and read educational eBooks.</p>
                </div>
              </div>
              <button
                onClick={() => handlePortalNavigate('student')}
                className="w-full py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg"
              >
                Enter Student Portal
              </button>
            </div>

            {/* Mobile Author Portal Card */}
            <div className="p-3 rounded-xl border border-orange-100 bg-orange-50/60 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Author Portal</h4>
                  <p className="text-[10px] text-slate-500">Publish books, manage sales, and track earnings.</p>
                </div>
              </div>
              <button
                onClick={() => handlePortalNavigate('author')}
                className="w-full py-1.5 bg-orange-600 text-white font-bold text-xs rounded-lg"
              >
                {user?.role === 'USER' ? 'Apply for Author Portal' : 'Enter Author Portal'}
              </button>
            </div>

            {/* Mobile Admin Portal Card */}
            <div className="p-3 rounded-xl border border-purple-100 bg-purple-50/60 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Admin Portal</h4>
                  <p className="text-[10px] text-slate-500">Manage users, approve books, and monitor platform.</p>
                </div>
              </div>
              <button
                onClick={() => handlePortalNavigate('admin')}
                className="w-full py-1.5 bg-purple-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{user?.role === 'ADMIN' ? 'Enter Admin Console' : 'Admin Login'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
