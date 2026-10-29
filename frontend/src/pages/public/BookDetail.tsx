import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Zap,
  BookOpen,
  CheckCircle2,
  Share2,
  Heart,
  FileText,
  ShieldCheck,
  Award,
  ChevronRight,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BookCard } from '../../components/common/BookCard';

export const BookDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast, success, error } = useToast();

  const [book, setBook] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'contents' | 'reviews' | 'features'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Review submission state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadBook() {
      try {
        setIsLoading(true);
        const res = await api.get<any>(`/books/${slug}`);
        if (res.success && res.data) {
          setBook(res.data);
        }
      } catch (err: any) {
        toast('Failed to load book details', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadBook();
  }, [slug]);

  const handleBuyNow = async () => {
    if (!book) return;
    const added = await addToCart(book.id);
    if (added || user) {
      navigate('/user/checkout');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please login to post a review', 'info');
      return;
    }
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toast('Please fill in review title and comments', 'error');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await api.post(`/reviews/book/${book.id}`, {
        rating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      if (res.success) {
        success('Review submitted successfully!');
        setReviewTitle('');
        setReviewComment('');
        // Reload book reviews
        const updated = await api.get<any>(`/books/${slug}`);
        if (updated.success) setBook(updated.data);
      }
    } catch (err: any) {
      toast(err.message || 'Could not submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
        <p className="text-sm font-medium text-slate-500">Loading educational title details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Book Not Found</h2>
        <p className="text-sm text-slate-500">The requested title is not currently published on eBookHub.</p>
        <Link to="/books" className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(book.id);
  const hasDiscount = book.discountPrice && book.discountPrice < book.price;
  const effectivePrice = hasDiscount ? book.discountPrice : book.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/books" className="hover:text-brand-600">Books</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={`/books?category=${book.category?.slug}`} className="hover:text-brand-600">
          {book.category?.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Book Presentation Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Cover & Preview Action */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center gap-4">
            <div className="w-full max-w-sm aspect-[3/4] bg-slate-100 rounded-2xl p-4 shadow-lg border border-slate-200/80 flex items-center justify-center relative overflow-hidden group">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-contain rounded-xl drop-shadow-md group-hover:scale-102 transition"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-brand-700 to-slate-900 flex flex-col justify-between p-6 text-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {book.category?.name}
                  </span>
                  <h2 className="text-2xl font-bold">{book.title}</h2>
                  <p className="text-xs text-slate-300">By {book.author?.fullName}</p>
                </div>
              )}
            </div>

            {/* Sample Preview Button */}
            <button
              onClick={() => setShowPreviewModal(true)}
              className="w-full max-w-sm py-3 px-4 rounded-xl border-2 border-brand-600 text-brand-600 hover:bg-brand-50 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <FileText className="w-4 h-4" />
              <span>Read Sample Preview (Free)</span>
            </button>
          </div>

          {/* Right Column: Book Details & Actions */}
          <div className="md:col-span-7 lg:col-span-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-bold text-xs border border-brand-200">
                  {book.category?.name}
                </span>
                {book.targetExam && (
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                    {book.targetExam}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
                  {book.educationalLevel || 'Beginner to Advanced'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {book.title}
              </h1>

              {book.subtitle && (
                <p className="text-base text-slate-600 font-medium">{book.subtitle}</p>
              )}

              {/* Author & Rating info */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <Link
                  to={`/authors/${book.author?.id}`}
                  className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-brand-600 transition"
                >
                  <span>By {book.author?.fullName}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                </Link>

                <span className="text-slate-300">•</span>

                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{book.averageRating ? book.averageRating.toFixed(1) : '4.8'}</span>
                  <span className="text-slate-400 font-normal">({book.totalRatings || 320} reviews)</span>
                </div>

                <span className="text-slate-300">•</span>

                <span className="text-slate-500 font-medium">
                  {book.totalPages || 320} Pages • {book.language || 'English'}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500">Marketplace Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {formatINR(effectivePrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatINR(book.price)}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Save {formatINR(book.price - book.discountPrice!)}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right text-xs text-slate-500">
                <p className="font-semibold text-slate-700">Digital Edition License</p>
                <p>Instant PDF Download & Online Reader</p>
              </div>
            </div>

            {/* Purchase Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => addToCart(book.id)}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Buy Now</span>
              </button>

              <button
                onClick={() => toggleWishlist(book.id)}
                className={`p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition shrink-0 ${
                  inWishlist ? 'text-rose-500 bg-rose-50 border-rose-200' : 'text-slate-600'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Trust Assurance points */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Safe Checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Lifetime Cloud Access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Verified Content</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Overview, Contents, Key Features, Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('contents')}
            className={`pb-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'contents'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Table of Contents
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Key Highlights
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Reviews ({book.reviews?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed max-w-3xl">
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-2">About This Book</h3>
              <p className="whitespace-pre-line text-slate-600">{book.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Language</span>
                <span className="font-bold text-slate-800">{book.language || 'English'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">ISBN</span>
                <span className="font-bold text-slate-800">{book.isbn || 'eBookHub-DL-9821'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Total Pages</span>
                <span className="font-bold text-slate-800">{book.totalPages}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Format</span>
                <span className="font-bold text-slate-800">PDF & Web Reader</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contents' && (
          <div className="max-w-3xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Chapters & Curriculum Index</h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 font-mono text-xs text-slate-700 whitespace-pre-line leading-loose">
              {book.tableOfContents ||
                `1. Introduction to Foundations\n2. Architecture & Setup\n3. Core Problem Solving Patterns\n4. Step-by-Step Implementation Workflows\n5. Real-World Case Studies\n6. Exam Questions & Placement Practice Sets`}
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="max-w-3xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Why Study With This Book?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(book.keyFeatures?.length > 0
                ? book.keyFeatures
                : [
                    'Easy to understand conversational language designed for Indian students',
                    'Over 100+ tested code snippets & diagrams',
                    'Includes semester exam questions & competitive entrance questions',
                    'Direct practice drills with solutions included',
                  ]
              ).map((feat: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-800 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8 max-w-3xl">
            {/* Reviews List */}
            <div className="space-y-4">
              {book.reviews && book.reviews.length > 0 ? (
                book.reviews.map((rev: any) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                          {rev.user?.profile?.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="font-bold text-slate-900 text-xs">
                          {rev.user?.profile?.fullName || 'Verified Reader'}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="font-bold text-xs text-slate-900">{rev.title}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No reviews yet for this title. Be the first to share feedback!</p>
              )}
            </div>

            {/* Submit a Review Form */}
            <div className="p-6 rounded-2xl bg-brand-50/40 border border-brand-200/60 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <span>Write a Student Review</span>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-amber-400 hover:scale-110 transition"
                      >
                        <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Review Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Invaluable resource for university exams!"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Detailed Feedback</label>
                  <textarea
                    rows={3}
                    placeholder="How did this eBook assist your learning and preparations?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Related Books */}
      {book.relatedBooks && book.relatedBooks.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900">Similar Educational eBooks</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {book.relatedBooks.map((relBook: any) => (
              <BookCard key={relBook.id} book={relBook} />
            ))}
          </div>
        </section>
      )}

      {/* Free Sample Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Free Sample Preview</span>
                <h3 className="font-bold text-sm truncate max-w-md">{book.title}</h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto space-y-6 bg-slate-50 flex-1">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="text-center pb-4 border-b">
                  <h4 className="text-xl font-bold text-slate-900">{book.title}</h4>
                  <p className="text-xs text-slate-500">Sample Extract • By {book.author?.fullName}</p>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                  <p className="font-semibold text-brand-600">Sample Page 1 / 3 — Chapter Overview:</p>
                  <p>
                    Educational excellence begins with clear conceptual foundations. This eBook simplifies intricate subject matter into modular, bite-sized lessons with hands-on practice.
                  </p>
                  <p className="italic text-slate-500">
                    "Buy the full edition to unlock all {book.totalPages} pages, full practice problems, and offline PDF download capabilities."
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-900">{formatINR(effectivePrice)}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    addToCart(book.id);
                  }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
                >
                  Buy Full eBook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
