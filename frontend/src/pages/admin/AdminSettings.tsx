import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Mail, Globe, Bell } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const { success, error } = useToast();
  const [siteName, setSiteName] = useState('eBookHub India');
  const [supportEmail, setSupportEmail] = useState('support@ebookhub.com');
  const [announcement, setAnnouncement] = useState("India's Premier Educational eBook Marketplace");
  const [maintenanceMode, setMaintenanceMode] = useState('false');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/admin/settings');
        if (res.success && res.data) {
          if (res.data.site_name) setSiteName(res.data.site_name);
          if (res.data.support_email) setSupportEmail(res.data.support_email);
          if (res.data.platform_announcement) setAnnouncement(res.data.platform_announcement);
          if (res.data.maintenance_mode) setMaintenanceMode(res.data.maintenance_mode);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.put('/admin/settings', {
        site_name: siteName,
        support_email: supportEmail,
        platform_announcement: announcement,
        maintenance_mode: maintenanceMode,
      });

      if (res.success) {
        success('Platform settings successfully saved.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading platform settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-purple-600" />
          <span>Platform Settings & Governance</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Global branding, customer support channels, announcement banner, and system parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-600" />
            <span>General Platform Parameters</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Platform Brand Name *</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Customer Support Email *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Top Micro Bar Announcement Banner</label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode === 'true'}
                onChange={(e) => setMaintenanceMode(e.target.checked ? 'true' : 'false')}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span>Enable Scheduled Maintenance Mode Notice</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Platform Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
