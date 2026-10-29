import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Download, Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      {/* Trust banner */}
      <div className="border-b border-slate-800 py-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Verified Academic Content</p>
              <p className="text-xs text-slate-400">All books thoroughly reviewed by platform moderators.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Instant PDF Delivery</p>
              <p className="text-xs text-slate-400">Read immediately online or download for offline study.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Empowering Indian Authors</p>
              <p className="text-xs text-slate-400">Fair 85% revenue share with automated bank settlements.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand column */}
        <div className="col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">
              eBook<span className="text-brand-400">Hub</span>
            </span>
          </Link>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            eBookHub is India's dedicated educational eBook marketplace connecting passionate educators, professors, and authors directly with ambitious students preparing for university, technical placements, and civil service examinations.
          </p>
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
            <span>Payment partners:</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-semibold">UPI</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-semibold">RuPay</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-semibold">Razorpay</span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <p className="font-bold text-white text-xs uppercase tracking-wider">Explore</p>
          <ul className="space-y-2 text-xs">
            <li><Link to="/books?category=computer-science" className="hover:text-white transition">Computer Science</Link></li>
            <li><Link to="/books?category=data-science" className="hover:text-white transition">Data Science & AI</Link></li>
            <li><Link to="/books?category=competitive-exams" className="hover:text-white transition">UPSC & Civil Services</Link></li>
            <li><Link to="/books?category=aptitude" className="hover:text-white transition">Quantitative Aptitude</Link></li>
            <li><Link to="/categories" className="hover:text-white transition text-brand-400">View All Categories &rarr;</Link></li>
          </ul>
        </div>

        {/* For Readers & Authors */}
        <div className="space-y-3">
          <p className="font-bold text-white text-xs uppercase tracking-wider">Portals</p>
          <ul className="space-y-2 text-xs">
            <li><Link to="/user/dashboard" className="hover:text-white transition">Student Portal</Link></li>
            <li><Link to="/user/library" className="hover:text-white transition">My Library</Link></li>
            <li><Link to="/author/dashboard" className="hover:text-white transition">Author Portal</Link></li>
            <li><Link to="/register/author" className="hover:text-white transition text-author-400">Become an Author</Link></li>
            <li><Link to="/admin/login" className="hover:text-white transition text-admin-400">Admin Login</Link></li>
          </ul>
        </div>

        {/* Company & Support */}
        <div className="space-y-3">
          <p className="font-bold text-white text-xs uppercase tracking-wider">Company</p>
          <ul className="space-y-2 text-xs">
            <li><Link to="/about" className="hover:text-white transition">About eBookHub</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
            <li><Link to="/help" className="hover:text-white transition">Help & Support</Link></li>
            <li><Link to="/faq" className="hover:text-white transition">Frequently Asked Questions</Link></li>
            <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link to="/refund-policy" className="hover:text-white transition">Refund Policy</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <p className="flex items-center justify-center gap-1">
          &copy; 2026 eBookHub Technologies India. Learn Anywhere, Grow Everywhere. Crafted with{' '}
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline" /> for Indian Learners.
        </p>
      </div>
    </footer>
  );
};
