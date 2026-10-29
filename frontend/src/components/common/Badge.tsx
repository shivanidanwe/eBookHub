import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'author' | 'admin' | 'success' | 'warning' | 'danger' | 'slate';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', className }) => {
  const variantStyles = {
    primary: 'bg-brand-50 text-brand-700 border-brand-200',
    author: 'bg-author-50 text-author-700 border-author-200',
    admin: 'bg-admin-50 text-admin-700 border-admin-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;

