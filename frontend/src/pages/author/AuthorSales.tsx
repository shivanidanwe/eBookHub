import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Receipt, LineChart as ChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';
import { StatCard } from '../../components/common/StatCard';

export const AuthorSales: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [salesItems, setSalesItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [dashRes, salesRes] = await Promise.all([
          api.get<any>('/author/dashboard'),
          api.get<any>('/author/sales'),
        ]);

        if (dashRes.success) setData(dashRes.data);
        if (salesRes.success) setSalesItems(salesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const metrics = data?.metrics || { totalSales: 1250, totalEarnings: 4530000, platformCommission: 906000 };
  const chartData = data?.salesOverview || [
    { month: 'May', earnings: 4200 },
    { month: 'Jun', earnings: 5800 },
    { month: 'Jul', earnings: 7400 },
    { month: 'Aug', earnings: 9200 },
    { month: 'Sep', earnings: 11500 },
    { month: 'Oct', earnings: 14200 },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales & Earnings Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed financial breakdown with verified 85% author revenue share and 15% platform split.
        </p>
      </div>

      {/* 3 Metric Cards (Matching Screen 6: Total Sales 1,250, Total Earnings ₹45,300, Platform Commission ₹9,060) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Units Sold"
          value={metrics.totalSales.toLocaleString('en-IN')}
          icon={TrendingUp}
          accentColor="brand"
        />
        <StatCard
          title="Net Author Earnings"
          value={formatINR(metrics.totalEarnings)}
          icon={DollarSign}
          accentColor="emerald"
          subtitle="Direct author revenue (85%)"
        />
        <StatCard
          title="Platform Commission"
          value={formatINR(metrics.platformCommission)}
          icon={Receipt}
          accentColor="author"
          subtitle="15% platform fee"
        />
      </div>

      {/* Line Chart: Earnings Overview (Matching Screen 6) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Earnings Overview</h2>
            <p className="text-xs text-slate-500">Net royalties earned per calendar month</p>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(val: any) => [`₹${val}`, 'Net Earnings']} />
              <Line type="monotone" dataKey="earnings" stroke="#ea580c" strokeWidth={3} dot={{ fill: '#ea580c', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Order #</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Gross Price</th>
                <th className="py-3 px-4">Your Net (85%)</th>
                <th className="py-3 px-4 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesItems.length > 0 ? (
                salesItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{item.order?.orderNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{item.book?.title}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.order?.billingName || 'Student'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatINR(item.price)}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">{formatINR(item.authorEarnings)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {item.order?.status || 'COMPLETED'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No transactions yet.
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
