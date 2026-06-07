'use client';
import React from 'react';
import { Laptop, RotateCcw, Wrench, Plus, CheckCircle, Archive, TrendingUp, Package, Users, AlertTriangle } from 'lucide-react';
import useSWR from 'swr';
import { apiFetch } from '../../lib/api';

const fetcher = (url: string) => apiFetch(url);

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function activityIcon(type: string) {
  if (type === 'checkout') return <Laptop size={15} />;
  if (type === 'checkin') return <RotateCcw size={15} />;
  if (type === 'maintenance') return <Wrench size={15} />;
  if (type === 'added') return <Plus size={15} />;
  if (type === 'retired') return <Archive size={15} />;
  return <CheckCircle size={15} />;
}

const SkeletonDashboard = () => (
  <div className="dashboard-container">
    <header className="page-header">
      <div className="skeleton-box" style={{ width: '250px', height: '32px', marginBottom: '8px', borderRadius: '4px' }}></div>
      <div className="skeleton-box" style={{ width: '400px', height: '16px', borderRadius: '4px' }}></div>
    </header>
    <div className="stats-grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="stat-card card">
          <div className="skeleton-box" style={{ width: '36px', height: '36px', borderRadius: '8px', marginBottom: '6px' }}></div>
          <div className="skeleton-box" style={{ width: '60px', height: '32px', borderRadius: '4px', marginBottom: '6px' }}></div>
          <div className="skeleton-box" style={{ width: '100px', height: '14px', borderRadius: '4px' }}></div>
        </div>
      ))}
    </div>
    <div className="dashboard-grid">
      <section className="activity-section card">
        <div className="skeleton-box" style={{ width: '150px', height: '24px', marginBottom: '16px', borderRadius: '4px' }}></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div className="skeleton-box" style={{ width: '30px', height: '30px', borderRadius: '8px' }}></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="skeleton-box" style={{ width: '120px', height: '14px', borderRadius: '4px' }}></div>
              <div className="skeleton-box" style={{ width: '80px', height: '12px', borderRadius: '4px' }}></div>
            </div>
          </div>
        ))}
      </section>
      <section className="breakdown-section card">
        <div className="skeleton-box" style={{ width: '150px', height: '24px', marginBottom: '16px', borderRadius: '4px' }}></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
            <div className="skeleton-box" style={{ width: '60px', height: '14px', borderRadius: '4px' }}></div>
            <div className="skeleton-box" style={{ flex: 1, height: '6px', borderRadius: '4px' }}></div>
            <div className="skeleton-box" style={{ width: '20px', height: '14px', borderRadius: '4px' }}></div>
          </div>
        ))}
      </section>
    </div>
  </div>
);

export default function Dashboard() {
  const { data: summary, error } = useSWR('/assets/summary', fetcher, { refreshInterval: 5000 });

  if (error) return <div style={{ padding: 40, color: 'red' }}>Failed to load dashboard</div>;
  if (!summary) return <SkeletonDashboard />;

  const { stats, recentActivities, assetsByType } = summary;
  const maxCount = Math.max(...(assetsByType || []).map((x: any) => x.count), 1);

  const cards = [
    { label: 'Total Assets', value: stats.total, status: 'primary', icon: <Package size={20} /> },
    { label: 'Assigned', value: stats.assigned, status: 'success', icon: <Users size={20} /> },
    { label: 'In Maintenance', value: stats.maintenance, status: 'warning', icon: <AlertTriangle size={20} /> },
    { label: 'Utilization', value: `${stats.utilization}%`, status: 'info', icon: <TrendingUp size={20} /> },
  ];

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1 className="page-title">Operational Overview</h1>
        <p className="page-subtitle">Real-time insights into your office inventory and asset lifecycle.</p>
      </header>

      <div className="stats-grid">
        {cards.map((card, i) => (
          <div key={i} className={`stat-card card stat-${card.status}`}>
            <div className="stat-icon-row">
              <span className="stat-icon">{card.icon}</span>
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="activity-section card">
          <h2 className="section-title">Recent Activity</h2>
          <ul className="activity-list">
            {recentActivities.map((act: any) => (
              <li key={act.id} className="activity-item">
                <span className={`activity-icon act-${act.type}`}>
                  {activityIcon(act.type)}
                </span>
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

        <section className="breakdown-section card">
          <h2 className="section-title">Asset Breakdown</h2>
          <ul className="breakdown-list">
            {assetsByType.map((item: any) => (
              <li key={item.type} className="breakdown-item">
                <span className="breakdown-type">{item.type}</span>
                <div className="breakdown-bar-wrap">
                  <div
                    className="breakdown-bar"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
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
        .dashboard-container {
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 1200px;
          min-height: calc(100vh - 80px);
        }
        .page-header { margin-bottom: 4px; }
        .page-title { font-size: 1.75rem; font-weight: 800; margin: 0; }
        .page-subtitle { color: var(--text-secondary); margin-top: 6px; font-size: 0.9rem; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
        .stat-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 20px 22px;
          border-radius: 12px;
        }
        .stat-icon-row { margin-bottom: 4px; }
        .stat-icon {
          display: inline-flex;
          padding: 8px;
          border-radius: 8px;
          background: rgba(var(--icon-bg, 88, 166, 255), 0.1);
        }
        .stat-primary .stat-icon { color: var(--accent-primary); }
        .stat-success .stat-icon { color: #3fb950; }
        .stat-warning .stat-icon { color: #d29922; }
        .stat-info .stat-icon { color: #58a6ff; }
        .stat-primary .stat-value { color: var(--accent-primary); }
        .stat-success .stat-value { color: #3fb950; }
        .stat-warning .stat-value { color: #d29922; }
        .stat-info .stat-value { color: #58a6ff; }
        .stat-value { font-size: 2rem; font-weight: 800; line-height: 1; }
        .stat-label { font-size: 0.78rem; color: var(--text-secondary); font-weight: 500; }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }
        .section-title { font-size: 1rem; font-weight: 700; margin: 0 0 16px; }
        .activity-section, .breakdown-section { padding: 22px; border-radius: 12px; }
        .activity-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
        .activity-item { display: flex; align-items: center; gap: 12px; }
        .activity-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .act-added { background: rgba(63,185,80,0.15); color: #3fb950; }
        .act-checkout { background: rgba(88,166,255,0.15); color: var(--accent-primary); }
        .act-checkin { background: rgba(210,153,34,0.15); color: #d29922; }
        .act-maintenance { background: rgba(255,123,120,0.15); color: #ff7b78; }
        .act-retired { background: rgba(139,148,158,0.15); color: #8b949e; }
        .activity-details { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .activity-name { font-weight: 600; font-size: 0.88rem; }
        .activity-tag { font-size: 0.73rem; color: var(--accent-primary); }
        .activity-user { font-size: 0.73rem; color: var(--text-secondary); }
        .activity-time { font-size: 0.73rem; color: var(--text-muted); flex-shrink: 0; }
        .breakdown-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
        .breakdown-item { display: flex; align-items: center; gap: 10px; }
        .breakdown-type { width: 80px; font-size: 0.82rem; flex-shrink: 0; color: var(--text-secondary); }
        .breakdown-bar-wrap { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
        .breakdown-bar { height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); border-radius: 4px; transition: width 0.5s ease; }
        .breakdown-count { width: 24px; text-align: right; font-size: 0.82rem; font-weight: 700; flex-shrink: 0; }
        .utilization-block {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .utilization-block strong { font-size: 1.4rem; color: var(--accent-primary); }
      `}
      </style>
    </div>
  );
}
