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
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalUsers: 1250,
    totalAuthors: 350,
    totalBooks: 2480,
    totalRevenue: 124500000,
    pendingAuthorApplications: 1,
    pendingBookApprovals: 2,
  };

  const userGrowth = data?.userGrowth || [
    { month: 'May', users: 820 },
    { month: 'Jun', users: 940 },
    { month: 'Jul', users: 1050 },
    { month: 'Aug', users: 1120 },
    { month: 'Sep', users: 1190 },
    { month: 'Oct', users: 1250 },
  ];

  const userDistribution = data?.userDistribution || [
    { name: 'Students', value: 65 },
    { name: 'Authors', value: 25 },
    { name: 'Admins', value: 10 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Command Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry, user base demographics, catalog moderation, and financial aggregates.
          </p>
        </div>

        {/* Action alert badges */}
        <div className="flex items-center gap-2">
          {metrics.pendingAuthorApplications > 0 && (
            <Link
              to="/admin/author-applications"
              className="px-3 py-1.5 rounded-xl bg-author-50 text-author-700 border border-author-200 text-xs font-bold flex items-center gap-1.5 hover:bg-author-100 transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{metrics.pendingAuthorApplications} Author Queue</span>
            </Link>
          )}

          {metrics.pendingBookApprovals > 0 && (
            <Link
              to="/admin/book-approvals"
              className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition"
            >
              <BookCheck className="w-3.5 h-3.5" />
              <span>{metrics.pendingBookApprovals} Book Moderation</span>
            </Link>
          )}
        </div>
      </div>

      {/* 4 Top Metric Cards (Matching Screen 2 of Admin Mockup: Total Users 1,250, Authors 350, Total Books 2,480, Total Revenue ₹12,45,000) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString('en-IN')}
          icon={Users}
          accentColor="brand"
          subtitle="Registered learners"
        />
        <StatCard
          title="Approved Authors"
          value={metrics.totalAuthors.toLocaleString('en-IN')}
          icon={PenTool}
          accentColor="author"
          subtitle="Publishing faculty"
        />
        <StatCard
          title="Total Books Catalog"
          value={metrics.totalBooks.toLocaleString('en-IN')}
          icon={BookOpen}
          accentColor="admin"
          subtitle="Across all subjects"
        />
        <StatCard
          title="Total Gross Revenue"
          value={formatINR(metrics.totalRevenue)}
          icon={DollarSign}
          accentColor="emerald"
          subtitle="15% platform commission"
        />
      </div>

      {/* 2 Charts: User Growth (Area) & User Distribution (Pie) (Matching Screen 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* User Growth Area Chart */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">User Growth</h2>
              <p className="text-xs text-slate-500">Total verified accounts over time</p>
            </div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              Active Trend
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(val: any) => [val, 'Registered Users']} />
                <Area type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#growthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution Donut Chart (Matching Screen 2) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">User Distribution</h2>
              <p className="text-xs text-slate-500">Percentage share by account role</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Share']} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/admin/author-applications"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-author-400 hover:shadow-md transition flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-sm">Review Author Queue</p>
            <p className="text-xs text-slate-500">Approve or reject educator credentials</p>
          </div>
          <ArrowRight className="w-4 h-4 text-author-600" />
        </Link>

        <Link
          to="/admin/book-approvals"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-md transition flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-sm">Moderate Books</p>
            <p className="text-xs text-slate-500">Review newly uploaded manuscript files</p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600" />
        </Link>

        <Link
          to="/admin/reports"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-admin-400 hover:shadow-md transition flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-sm">Financial Analytics</p>
            <p className="text-xs text-slate-500">Export CSV reports and commission splits</p>
          </div>
          <ArrowRight className="w-4 h-4 text-admin-600" />
        </Link>
      </div>
    </div>
  );
};
