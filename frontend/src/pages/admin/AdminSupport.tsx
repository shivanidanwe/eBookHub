import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, CheckCircle2, Clock, Eye, X, MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export default function AdminSupport() {
  const { success, error } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/admin/support');
      if (res.success && Array.isArray(res.data)) {
        setTickets(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await api.put(`/admin/support/${id}`, { status: nextStatus });
      if (res.success) {
        success(`Ticket status updated to ${nextStatus}.`);
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
        );
        if (selectedTicket && selectedTicket.id === id) {
          setSelectedTicket({ ...selectedTicket, status: nextStatus });
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to update ticket');
    }
  };

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.user?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-purple-600" />
            <span>Support & Helpdesk Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve student and author inquiries, handle licensing disputes, and manage customer tickets.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No support tickets found.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Ticket #</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{t.user?.profile?.fullName || 'User'}</p>
                      <p className="text-[11px] text-slate-400">{t.user?.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{t.subject}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                          t.status === 'RESOLVED' || t.status === 'CLOSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Details & Update Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500">Ticket #{selectedTicket.ticketNumber} • {selectedTicket.user?.email}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-700">Messages:</span>
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((m: any) => (
                    <div key={m.id} className="p-2 bg-white rounded border border-slate-200 text-slate-700">
                      <p className="text-[11px] font-bold text-slate-500">{m.senderRole}:</p>
                      <p>{m.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">Initial ticket inquiry received.</p>
                )}
              </div>

              <div className="space-y-1 pt-2">
                <span className="font-bold text-slate-700">Update Ticket Status:</span>
                <div className="flex gap-2 pt-1">
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedTicket.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedTicket.status === st
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
