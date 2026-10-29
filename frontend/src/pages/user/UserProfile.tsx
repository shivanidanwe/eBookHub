import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Globe, BookOpen, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const UserProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast, success } = useToast();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [interests, setInterests] = useState('Computer Science, AI, UPSC');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get<any>('/user/profile');
        if (res.success && res.data) {
          setFullName(res.data.fullName || user?.fullName || '');
          setMobile(res.data.mobile || '');
          setPreferredLanguage(res.data.preferredLanguage || 'English');
          if (Array.isArray(res.data.interests)) {
            setInterests(res.data.interests.join(', '));
          }
          setBio(res.data.bio || '');
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.put<any>('/user/profile', {
        fullName,
        mobile,
        preferredLanguage,
        interests: interests.split(',').map((s) => s.trim()).filter(Boolean),
        bio,
      });
      if (res.success) {
        success('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err: any) {
      toast(err.message || 'Could not update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-6">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
        <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 font-bold text-2xl flex items-center justify-center border-2 border-brand-200">
          {fullName.charAt(0) || user?.email.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{fullName || 'Student'}</h1>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <span className="inline-block mt-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            Registered Student / Reader
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address (Immutable)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Mobile Phone</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500 font-medium"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Bilingual">Bilingual (English & Hindi)</option>
              <option value="Marathi">Marathi</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Learning Interests & Target Exams (comma separated)</label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Personal Bio / Education Goal</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us what you are preparing for..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </form>
    </div>
  );
};
