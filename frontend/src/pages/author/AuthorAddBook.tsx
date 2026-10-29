import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookPlus, Upload, FileText, Image as ImageIcon, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export const AuthorAddBook: React.FC = () => {
  const navigate = useNavigate();
  const { toast, success, error } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [language, setLanguage] = useState('English');
  const [price, setPrice] = useState('249');
  const [discountPrice, setDiscountPrice] = useState('199');
  const [targetExam, setTargetExam] = useState('');
  const [educationalLevel, setEducationalLevel] = useState('Intermediate');
  const [tableOfContents, setTableOfContents] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [agreedCopyright, setAgreedCopyright] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get<any>('/categories');
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
          if (res.data.length > 0) setCategoryId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (submitForReview: boolean) => {
    if (!title || !description || !categoryId || !price) {
      toast('Please fill in title, description, category, and price.', 'error');
      return;
    }

    if (!agreedCopyright) {
      toast('Please confirm copyright ownership.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      formData.append('language', language);
      formData.append('price', price);
      if (discountPrice) formData.append('discountPrice', discountPrice);
      if (targetExam) formData.append('targetExam', targetExam);
      formData.append('educationalLevel', educationalLevel);
      if (tableOfContents) formData.append('tableOfContents', tableOfContents);
      if (keyFeatures) {
        const featuresArray = keyFeatures.split('\n').filter((f) => f.trim());
        featuresArray.forEach((f) => formData.append('keyFeatures', f));
      }
      formData.append('submitForReview', submitForReview.toString());

      if (coverFile) formData.append('cover', coverFile);
      if (pdfFile) formData.append('pdf', pdfFile);
      if (previewFile) formData.append('preview', previewFile);

      const res = await api.post<any>('/author/books', formData);
      if (res.success) {
        success(
          submitForReview
            ? 'Book successfully submitted for moderation review!'
            : 'Draft saved successfully.'
        );
        navigate('/author/books');
      }
    } catch (err: any) {
      error(err.message || 'Error submitting manuscript.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add New Educational Book</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit your curriculum guide, textbook, or solved notes for marketplace publication.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            1. Title & Classification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Book Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Python for Beginners"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Subtitle (Optional)</label>
              <input
                type="text"
                placeholder="e.g. From Zero to Idiomatic Python"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Book Description *</label>
            <textarea
              rows={4}
              required
              placeholder="Provide a comprehensive summary of modules, intended learning outcomes, and exam preparation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:border-author-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:border-author-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Bilingual">Bilingual</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Target Exam (Optional)</label>
              <input
                type="text"
                placeholder="e.g. UPSC, GATE, Placements"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            2. Pricing (in INR)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Original Price (₹) *</label>
              <input
                type="number"
                required
                placeholder="249"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
              />
              <span className="text-[10px] text-slate-400">Standard listing price in Rupees</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Discounted Selling Price (₹)</label>
              <input
                type="number"
                placeholder="199"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
              />
              <span className="text-[10px] text-slate-400">Effective student price if promotional discount active</span>
            </div>
          </div>
        </div>

        {/* Section 3: File Uploads */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            3. File Uploads (Cover Image, Full PDF, Sample Preview)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Cover Image */}
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 hover:border-author-400 transition">
              <ImageIcon className="w-8 h-8 text-author-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Cover Image</p>
              <p className="text-[10px] text-slate-400">PNG, JPG, SVG (Auto-generated if omitted)</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setCoverFile(e.target.files[0])}
                className="text-xs text-slate-500 w-full"
              />
              {coverFile && <p className="text-[10px] text-emerald-600 font-bold truncate">{coverFile.name}</p>}
            </div>

            {/* Full PDF File */}
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 hover:border-author-400 transition">
              <FileText className="w-8 h-8 text-brand-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Full Book PDF</p>
              <p className="text-[10px] text-slate-400">PDF up to 50MB (Auto-generated demo if omitted)</p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files && setPdfFile(e.target.files[0])}
                className="text-xs text-slate-500 w-full"
              />
              {pdfFile && <p className="text-[10px] text-emerald-600 font-bold truncate">{pdfFile.name}</p>}
            </div>

            {/* Sample Preview PDF */}
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 hover:border-author-400 transition">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Free Preview (Optional)</p>
              <p className="text-[10px] text-slate-400">Sample extract pages</p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files && setPreviewFile(e.target.files[0])}
                className="text-xs text-slate-500 w-full"
              />
              {previewFile && <p className="text-[10px] text-emerald-600 font-bold truncate">{previewFile.name}</p>}
            </div>
          </div>
        </div>

        {/* Section 4: Curriculum Details */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            4. Curriculum & Index
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Table of Contents</label>
            <textarea
              rows={3}
              placeholder="1. Introduction&#10;2. Syntax & Primitives&#10;3. Core Patterns..."
              value={tableOfContents}
              onChange={(e) => setTableOfContents(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-author-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Key Highlights (one per line)</label>
            <textarea
              rows={3}
              placeholder="Tested code samples&#10;Semester exam solutions&#10;Practice drills"
              value={keyFeatures}
              onChange={(e) => setKeyFeatures(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
            />
          </div>
        </div>

        {/* Copyright Declaration */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedCopyright}
              onChange={(e) => setAgreedCopyright(e.target.checked)}
              className="mt-0.5 rounded text-author-600 focus:ring-author-500"
            />
            <span className="leading-relaxed">
              I affirm that I am the author and sole copyright holder of this educational work. I understand that submitting plagiarized materials results in immediate application revocation.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 rounded-xl transition"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-author-600 hover:bg-author-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Moderation Review'}
          </button>
        </div>
      </div>
    </div>
  );
};
