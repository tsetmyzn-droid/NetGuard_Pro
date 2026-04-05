import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const DashboardCard: React.FC<CardProps> = ({ children, className, title, subtitle, icon }) => {
  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md dark:hover:shadow-none",
      className
    )}>
      {(title || icon) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {icon && (
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300">
              {icon}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
