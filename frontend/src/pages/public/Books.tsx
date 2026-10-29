import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { api } from '../../lib/api';
import { BookCard } from '../../components/common/BookCard';

export const Books: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = searchParams.get('sort') || 'popular';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';

  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Local filter states
  const [searchInput, setSearchInput] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [selectedRating, setSelectedRating] = useState(ratingParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get<any>('/categories');
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  // Fetch books matching current searchParams
  useEffect(() => {
    async function fetchBooks() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchParam) params.set('search', searchParam);
        if (categoryParam && categoryParam !== 'all') params.set('category', categoryParam);
        if (sortParam) params.set('sort', sortParam);
        if (pageParam) params.set('page', pageParam.toString());
        if (minPriceParam) params.set('minPrice', minPriceParam);
        if (maxPriceParam) params.set('maxPrice', maxPriceParam);
        if (ratingParam) params.set('minRating', ratingParam);

        const res = await api.get<any>(`/books?${params.toString()}`);
        if (res.success && res.data) {
          setBooks(res.data.books || []);
          setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (err) {
        console.error('Error fetching books:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooks();
  }, [searchParams]);

  const applyFilters = () => {
    const nextParams = new URLSearchParams();
    if (searchInput.trim()) nextParams.set('search', searchInput.trim());
    if (selectedCategory && selectedCategory !== 'all') nextParams.set('category', selectedCategory);
    if (selectedSort) nextParams.set('sort', selectedSort);
    if (selectedRating) nextParams.set('rating', selectedRating);
    if (minPrice) nextParams.set('minPrice', minPrice);
    if (maxPrice) nextParams.set('maxPrice', maxPrice);
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedCategory('all');
    setSelectedSort('popular');
    setSelectedRating('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Educational Books</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse through {pagination.total} verified educational eBooks across engineering, AI, and exams.
          </p>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Sort by:</span>
          <select
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              const next = new URLSearchParams(searchParams);
              next.set('sort', e.target.value);
              setSearchParams(next);
            }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500 shadow-xs"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">New Releases</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Sidebar Filters */}
        <aside className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Filter className="w-4 h-4 text-brand-600" />
              <span>Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Keywords</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Title, author, topic..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500 transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Category</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-brand-600">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === 'all'}
                  onChange={() => setSelectedCategory('all')}
                  className="text-brand-600 focus:ring-brand-500 rounded"
                />
                <span className="font-semibold">All Categories</span>
              </label>
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-brand-600">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.slug}
                    onChange={() => setSelectedCategory(cat.slug)}
                    className="text-brand-600 focus:ring-brand-500 rounded"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter (in INR) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Price Range (₹)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
              <span className="text-slate-400 text-xs">—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Rating</label>
            <div className="space-y-1">
              {[
                { label: '4.5 & up', val: '4.5' },
                { label: '4.0 & up', val: '4.0' },
                { label: '3.5 & up', val: '3.5' },
              ].map((rate) => (
                <label key={rate.val} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={selectedRating === rate.val}
                    onChange={() => setSelectedRating(rate.val)}
                    className="text-brand-600 rounded"
                  />
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{rate.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={applyFilters}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            Apply Filters
          </button>
        </aside>

        {/* Right Main Grid */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No matching educational books found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing some filters, searching for alternate keywords like "Python", "DSA", or "AI".
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl hover:bg-brand-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 border rounded-xl bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-slate-700 px-3">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 border rounded-xl bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
