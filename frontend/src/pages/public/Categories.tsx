import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code,
  Cpu,
  Settings,
  GraduationCap,
  Calculator,
  Briefcase,
  Activity,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../lib/api';

const ICON_MAP: Record<string, any> = {
  Code,
  Cpu,
  Settings,
  GraduationCap,
  Calculator,
  Briefcase,
  Activity,
  BookOpen,
};

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/categories');
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">All Educational Disciplines</h1>
        <p className="text-sm text-slate-500">
          Find specialized textbooks, lecture supplements, and exam guides categorized by Indian university curricula and competitive exams.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || BookOpen;
            return (
              <Link
                key={cat.id}
                to={`/books?category=${cat.slug}`}
                className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-500 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description || 'Comprehensive curriculum study material and guides.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-brand-600">
                  <span>{cat.bookCount || 0} Titles Available</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
