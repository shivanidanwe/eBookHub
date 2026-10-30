import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookPlus, Upload, FileText, Image as ImageIcon, CheckCircle2, ChevronDown, ChevronUp, Save, Send } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export const AuthorAddBook: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  // Core required fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [language, setLanguage] = useState('English');
  const [price, setPrice] = useState('249');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [agreedCopyright, setAgreedCopyright] = useState(true);

  // Optional fields grouped under Additional Information
  const [showAdditional, setShowAdditional] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const [discountPrice, setDiscountPrice] = useState('199');
  const [targetExam, setTargetExam] = useState('');
  const [educationalLevel, setEducationalLevel] = useState('Intermediate');
  const [tableOfContents, setTableOfContents] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [previewFile, setPreviewFile] = useState<File | null>(null);

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
    if (!title.trim()) {
      error('Book Title is required.');
      return;
    }
    if (!description.trim()) {
      error('Book Description is required.');
      return;
    }
    if (!categoryId) {
      error('Please select a Category.');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      error('Please specify a valid Price in Rupees.');
      return;
    }
    if (!agreedCopyright) {
      error('Please confirm copyright ownership before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('categoryId', categoryId);
      formData.append('language', language);
      formData.append('price', price);
      formData.append('submitForReview', submitForReview.toString());

      // Optional additional information
      if (subtitle.trim()) formData.append('subtitle', subtitle.trim());
      if (discountPrice && parseFloat(discountPrice) > 0) formData.append('discountPrice', discountPrice);
      if (targetExam.trim()) formData.append('targetExam', targetExam.trim());
      if (educationalLevel) formData.append('educationalLevel', educationalLevel);
      if (tableOfContents.trim()) formData.append('tableOfContents', tableOfContents.trim());
      if (keyFeatures.trim()) {
        const featuresArray = keyFeatures.split('\n').map((f) => f.trim()).filter(Boolean);
        featuresArray.forEach((f) => formData.append('keyFeatures', f));
      }

      if (coverFile) formData.append('cover', coverFile);
      if (pdfFile) formData.append('pdf', pdfFile);
      if (previewFile) formData.append('preview', previewFile);

      const res = await api.post<any>('/author/books', formData);
      if (res.success) {
        success(
          submitForReview
            ? 'Book submitted for administrator approval!'
            : 'Book draft saved successfully.'
        );
        navigate('/author/books');
      }
    } catch (err: any) {
      error(err.message || 'Error submitting book');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BookPlus className="w-7 h-7 text-orange-600" />
          <span>Add New Educational eBook</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload and submit your curriculum guide, textbook, or solved notes for marketplace publication.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Core Required Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Required Book Information
          </h2>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Book Title</span>
              <span className="text-rose-500 text-[11px]">* Required</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Artificial Intelligence and Machine Learning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Description</span>
              <span className="text-rose-500 text-[11px]">* Required</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Comprehensive summary of syllabus topics, targeted university curriculum, and solved problem sets..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Category, Language, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Category</span>
                <span className="text-rose-500 text-[11px]">* Required</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
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
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Bilingual">Bilingual</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Price (₹)</span>
                <span className="text-rose-500 text-[11px]">* Required</span>
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="249"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* File Uploads: Cover Image & Full PDF */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Cover Image */}
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 hover:border-orange-400 transition bg-slate-50/50">
              <ImageIcon className="w-7 h-7 text-orange-500 mx-auto" />
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

            {/* Full PDF */}
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 hover:border-orange-400 transition bg-slate-50/50">
              <FileText className="w-7 h-7 text-blue-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Full Book PDF</p>
              <p className="text-[10px] text-slate-400">Digital PDF file (Auto-generated demo if omitted)</p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files && setPdfFile(e.target.files[0])}
                className="text-xs text-slate-500 w-full"
              />
              {pdfFile && <p className="text-[10px] text-emerald-600 font-bold truncate">{pdfFile.name}</p>}
            </div>
          </div>

          {/* Copyright Confirmation */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-1">
            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedCopyright}
                onChange={(e) => setAgreedCopyright(e.target.checked)}
                className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="leading-relaxed font-medium">
                I affirm that I am the author and sole copyright holder of this educational work. I agree to publish under eBookHub platform terms.
              </span>
            </label>
          </div>
        </div>

        {/* Optional Collapsible Group: Additional Information */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdditional(!showAdditional)}
            className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition text-xs font-bold text-slate-800"
          >
            <span>Additional Information (Optional)</span>
            {showAdditional ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {showAdditional && (
            <div className="p-5 space-y-4 bg-white border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. Comprehensive Semester Guide"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Discounted Selling Price (₹)</label>
                  <input
                    type="number"
                    placeholder="199"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Competitive Exam</label>
                  <input
                    type="text"
                    placeholder="e.g. UPSC, GATE, University Exams"
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Educational Level</label>
                  <select
                    value={educationalLevel}
                    onChange={(e) => setEducationalLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                  >
                    <option value="Beginner">Beginner / Undergraduate</option>
                    <option value="Intermediate">Intermediate / Degree</option>
                    <option value="Advanced">Advanced / Postgraduate</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Table of Contents</label>
                <textarea
                  rows={3}
                  placeholder="Module 1: Foundations&#10;Module 2: Practical Applications&#10;Module 3: Solved Questions"
                  value={tableOfContents}
                  onChange={(e) => setTableOfContents(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Sample Preview PDF (Optional)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files && setPreviewFile(e.target.files[0])}
                  className="text-xs text-slate-500 w-full"
                />
                {previewFile && <p className="text-[10px] text-emerald-600 font-bold truncate">{previewFile.name}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Save Draft & Submit for Approval */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4 text-slate-400" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit for Approval'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
