import React from 'react';
import { BookOpen, ShieldCheck, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Our Vision & Purpose
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">About eBookHub</h1>
        <p className="text-base text-slate-600 leading-relaxed">
          eBookHub was established to democratize top-tier educational textbooks for Indian students. We eliminate traditional physical distribution markups and connect students directly with verified educators.
        </p>
      </div>

      {/* 3 Pillars (Matching Screen 6) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Quality Content</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every manuscript goes through our strict moderation review. We verify code snippets, factual references, syllabus compliance, and originality before publishing.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Trusted Authors</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We partner with respected professors, engineers, and competitive examination specialists who craft practical, exam-ready notes tailored to Indian curricula.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Affordable Learning</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            By operating purely digitally, textbooks on eBookHub cost up to 70% less than printed equivalents, making elite educational resources accessible to all.
          </p>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <p className="text-3xl sm:text-4xl font-extrabold text-brand-400">25,000+</p>
          <p className="text-xs text-slate-400 mt-1">Students Empowered</p>
        </div>
        <div>
          <p className="text-3xl sm:text-4xl font-extrabold text-brand-400">350+</p>
          <p className="text-xs text-slate-400 mt-1">Verified Authors</p>
        </div>
        <div>
          <p className="text-3xl sm:text-4xl font-extrabold text-brand-400">2,480+</p>
          <p className="text-xs text-slate-400 mt-1">Published eBooks</p>
        </div>
        <div>
          <p className="text-3xl sm:text-4xl font-extrabold text-brand-400">98.5%</p>
          <p className="text-xs text-slate-400 mt-1">Satisfaction Rate</p>
        </div>
      </div>
    </div>
  );
};
