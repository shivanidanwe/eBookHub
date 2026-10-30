import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, RefreshCw, Eye, X, Filter, User } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export default function AdminAuditLogs() {
  const { error } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/admin/audit-logs');
      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.action?.toLowerCase().includes(q) ||
      l.entityType?.toLowerCase().includes(q) ||
      l.actor?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-purple-600" />
            <span>Platform Security & Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all administrative interventions, moderation decisions, and financial operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search action or actor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 shadow-xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
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
          No audit log entries found matching search.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Entity Type</th>
                  <th className="py-3.5 px-4">Entity ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition font-mono">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-full text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <p className="font-semibold text-slate-900">{log.actor?.profile?.fullName || 'Administrator'}</p>
                      <p className="text-[11px] text-slate-400">{log.actor?.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-700">
                      {log.entityType || 'Platform'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {log.entityId ? `${log.entityId.slice(0, 12)}...` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-500 whitespace-nowrap text-[11px]">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-sans whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Log Inspect Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-extrabold text-slate-900 text-base">
                Audit Record: {selectedLog.action}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Actor:</span>
                <span className="font-bold text-slate-900">{selectedLog.actor?.email} ({selectedLog.actorRole})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Target Entity:</span>
                <span className="font-mono font-bold text-slate-800">{selectedLog.entityType} ({selectedLog.entityId || 'N/A'})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-800">{new Date(selectedLog.createdAt).toISOString()}</span>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Metadata / Audit Payload:</span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.metadata || 'No additional payload stored.'}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
