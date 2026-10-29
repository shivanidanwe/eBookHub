import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  Code,
  Cpu,
  GraduationCap,
  Calculator,
  Settings,
} from 'lucide-react';
import { api } from '../../lib/api';
import { BookCard } from '../../components/common/BookCard';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredData, setFeaturedData] = useState<any>({
    trending: [],
    bestSellers: [],
    newReleases: [],
    competitive: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/books/featured');
        if (res.success && res.data) {
          setFeaturedData(res.data);
        }
      } catch (err) {
        console.error('Error fetching featured books:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const popularCategoryBadges = [
    { name: 'Computer Science', slug: 'computer-science', icon: Code },
    { name: 'Data Science & AI', slug: 'data-science', icon: Cpu },
    { name: 'Engineering Core', slug: 'engineering', icon: Settings },
    { name: 'UPSC & Civil Services', slug: 'competitive-exams', icon: GraduationCap },
    { name: 'Aptitude & Reasoning', slug: 'aptitude', icon: Calculator },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION (Matching UI Reference Image Screen 1) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 border-b border-slate-200/60 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading, Subtitle, Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>India's Trusted Educational Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Learn Anywhere, <br />
                <span className="text-brand-600">Grow Everywhere.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Discover top-tier educational eBooks authored by leading Indian professors, engineers, and competitive exam mentors. Read online with our interactive reader or download authorized PDFs instantly.
              </p>

              {/* Hero Search Box */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-xl shadow-lg rounded-2xl overflow-hidden bg-white border border-slate-200">
                <div className="flex items-center px-4 py-2">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Python, Data Structures, Machine Learning, UPSC..."
                    className="w-full px-3 py-2.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition shrink-0"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Popular Category Chips */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Popular Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {popularCategoryBadges.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.slug}
                        to={`/books?category=${cat.slug}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-brand-500 text-xs font-semibold text-slate-700 hover:text-brand-600 transition shadow-xs"
                      >
                        <Icon className="w-3.5 h-3.5 text-brand-600" />
                        <span>{cat.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Visual card stack */}
                <div className="bg-gradient-to-tr from-brand-600 to-indigo-700 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between pb-6 border-b border-white/20">
                    <div>
                      <span className="text-xs font-semibold text-brand-200">Top Educational Pick</span>
                      <h3 className="text-xl font-bold">Python for Beginners</h3>
                      <p className="text-xs text-brand-100">By Rohan Mehta</p>
                    </div>
                    <span className="bg-amber-400 text-slate-900 font-extrabold text-xs px-2.5 py-1 rounded-full">
                      ₹199
                    </span>
                  </div>

                  <div className="py-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Over 100+ tested code samples and interview questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Built-in PDF reader with page bookmarking and offline download</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Verified verified author with 25,000+ students</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-300 font-bold text-xs">
                      <Star className="w-4 h-4 fill-amber-300" />
                      <span>4.8 Rating (320 Verified Reviews)</span>
                    </div>
                    <Link
                      to="/books/python-for-beginners"
                      className="px-4 py-2 bg-white text-brand-700 font-bold text-xs rounded-xl shadow hover:bg-slate-100 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 hidden sm:flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">100% Secure Payments</p>
                    <p className="text-[10px] text-slate-500">UPI, Cards, Net Banking via Razorpay</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRENDING EBOOKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              <h2 className="text-2xl font-extrabold text-slate-900">Trending eBooks</h2>
            </div>
            <p className="text-xs text-slate-500">Top educational titles in demand across universities this week.</p>
          </div>
          <Link
            to="/books"
            className="flex items-center gap-1 text-brand-600 hover:text-brand-700 font-bold text-xs hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {featuredData.trending.map((book: any) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 3. BEST-SELLING BOOKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-extrabold text-slate-900">Best-Selling Books</h2>
            </div>
            <p className="text-xs text-slate-500">Highest rated and most purchased study materials by Indian learners.</p>
          </div>
          <Link
            to="/books?sort=popular"
            className="flex items-center gap-1 text-brand-600 hover:text-brand-700 font-bold text-xs hover:underline"
          >
            <span>See More</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {featuredData.bestSellers.map((book: any) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* 4. COMPETITIVE EXAM SPECIALS */}
      <section className="bg-slate-900 text-white py-12 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 lg:px-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Exam Ace Series</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Competitive Examination Hub</h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Curated study notes, solved question banks, and speed math formulas for UPSC CSE, MPSC, GATE, and campus aptitude rounds.
            </p>
          </div>
          <Link
            to="/books?category=competitive-exams"
            className="self-start md:self-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition"
          >
            Explore Exam Resources
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {featuredData.competitive.map((book: any) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* 5. FEATURED AUTHORS (Screen 5 of Mockup) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900">Learn from Verified Indian Authors</h2>
          <p className="text-sm text-slate-500">
            Our marketplace hosts recognized professors, engineers, and competitive examination trainers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rohan Mehta */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:shadow-md transition">
            <div className="w-24 h-24 rounded-2xl bg-brand-100 text-brand-700 font-bold text-3xl flex items-center justify-center shrink-0 border-2 border-brand-200">
              RM
            </div>
            <div className="space-y-3 text-center sm:text-left flex-1">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Rohan Mehta</h3>
                <p className="text-xs text-brand-600 font-semibold">Educational Content Creator & Senior Architect</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Author of best-selling Computer Science guides. Over 25,000 students enrolled in programming and system design courses across India.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-bold text-slate-700">
                <span>12 Books</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.8 Rating
                </span>
                <span>•</span>
                <span>25K+ Students</span>
              </div>
              <Link
                to="/authors/rohan-mehta"
                className="inline-block text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline pt-1"
              >
                View Books by Rohan &rarr;
              </Link>
            </div>
          </div>

          {/* Priya Sharma */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:shadow-md transition">
            <div className="w-24 h-24 rounded-2xl bg-author-100 text-author-700 font-bold text-3xl flex items-center justify-center shrink-0 border-2 border-author-200">
              PS
            </div>
            <div className="space-y-3 text-center sm:text-left flex-1">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Priya Sharma</h3>
                <p className="text-xs text-author-600 font-semibold">AI Researcher & Data Science Educator</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ph.D. in Machine Learning. Author of practical guides in Python AI, Neural Networks, PyTorch, and Web Development with React.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-bold text-slate-700">
                <span>8 Books</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.9 Rating
                </span>
                <span>•</span>
                <span>18K+ Students</span>
              </div>
              <Link
                to="/authors/priya-sharma"
                className="inline-block text-xs font-bold text-author-600 hover:text-author-700 hover:underline pt-1"
              >
                View Books by Priya &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOR AUTHORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-author-500 to-amber-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full">
              Publish on eBookHub
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">Are You An Educational Author?</h2>
            <p className="text-sm text-author-100 leading-relaxed">
              Sell your educational eBooks directly to thousands of students across India. Retain 85% of your sales revenue with transparent automated settlements and real-time sales analytics.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/register/author"
              className="px-6 py-3 bg-white text-author-700 hover:bg-slate-100 font-extrabold text-sm rounded-xl shadow-lg transition text-center"
            >
              Apply as Author
            </Link>
            <Link
              to="/author/dashboard"
              className="px-6 py-3 bg-author-700 hover:bg-author-800 text-white font-bold text-sm rounded-xl border border-white/20 transition text-center"
            >
              Author Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
