import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { 
  Users, CheckCircle, XCircle, Clock, Eye, AlertCircle, 
  ExternalLink, FileText, Check, X, ShieldAlert 
} from 'lucide-react';
import Badge from '../../components/common/Badge';

interface Application {
  id: string;
  userId: string;
  fullName: string;
  penName?: string;
  email: string;
  phone?: string;
  bio?: string;
  expertise?: string;
  portfolioUrl?: string;
  sampleWorkUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
  user: {
    email: string;
    createdAt: string;
  };
}

export default function AdminAuthorApplications() {
  const { addToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/author-applications');
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch author applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReview = async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    try {
      setProcessingId(id);
      const res = await api.post(`/admin/author-applications/${id}/review`, {
        action,
        reason: reason || undefined
      });

      if (res.success) {
        addToast(
          action === 'APPROVE' 
            ? 'Author application approved! User role elevated to Author.' 
            : 'Author application rejected.',
          'success'
        );
        setRejectModalOpen(false);
        setRejectReason('');
        setSelectedApp(null);
        fetchApplications();
      }
    } catch (err: any) {
      addToast(err.message || 'Action failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (filter === 'ALL') return true;
    return app.status === filter;
  });

  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" /> Author Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review identity, credentials, and publish approval requests for aspiring authors.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingCount} Pending Review</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(['PENDING', 'ALL', 'APPROVED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === tab
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' ? 'All Applications' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className="ml-2 text-xs opacity-80">
              ({applications.filter(a => tab === 'ALL' ? true : a.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading applications...
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">No applications found</h3>
          <p className="text-sm text-slate-500 mt-1">There are currently no author applications under this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Expertise</th>
                  <th className="py-3 px-4">Applied On</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">{app.fullName}</div>
                      <div className="text-xs text-slate-500">{app.email}</div>
                      {app.penName && (
                        <div className="text-xs text-purple-600 mt-0.5">Pen Name: {app.penName}</div>
                      )}
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-medium text-slate-800 truncate">{app.expertise || 'General'}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{app.bio || 'No bio provided'}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          app.status === 'APPROVED' ? 'success' : app.status === 'PENDING' ? 'warning' : 'danger'
                        }
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>

                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleReview(app.id, 'APPROVE')}
                            disabled={processingId === app.id}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setRejectModalOpen(true);
                            }}
                            disabled={processingId === app.id}
                            className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedApp && !rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Application Details</h3>
              <button 
                onClick={() => setSelectedApp(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Applicant</span>
                  <p className="font-semibold text-slate-800">{selectedApp.fullName}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Email</span>
                  <p className="text-slate-700">{selectedApp.email}</p>
                </div>
                {selectedApp.phone && (
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Phone</span>
                    <p className="text-slate-700">{selectedApp.phone}</p>
                  </div>
                )}
                {selectedApp.penName && (
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Pen Name</span>
                    <p className="text-slate-700">{selectedApp.penName}</p>
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Expertise & Specialization</span>
                <p className="text-slate-800 font-medium mt-1">{selectedApp.expertise || 'Not specified'}</p>
              </div>

              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Biography / Background</span>
                <p className="text-slate-700 mt-1 whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedApp.bio || 'No biography submitted.'}
                </p>
              </div>

              {(selectedApp.portfolioUrl || selectedApp.sampleWorkUrl) && (
                <div className="space-y-2">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Links & References</span>
                  {selectedApp.portfolioUrl && (
                    <div>
                      <a 
                        href={selectedApp.portfolioUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-purple-600 hover:text-purple-700 flex items-center gap-1.5 text-xs font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Portfolio: {selectedApp.portfolioUrl}
                      </a>
                    </div>
                  )}
                  {selectedApp.sampleWorkUrl && (
                    <div>
                      <a 
                        href={selectedApp.sampleWorkUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-purple-600 hover:text-purple-700 flex items-center gap-1.5 text-xs font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" /> Sample Work: {selectedApp.sampleWorkUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {selectedApp.adminNotes && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-xs text-amber-800 uppercase font-semibold">Admin Feedback / Notes</span>
                  <p className="text-sm text-amber-900 mt-0.5">{selectedApp.adminNotes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedApp.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      setRejectModalOpen(true);
                    }}
                    className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-sm font-medium"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleReview(selectedApp.id, 'APPROVE')}
                    disabled={processingId === selectedApp.id}
                    className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-medium disabled:opacity-50"
                  >
                    Approve Application
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation & Reason Modal */}
      {rejectModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Reject Application</h3>
            </div>
            <p className="text-sm text-slate-600">
              Please provide feedback explaining why the application for <span className="font-semibold">{selectedApp.fullName}</span> is being rejected. This will be sent to the applicant.
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Rejection Reason / Guidance
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Please provide published educational credentials or a valid portfolio sample."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(selectedApp.id, 'REJECT', rejectReason)}
                disabled={processingId === selectedApp.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
