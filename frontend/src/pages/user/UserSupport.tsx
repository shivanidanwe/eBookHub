import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Send, MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export const UserSupport: React.FC = () => {
  const { toast, success } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('DOWNLOADS');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/support/tickets');
        if (res.success && Array.isArray(res.data)) {
          setTickets(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      const res = await api.post<any>('/support/tickets', {
        subject: subject.trim(),
        category,
        message: message.trim(),
      });
      if (res.success) {
        success('Support ticket created! Our team will respond shortly.');
        setTickets([res.data, ...tickets]);
        setShowCreate(false);
        setSubject('');
        setMessage('');
      }
    } catch (err: any) {
      toast(err.message || 'Error creating ticket', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Help & Support</h1>
          <p className="text-xs text-slate-500 mt-0.5">Contact customer support and track your resolution tickets.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateTicket} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Create New Support Inquiry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Inquiry Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Issue downloading PDF on mobile"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="DOWNLOADS">PDF Download & Access</option>
                <option value="PAYMENTS">Payment & Invoices</option>
                <option value="READER">Online Reader Technical</option>
                <option value="GENERAL">General Inquiries</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Detailed Message</label>
            <textarea
              rows={3}
              required
              placeholder="Describe your question or issue..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      )}

      {/* Tickets List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No open support tickets.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-900">#{t.ticketNumber}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-100 text-brand-800'
                }`}>
                  {t.status}
                </span>
              </div>
              <p className="font-bold text-sm text-slate-900">{t.subject}</p>
              <p className="text-xs text-slate-500">Last updated: {formatDate(t.updatedAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
