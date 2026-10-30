import React, { useState, useEffect } from 'react';
import { Users, Search, Ban, CheckCircle2, Shield, Eye, X, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export const AdminUsers: React.FC = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [confirmSuspendUser, setConfirmSuspendUser] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  async function loadUsers() {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await api.get<any>(`/admin/users?${params.toString()}`);
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      setIsUpdating(true);
      const res = await api.put<any>(`/admin/users/${user.id}/status`, { status: nextStatus });
      if (res.success) {
        success(`User status changed to ${nextStatus}.`);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
        setConfirmSuspendUser(null);
      }
    } catch (err: any) {
      error(err.message || 'Status update failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-7 h-7 text-purple-600" />
          <span>User Management</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View all registered students, publishing authors, and administrators. Inspect accounts and enforce governance.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Role selector */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'USER', 'AUTHOR', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  roleFilter === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r === 'USER' ? 'Students' : r === 'AUTHOR' ? 'Authors' : 'Admins'}
              </button>
            ))}
          </div>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Suspended / Blocked</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-5">
                    <div>
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'AUTHOR'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {u.role === 'USER' ? 'Student' : u.role === 'AUTHOR' ? 'Author' : 'Admin'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">{formatDate(u.createdAt)}</td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>View User</span>
                      </button>

                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => {
                            if (u.status === 'ACTIVE') {
                              setConfirmSuspendUser(u);
                            } else {
                              handleToggleStatus(u);
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <Ban className="w-3 h-3" />
                          <span>{u.status === 'ACTIVE' ? 'Suspend User' : 'Reactivate User'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-extrabold text-slate-900 text-base">User Account Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-bold text-slate-900">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-bold text-slate-900">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Assigned Role:</span>
                <span className="font-bold text-purple-700">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Account Status:</span>
                <span className={`font-bold ${selectedUser.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedUser.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Account Created:</span>
                <span className="text-slate-800">{formatDate(selectedUser.createdAt)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">User ID:</span>
                <span className="font-mono text-[10px] text-slate-600">{selectedUser.id}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Confirmation Modal */}
      {confirmSuspendUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Confirm Account Suspension</h3>
                <p className="text-xs text-slate-500">Suspending {confirmSuspendUser.email}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to suspend this user? They will be locked out of login, book reader, and platform services until reactivated by an administrator.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmSuspendUser(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleStatus(confirmSuspendUser)}
                disabled={isUpdating}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
              >
                {isUpdating ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
