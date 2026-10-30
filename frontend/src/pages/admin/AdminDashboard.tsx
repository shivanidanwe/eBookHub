import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  PenTool,
  BookOpen,
  DollarSign,
  UserCheck,
  BookCheck,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Package,
  CheckCircle2,
  Clock,
  Receipt,
  Percent,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import { StatCard } from '../../components/common/StatCard';

const PIE_COLORS = ['#2563eb', '#ea580c', '#9333ea'];

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/admin/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalUsers: 0,
    totalAuthors: 0,
    pendingAuthorApplications: 0,
    totalBooks: 0,
    pendingBookApprovals: 0,
    totalOrders: 0,
    successfulPayments: 0,
    platformRevenue: 0,
    pendingPayouts: 0,
  };

  const userGrowth = data?.userGrowth || [];
  const userDistribution = data?.userDistribution || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-purple-600" />
            <span>Platform Governance Console</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time platform telemetry, catalog moderation queues, and verified financial aggregates.
          </p>
        </div>

        {/* Action alert badges */}
        <div className="flex items-center gap-2">
          {metrics.pendingAuthorApplications > 0 && (
            <Link
              to="/admin/author-applications"
              className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold flex items-center gap-1.5 hover:bg-orange-100 transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>{metrics.pendingAuthorApplications} Author Queue</span>
            </Link>
          )}

          {metrics.pendingBookApprovals > 0 && (
            <Link
              to="/admin/book-approvals"
              className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition"
            >
              <BookCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>{metrics.pendingBookApprovals} Book Moderation</span>
            </Link>
          )}

          {metrics.pendingPayouts > 0 && (
            <Link
              to="/admin/payouts"
              className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-100 transition"
            >
              <Receipt className="w-3.5 h-3.5 text-purple-600" />
              <span>{metrics.pendingPayouts} Payouts</span>
            </Link>
          )}
        </div>
      </div>

      {/* 9 Required Admin Metrics */}
      <div>
        <div className="pb-3 flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Platform Metrics Overview
          </h2>
          <span className="text-[11px] text-slate-400 font-semibold">Live Database Records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Total Users */}
          <StatCard
            title="Total Users"
            value={metrics.totalUsers}
            icon={Users}
            accentColor="brand"
            subtitle="Registered learner accounts"
          />

          {/* 2. Total Authors */}
          <StatCard
            title="Total Authors"
            value={metrics.totalAuthors}
            icon={PenTool}
            accentColor="author"
            subtitle="Approved publishing faculty"
          />

          {/* 3. Pending Applications */}
          <StatCard
            title="Pending Applications"
            value={metrics.pendingAuthorApplications}
            icon={UserCheck}
            accentColor="author"
            subtitle="Author review queue"
          />

          {/* 4. Total Books */}
          <StatCard
            title="Total Books"
            value={metrics.totalBooks}
            icon={BookOpen}
            accentColor="admin"
            subtitle="Across all curriculum subjects"
          />

          {/* 5. Pending Book Approvals */}
          <StatCard
            title="Pending Book Approvals"
            value={metrics.pendingBookApprovals}
            icon={BookCheck}
            accentColor="brand"
            subtitle="Manuscripts awaiting moderation"
          />

          {/* 6. Total Orders */}
          <StatCard
            title="Total Orders"
            value={metrics.totalOrders}
            icon={Package}
            accentColor="emerald"
            subtitle="Completed learner checkouts"
          />

          {/* 7. Successful Payments */}
          <StatCard
            title="Successful Payments"
            value={metrics.successfulPayments || 0}
            icon={CheckCircle2}
            accentColor="emerald"
            subtitle="Verified gateway charges"
          />

          {/* 8. Platform Revenue */}
          <StatCard
            title="Platform Revenue"
            value={formatINR(metrics.platformRevenue || 0)}
            icon={Percent}
            accentColor="admin"
            subtitle="Retained 15% marketplace commission"
          />

          {/* 9. Pending Payouts */}
          <StatCard
            title="Pending Payouts"
            value={metrics.pendingPayouts || 0}
            icon={Receipt}
            accentColor="author"
            subtitle="Author withdrawal queue"
          />
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">User Growth Telemetry</h2>
              <p className="text-xs text-slate-500">Cumulative accounts onboarded over recent months</p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Real Aggregates
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="users" stroke="#9333ea" strokeWidth={2.5} fillOpacity={1} fill="url(#userGrowthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution Pie (1 col) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Platform Demographics</h2>
            <p className="text-xs text-slate-500">Breakdown by authenticated roles</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Students: Blue</span>
            <span>Authors: Orange</span>
            <span>Admins: Purple</span>
          </div>
        </div>
      </div>
    </div>
  );
};
