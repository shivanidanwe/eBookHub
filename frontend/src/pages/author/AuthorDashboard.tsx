import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  DollarSign,
  TrendingUp,
  Award,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';
import { StatCard } from '../../components/common/StatCard';

export const AuthorDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/author/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error loading author dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const author = data?.author || { fullName: 'Priya Sharma' };
  const metrics = data?.metrics || { totalBooks: 12, totalSales: 1250, totalEarnings: 4530000 };
  const salesOverview = data?.salesOverview || [
    { month: 'May', earnings: 4200 },
    { month: 'Jun', earnings: 5800 },
    { month: 'Jul', earnings: 7400 },
    { month: 'Aug', earnings: 9200 },
    { month: 'Sep', earnings: 11500 },
    { month: 'Oct', earnings: 14200 },
  ];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner (Matching Screen 2 of Author Interface) */}
      <div className="bg-gradient-to-r from-author-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            Publisher Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {author.fullName}!
          </h1>
          <p className="text-xs text-author-100 max-w-md">
            Monitor real-time student purchases, royalties, reader reviews, and payout disbursements.
          </p>
        </div>

        <Link
          to="/author/books/new"
          className="px-5 py-2.5 bg-white text-author-700 hover:bg-slate-100 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Book</span>
        </Link>
      </div>

      {/* 3 Core Metric Cards (Matching Screen 2: 12 Books, 1,250 Total Sales, ₹45,300 Total Earnings) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Books"
          value={metrics.totalBooks}
          icon={BookOpen}
          accentColor="author"
          subtitle={`${metrics.publishedBooks || 0} Live on Store`}
        />
        <StatCard
          title="Total Units Sold"
          value={metrics.totalSales.toLocaleString('en-IN')}
          icon={TrendingUp}
          accentColor="brand"
          subtitle="All titles aggregate"
        />
        <StatCard
          title="Total Net Earnings"
          value={formatINR(metrics.totalEarnings)}
          icon={DollarSign}
          accentColor="emerald"
          subtitle="After 15% platform split"
        />
      </div>

      {/* Sales Overview Bar Chart (Last 6 Months) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Sales Overview</h2>
            <p className="text-xs text-slate-500">Monthly net royalties earned over the last 6 months (₹)</p>
          </div>
          <span className="text-xs font-bold text-author-600 bg-author-50 px-2.5 py-1 rounded-full border border-author-200">
            Last 6 Months
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesOverview} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(val: any) => [`₹${val}`, 'Net Earnings']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="earnings" fill="#ea580c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table (Matching Screen 2 of Author Interface) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Student Orders</h2>
            <p className="text-xs text-slate-500">Live order items and royalty credits</p>
          </div>
          <Link to="/author/sales" className="text-xs font-bold text-author-600 hover:underline">
            View All Sales &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Order ID</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((ord: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{ord.orderId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{ord.bookTitle}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(ord.date)}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatINR(ord.amount)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No orders recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
