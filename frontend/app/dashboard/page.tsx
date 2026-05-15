'use client';
import React from 'react';
import { Laptop, RotateCcw, Wrench, Plus, CheckCircle, Archive } from 'lucide-react';
import { getDashboardSummary } from '../../lib/mockStore';

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function activityIcon(type: string) {
  if (type === 'checkout') return <Laptop size={16} />;
  if (type === 'checkin') return <RotateCcw size={16} />;
  if (type === 'maintenance') return <Wrench size={16} />;
  if (type === 'added') return <Plus size={16} />;
  if (type === 'retired') return <Archive size={16} />;
  return <CheckCircle size={16} />;
}

export default function Dashboard() {
  const summary = getDashboardSummary();
  const { stats, recentActivities, assetsByType } = summary;

  const maxCount = Math.max(...assetsByType.map(x => x.count), 1);

  const cards = [
    { label: 'Total Assets', value: stats.total, status: 'primary' },
    { label: 'Assigned', value: stats.assigned, status: 'success' },
    { label: 'In Maintenance', value: stats.maintenance, status: 'warning' },
    { label: 'Utilization', value: `${stats.utilization}%`, status: 'info' },
  ];

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1 className="page-title">Operational Overview</h1>
        <p className="page-subtitle">Real-time insights into your office inventory and asset lifecycle.</p>
      </header>

      <section className="stats-grid">
        {cards.map((card, i) => (
          <div key={i} className={`stat-card glass stat-${card.status}`}>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </section>

      <div className="dashboard-grid">
        <section className="glass activity-section">
          <h2 className="section-title">Recent Activity</h2>
          <ul className="activity-list">
            {recentActivities.map((act: any) => (
              <li key={act.id} className="activity-item">
                <span className={`activity-icon act-${act.type}`}>{activityIcon(act.type)}</span>
                <div className="activity-details">
                  <span className="activity-name">{act.assetName}</span>
                  <span className="activity-tag">{act.tagId}</span>
                  <span className="activity-user">{act.user}</span>
                </div>
                <span className="activity-time">{timeAgo(act.timestamp)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass breakdown-section">
          <h2 className="section-title">Asset Breakdown</h2>
          <ul className="breakdown-list">
            {assetsByType.map((item: any) => (
              <li key={item.type} className="breakdown-item">
                <span className="breakdown-type">{item.type}</span>
                <div className="breakdown-bar-wrap">
                  <div className="breakdown-bar" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                </div>
                <span className="breakdown-count">{item.count}</span>
              </li>
            ))}
          </ul>
          <div className="utilization-block">
            <span>Utilization Rate</span>
            <strong>{stats.utilization}%</strong>
          </div>
        </section>
      </div>

      <style>{`
        .dashboard-container { padding: 24px; display: flex; flex-direction: column; gap: 24px; }
        .page-header { margin-bottom: 8px; }
        .page-title { font-size: 1.6rem; font-weight: 800; margin: 0; }
        .page-subtitle { color: var(--text-secondary); margin-top: 4px; font-size: 0.9rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .stat-card { display: flex; flex-direction: column; gap: 8px; padding: 20px; border-radius: 12px; }
        .stat-primary .stat-value { color: var(--accent-primary); }
        .stat-success .stat-value { color: #3fb950; }
        .stat-warning .stat-value { color: #d29922; }
        .stat-info .stat-value { color: #58a6ff; }
        .stat-value { font-size: 1.8rem; font-weight: 800; line-height: 1; }
        .stat-label { font-size: 0.78rem; color: var(--text-secondary); }
        .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr; } }
        .section-title { font-size: 1rem; font-weight: 700; margin: 0 0 16px; }
        .activity-section, .breakdown-section { padding: 20px; border-radius: 12px; }
        .activity-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
        .activity-item { display: flex; align-items: center; gap: 12px; }
        .activity-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: rgba(255,255,255,0.06); flex-shrink: 0; }
        .act-added { color: #3fb950; } .act-checkout { color: var(--accent-primary); } .act-checkin { color: #d29922; } .act-maintenance { color: #ff7b78; } .act-retired { color: #8b949e; }
        .activity-details { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .activity-name { font-weight: 600; font-size: 0.88rem; }
        .activity-tag { font-size: 0.75rem; color: var(--accent-primary); }
        .activity-user { font-size: 0.75rem; color: var(--text-secondary); }
        .activity-time { font-size: 0.75rem; color: var(--text-muted); flex-shrink: 0; }
        .breakdown-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .breakdown-item { display: flex; align-items: center; gap: 10px; }
        .breakdown-type { width: 80px; font-size: 0.82rem; flex-shrink: 0; }
        .breakdown-bar-wrap { flex: 1; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
        .breakdown-bar { height: 100%; background: var(--accent-primary); border-radius: 4px; transition: width 0.4s; }
        .breakdown-count { width: 24px; text-align: right; font-size: 0.82rem; font-weight: 700; flex-shrink: 0; }
        .utilization-block { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
        .utilization-block strong { font-size: 1.4rem; color: var(--accent-primary); }
      `}</style>
    </div>
  );
}
