import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: 'brand' | 'author' | 'admin' | 'emerald';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'brand',
  className,
}) => {
  const iconBgStyles = {
    brand: 'bg-brand-50 text-brand-600',
    author: 'bg-author-50 text-author-600',
    admin: 'bg-admin-50 text-admin-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className={cn('bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between gap-4 transition hover:shadow-md', className)}>
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 text-xs">
            {trend && (
              <span className={cn('font-semibold', trend.isPositive ? 'text-emerald-600' : 'text-slate-500')}>
                {trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
      <div className={cn('p-3 rounded-xl shrink-0', iconBgStyles[accentColor])}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
