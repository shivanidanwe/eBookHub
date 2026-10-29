import React, { useState, useEffect } from 'react';
import { Users, Search, Ban, CheckCircle2, Shield, Eye } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export const AdminUsers: React.FC = () => {
  const { toast, success, error } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      const res = await api.put<any>(`/admin/users/${userId}/status`, { status: nextStatus });
      if (res.success) {
        success(`User status changed to ${nextStatus}.`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (err: any) {
      error(err.message || 'Status update failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View all registered students, publishing authors, and system administrators.
        </p>
      </div>

      {/* Filters (Matching Screen 3 of Mockup) */}
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
            <option value="BLOCKED">Blocked</option>
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
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-admin-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Table (Matching Screen 3 of Admin Interface) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
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
                          ? 'bg-admin-100 text-admin-800'
                          : u.role === 'AUTHOR'
                          ? 'bg-author-100 text-author-800'
                          : 'bg-brand-100 text-brand-800'
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

                  <td className="py-3.5 px-5 text-right">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => toggleUserStatus(u.id, u.status)}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                          u.status === 'ACTIVE'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
