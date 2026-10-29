import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Bookmark,
  BookmarkCheck,
  List,
  Download,
  ArrowLeft,
  Sun,
  Moon,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface OnlineReaderProps {
  bookId: string;
}

export const OnlineReader: React.FC<OnlineReaderProps> = ({ bookId }) => {
  const navigate = useNavigate();
  const { toast, success } = useToast();

  const [bookData, setBookData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(12);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load reader metadata & progress
  useEffect(() => {
    async function loadReader() {
      try {
        setIsLoading(true);
        const res = await api.get<any>(`/library/${bookId}`);
        if (res.success && res.data) {
          setBookData(res.data);
          setCurrentPage(res.data.currentPage || 1);
          setTotalPages(res.data.totalPages || 12);
          if (Array.isArray(res.data.bookmarks)) {
            setBookmarks(res.data.bookmarks.map((b: any) => b.pageNumber));
          }
        }
      } catch (err: any) {
        toast(err.message || 'Error loading eBook', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadReader();
  }, [bookId]);

  // Sync reading progress to server
  const saveProgress = async (page: number) => {
    try {
      await api.post(`/library/${bookId}/progress`, {
        currentPage: page,
        totalPages,
      });
    } catch (e) {
      // silent
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      saveProgress(newPage);
    }
  };

  const toggleBookmark = async () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks((prev) => prev.filter((p) => p !== currentPage));
      toast(`Bookmark removed for page ${currentPage}`, 'info');
    } else {
      setBookmarks((prev) => [...prev, currentPage]);
      try {
        await api.post(`/library/${bookId}/bookmarks`, { pageNumber: currentPage });
        success(`Bookmark added for page ${currentPage}`);
      } catch (e) {
        // silent
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const token = localStorage.getItem('ebookhub_token');
    const downloadUrl = `/api/library/${bookId}/download`;
    // Trigger download with auth token in URL or fetch blob
    fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${bookData?.slug || 'eBook'}-eBookHub.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        success('PDF download started!');
      })
      .catch((err) => {
        toast('Download authorization failed', 'error');
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mb-4"></div>
        <p className="text-sm font-medium text-slate-300">Decrypting & Loading Protected eBook...</p>
      </div>
    );
  }

  const isCurrentBookmarked = bookmarks.includes(currentPage);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-900'
      }`}
    >
      {/* Top Reader Toolbar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 text-white px-4 flex items-center justify-between gap-4 shrink-0 shadow-md">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/user/library')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Back to My Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="truncate">
            <h1 className="font-bold text-sm text-white truncate max-w-xs sm:max-w-md">
              {bookData?.title || 'eBook Reader'}
            </h1>
            <p className="text-[10px] text-slate-400 truncate">
              {bookData?.authorName} | Licensed Personal Copy
            </p>
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-xs font-semibold">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => handlePageChange(parseInt(e.target.value, 10))}
              className="w-10 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white focus:outline-none focus:border-brand-500"
            />
            <span className="text-slate-400">/ {totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools: Zoom, Bookmarks, Fullscreen, Download */}
        <div className="flex items-center gap-1.5">
          {/* Zoom In / Out */}
          <button
            onClick={() => setZoom((prev) => Math.max(50, prev - 15))}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 w-10 text-center hidden sm:inline">{zoom}%</span>
          <button
            onClick={() => setZoom((prev) => Math.min(200, prev + 15))}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Table of Contents Drawer Toggle */}
          <button
            onClick={() => setShowToc(!showToc)}
            className={`p-2 rounded-lg transition ${
              showToc ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Table of Contents"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg transition ${
              isCurrentBookmarked
                ? 'text-amber-400 bg-slate-800'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={isCurrentBookmarked ? 'Remove Bookmark' : 'Bookmark Page'}
          >
            {isCurrentBookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-amber-400 text-amber-400" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Dark / Light Reader Mode */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Reading Light/Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Download PDF button */}
          <button
            onClick={handleDownload}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl transition shadow-sm"
            title="Download Full PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Workspace Area (Sidebar Thumbnails + Page Display) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Thumbnails Strip */}
        {showThumbnails && (
          <aside className="w-48 bg-slate-900/90 border-r border-slate-800 p-3 overflow-y-auto hidden md:flex flex-col gap-3 shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Pages ({totalPages})
            </p>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isSelected = page === currentPage;
              const hasBookmark = bookmarks.includes(page);
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-full aspect-[3/4] rounded-lg border-2 text-left p-2 flex flex-col justify-between transition relative overflow-hidden ${
                    isSelected
                      ? 'border-brand-500 bg-slate-800 shadow-lg'
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">P. {page}</span>
                    {hasBookmark && <Bookmark className="w-3 h-3 fill-amber-400 text-amber-400" />}
                  </div>
                  <div className="space-y-1">
                    <div className="h-1 bg-slate-700/60 rounded-full w-4/5" />
                    <div className="h-1 bg-slate-700/40 rounded-full w-full" />
                    <div className="h-1 bg-slate-700/30 rounded-full w-3/4" />
                  </div>
                  <span className="text-[9px] text-slate-500 truncate">
                    {page === 1 ? 'Cover' : page === 2 ? 'Contents' : `Chapter ${page - 2}`}
                  </span>
                </button>
              );
            })}
          </aside>
        )}

        {/* Table of Contents Drawer Popover */}
        {showToc && (
          <div className="absolute top-2 left-52 z-30 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-600">Table of Contents</span>
              <button onClick={() => setShowToc(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                ✕
              </button>
            </div>
            <div className="space-y-1.5 max-h-80 overflow-y-auto text-xs">
              <button
                onClick={() => { handlePageChange(1); setShowToc(false); }}
                className="w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 flex justify-between"
              >
                <span>Title & Cover Page</span>
                <span className="text-slate-400">P. 1</span>
              </button>
              <button
                onClick={() => { handlePageChange(2); setShowToc(false); }}
                className="w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 flex justify-between font-medium text-brand-600"
              >
                <span>Table of Contents</span>
                <span className="text-slate-400">P. 2</span>
              </button>
              {Array.from({ length: Math.max(1, totalPages - 2) }, (_, i) => i + 1).map((ch) => (
                <button
                  key={ch}
                  onClick={() => { handlePageChange(ch + 2); setShowToc(false); }}
                  className="w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 flex justify-between text-slate-700"
                >
                  <span className="truncate">Chapter {ch}: Core Principles & Review</span>
                  <span className="text-slate-400">P. {ch + 2}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Center PDF Canvas / Document Viewport */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 md:p-8">
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className={`w-full max-w-3xl aspect-[1/1.414] rounded-xl shadow-2xl transition-all duration-150 p-8 md:p-12 flex flex-col justify-between border ${
              isDarkMode
                ? 'bg-slate-900 text-slate-100 border-slate-800'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            {/* Page Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 text-xs text-slate-400">
              <span className="font-semibold">{bookData?.title}</span>
              <span>eBookHub Academic Library</span>
            </div>

            {/* Page Body */}
            <div className="my-auto space-y-6">
              {currentPage === 1 ? (
                /* Cover Page */
                <div className="text-center space-y-6 py-12">
                  <div className="inline-block px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                    Official Edition
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {bookData?.title}
                  </h1>
                  <div className="w-16 h-1 bg-brand-600 mx-auto rounded-full" />
                  <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                    Authored by <span className="font-bold text-slate-900 dark:text-white">{bookData?.authorName}</span>
                  </p>
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 max-w-md mx-auto text-xs text-slate-500">
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      Licensed Educational Digital Copy
                    </p>
                    <p>Protected digital watermark registered to active eBookHub student account.</p>
                  </div>
                </div>
              ) : currentPage === 2 ? (
                /* Table of Contents */
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white pb-2 border-b">
                    Table of Contents
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed">
                    <div className="flex justify-between items-baseline border-b border-dotted pb-1">
                      <span className="font-medium">Chapter 1: Foundations and Overview</span>
                      <span className="text-slate-500">Page 3</span>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-dotted pb-1">
                      <span className="font-medium">Chapter 2: Core Architecture & Setup</span>
                      <span className="text-slate-500">Page 4</span>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-dotted pb-1">
                      <span className="font-medium">Chapter 3: Deep Dive & Practical Workflows</span>
                      <span className="text-slate-500">Page 5</span>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-dotted pb-1">
                      <span className="font-medium">Chapter 4: Advanced Concepts & Optimization</span>
                      <span className="text-slate-500">Page 6</span>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-dotted pb-1">
                      <span className="font-medium">Chapter 5: Real-World Case Studies & Exam Prep</span>
                      <span className="text-slate-500">Page 7</span>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-dotted pb-1">
                      <span className="font-medium">Chapter 6: Comprehensive Review & Practice Questions</span>
                      <span className="text-slate-500">Page 8</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Chapter Content */
                <div className="space-y-4 text-justify leading-relaxed">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                      Module {currentPage - 2}
                    </span>
                    <span className="text-xs text-slate-400">Chapter {currentPage - 2}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {bookData?.title} — Section {currentPage - 2}
                  </h2>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Welcome to Chapter {currentPage - 2}. In this core unit, we establish critical concepts required for mastering educational curricula, competitive entrance rounds, and industry engineering standards.
                  </p>
                  <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200/50 text-sm space-y-2">
                    <p className="font-bold text-brand-900 dark:text-brand-300">Core Learning Objectives:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      <li>Understand key structural principles and problem formulations.</li>
                      <li>Learn step-by-step algorithmic and conceptual problem-solving patterns.</li>
                      <li>Review benchmark past exam questions and model solutions.</li>
                    </ul>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Systematic revision and regular self-evaluation are foundational for cracking competitive exams. Test your understanding by attempting the chapter review exercises provided at the end of each module.
                  </p>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">
                    // Concept Snippet {currentPage - 2}: High Efficiency Implementation<br/>
                    def solve_optimal_step(problem_input):<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;result = [x * 2 for x in problem_input if x &gt; 0]<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;return result
                  </div>
                </div>
              )}
            </div>

            {/* Page Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs text-slate-400">
              <span>eBookHub Digital Watermark: Protected Educational Content</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
