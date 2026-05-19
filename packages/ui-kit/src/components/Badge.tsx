import React from 'react';
import { WorkItemType, SLAPriority, TicketStatus, WorkItemStatus } from '@nexflow/shared-types';

export type BadgeVariant =
  | 'default'
  | 'epic'
  | 'story'
  | 'task'
  | 'bug'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'sla-safe'
  | 'sla-warning'
  | 'sla-danger'
  | 'sla-breached'
  | 'status-new'
  | 'status-approved'
  | 'status-committed'
  | 'status-done'
  | 'status-removed';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-overlay text-white/70 border-surface-border',
  epic: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  story: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  task: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  bug: 'bg-red-500/15 text-red-300 border-red-500/30',
  critical: 'bg-red-600/20 text-red-300 border-red-500/40',
  high: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  medium: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  low: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  'sla-safe': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'sla-warning': 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse-sla',
  'sla-danger': 'bg-red-500/15 text-red-300 border-red-500/30 animate-pulse-sla',
  'sla-breached': 'bg-red-900/30 text-red-200 border-red-700/50',
  'status-new': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'status-approved': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'status-committed': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'status-done': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'status-removed': 'bg-surface-overlay text-white/40 border-surface-border',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, dot, className = '' }) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
};

// ─── Convenience helpers ───────────────────────────────────────

export const WorkItemTypeBadge: React.FC<{ type: WorkItemType }> = ({ type }) => {
  const map: Record<WorkItemType, BadgeVariant> = {
    [WorkItemType.EPIC]: 'epic',
    [WorkItemType.STORY]: 'story',
    [WorkItemType.TASK]: 'task',
    [WorkItemType.BUG]: 'bug',
  };
  return <Badge variant={map[type]}>{type}</Badge>;
};

export const PriorityBadge: React.FC<{ priority: SLAPriority }> = ({ priority }) => {
  const map: Record<SLAPriority, BadgeVariant> = {
    [SLAPriority.CRITICAL]: 'critical',
    [SLAPriority.HIGH]: 'high',
    [SLAPriority.MEDIUM]: 'medium',
    [SLAPriority.LOW]: 'low',
  };
  return <Badge variant={map[priority]} dot>{priority}</Badge>;
};

export const StatusBadge: React.FC<{ status: WorkItemStatus | TicketStatus }> = ({ status }) => {
  const map: Partial<Record<string, BadgeVariant>> = {
    NEW: 'status-new',
    APPROVED: 'status-approved',
    COMMITTED: 'status-committed',
    DONE: 'status-done',
    REMOVED: 'status-removed',
    OPEN: 'status-new',
    IN_PROGRESS: 'status-committed',
    RESOLVED: 'status-done',
    CLOSED: 'status-removed',
    BREACHED: 'sla-breached',
  };
  return <Badge variant={map[status] ?? 'default'}>{status.replace('_', ' ')}</Badge>;
};
