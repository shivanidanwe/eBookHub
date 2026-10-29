import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, Bell } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export const UserSettings: React.FC = () => {
  const { toast, success, error } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      toast('New passwords do not match', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      const res = await api.put('/user/security/password', {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      error(err.message || 'Could not change password');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Security & Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your credentials, sessions, and notification preferences.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 max-w-xl">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <KeyRound className="w-5 h-5 text-brand-600" />
          <h2 className="text-base font-bold text-slate-900">Change Account Password</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Current Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">New Password (min 6 chars)</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
          >
            {isUpdating ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
