import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Percent,
  Wallet,
  ShoppingBag,
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const author = data?.author || { fullName: 'Author' };
  const metrics = data?.metrics || {
    totalBooks: 0,
    publishedBooks: 0,
    pendingApprovals: 0,
    totalSales: 0,
    grossSales: 0,
    platformCommission: 0,
    totalEarnings: 0,
    availableBalance: 0,
  };
  const salesOverview = data?.salesOverview || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner - Author Orange Theme */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            Author & Publisher Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {author.fullName}!
          </h1>
          <p className="text-xs text-orange-100 max-w-md">
            Publish educational content, review live reader royalties, and request bank disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/author/books/new"
            className="px-5 py-2.5 bg-white text-orange-700 hover:bg-slate-100 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </Link>
          <Link
            to="/author/payouts"
            className="px-4 py-2.5 bg-orange-500/40 hover:bg-orange-500/60 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4" />
            <span>Request Payout</span>
          </Link>
        </div>
      </div>

      {/* 8 Required Author Metrics Cards */}
      <div>
        <div className="pb-3 flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Catalog & Sales Telemetry
          </h2>
          <span className="text-[11px] text-slate-500">Live Database Figures</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* 1. Total Books */}
          <StatCard
            title="Total Books"
            value={metrics.totalBooks}
            icon={BookOpen}
            accentColor="author"
            subtitle="All titles uploaded"
          />
          {/* 2. Published Books */}
          <StatCard
            title="Published Books"
            value={metrics.publishedBooks || 0}
            icon={CheckCircle2}
            accentColor="emerald"
            subtitle="Live on public store"
          />
          {/* 3. Pending Approvals */}
          <StatCard
            title="Pending Approvals"
            value={metrics.pendingApprovals || 0}
            icon={Clock}
            accentColor="brand"
            subtitle="Under admin review"
          />
          {/* 4. Books Sold */}
          <StatCard
            title="Books Sold"
            value={metrics.totalSales || 0}
            icon={ShoppingBag}
            accentColor="author"
            subtitle="Purchased units"
          />
          {/* 5. Gross Sales */}
          <StatCard
            title="Gross Sales"
            value={formatINR(metrics.grossSales || 0)}
            icon={TrendingUp}
            accentColor="brand"
            subtitle="Total student spends"
          />
          {/* 6. Platform Commission */}
          <StatCard
            title="Platform Commission"
            value={formatINR(metrics.platformCommission || 0)}
            icon={Percent}
            accentColor="admin"
            subtitle="Flat 15% platform fee"
          />
          {/* 7. Net Earnings */}
          <StatCard
            title="Net Earnings"
            value={formatINR(metrics.totalEarnings || 0)}
            icon={DollarSign}
            accentColor="emerald"
            subtitle="85% direct author split"
          />
          {/* 8. Available Balance */}
          <StatCard
            title="Available Balance"
            value={formatINR(metrics.availableBalance || 0)}
            icon={Wallet}
            accentColor="author"
            subtitle="Eligible for withdrawal"
          />
        </div>
      </div>

      {/* Sales Overview Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Sales & Royalties Overview</h2>
            <p className="text-xs text-slate-500">Monthly net earnings generated across all published titles (₹)</p>
          </div>
          <Link
            to="/author/earnings"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 transition"
          >
            View Earnings Breakdown &rarr;
          </Link>
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

      {/* Recent Student Orders */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Student Orders</h2>
            <p className="text-xs text-slate-500">Live order purchases and royalty credits</p>
          </div>
          <Link to="/author/sales" className="text-xs font-bold text-orange-600 hover:underline">
            View All Sales &rarr;
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
            No sales recorded yet. Once students purchase your books, order items will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.orderId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{ord.bookTitle}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(ord.date)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatINR(ord.amount)}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
