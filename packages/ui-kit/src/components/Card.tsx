import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glass = false,
  padding = 'md',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={[
        'rounded-xl border border-surface-border',
        glass
          ? 'bg-glass backdrop-blur-glass'
          : 'bg-surface-elevated',
        paddingClasses[padding],
        hoverable || onClick
          ? 'cursor-pointer hover:border-brand-500/50 hover:bg-surface-overlay transition-all duration-200'
          : '',
        'animate-fade-in',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, description, action, className = '' }) => (
  <div className={`flex items-start justify-between mb-4 ${className}`}>
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {description && <p className="text-xs text-white/50 mt-0.5">{description}</p>}
    </div>
    {action && <div className="shrink-0 ml-4">{action}</div>}
  </div>
);

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: string; trend: 'up' | 'down' | 'neutral' };
  icon?: React.ReactNode;
  accent?: 'brand' | 'green' | 'amber' | 'red';
}

const accentClasses = {
  brand: 'text-brand-400 bg-brand-500/10',
  green: 'text-emerald-400 bg-emerald-500/10',
  amber: 'text-amber-400 bg-amber-500/10',
  red: 'text-red-400 bg-red-500/10',
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, delta, icon, accent = 'brand' }) => (
  <Card glass>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-white/50 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {delta && (
          <p className={`text-xs mt-1 ${delta.trend === 'up' ? 'text-emerald-400' : delta.trend === 'down' ? 'text-red-400' : 'text-white/50'}`}>
            {delta.trend === 'up' ? '↑' : delta.trend === 'down' ? '↓' : '→'} {delta.value}
          </p>
        )}
      </div>
      {icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentClasses[accent]}`}>
          {icon}
        </div>
      )}
    </div>
  </Card>
);
