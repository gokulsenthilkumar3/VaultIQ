"use client";

import React from 'react';
import useSWR from 'swr';
import { apiFetch } from '../../lib/api';

export default function Dashboard() {
  const { data, error, isLoading } = useSWR('/assets/summary', apiFetch);

  if (error || !data) return <div className="error-card glass">Failed to load operational data.</div>;
  if (isLoading) return <div className="loading">Initializing Neural Dashboard...</div>;

  const summary = data as any;

  const stats = [
    { label: 'Total Assets', value: summary.stats.total.toLocaleString(), trend: '+0%', status: 'primary' },
    { label: 'Assigned', value: summary.stats.assigned.toLocaleString(), trend: `${Math.round(summary.stats.utilization)}%`, status: 'success' },
    { label: 'In Maintenance', value: summary.stats.maintenance.toLocaleString(), trend: '0%', status: 'warning' },
    { label: 'Monthly Depreciation', value: '$0', trend: '+0%', status: 'danger' },
  ];

  const recentActivities = summary.recentActivities;

  return (
    <div className="dashboard-container">
      <header>
        <h1 className="page-title">Operational Overview</h1>
        <p className="page-subtitle">Real-time insights into your office inventory and asset lifecycle.</p>
      </header>

      <section className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="card stat-card animate-fade-in" data-index={i}>
            <p className="stat-label">{stat.label}</p>
            <div className="stat-value-row">
              <h2 className="stat-value">{stat.value}</h2>
              <span className="stat-trend" data-status={stat.status}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="dashboard-content-grid">
        <section className="card activity-section glass">
          <h3 className="section-title">Recent Activity</h3>
          <div className="activity-list">
            {recentActivities.map((activity: any, i: number) => (
              <div key={i} className="activity-item">
                <span className="activity-icon">{activity.icon}</span>
                <div className="activity-details">
                  <p className="activity-text"><strong>{activity.user}</strong> {activity.action}</p>
                  <p className="activity-time">{new Date(activity.time).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card maintenance-section glass">
          <h3 className="section-title">Maintenance Queue</h3>
          <div className="empty-state">
            <p>View predictive diagnostics & triage.</p>
            <a href="/maintenance" className="btn btn-primary btn-maintenance">View Schedule</a>
          </div>
        </section>
      </div>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .page-title {
          font-size: var(--text-xl, 2rem);
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }

        .page-subtitle {
          color: var(--text-secondary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-card[data-index="0"] { animation-delay: 0s; }
        .stat-card[data-index="1"] { animation-delay: 0.1s; }
        .stat-card[data-index="2"] { animation-delay: 0.2s; }
        .stat-card[data-index="3"] { animation-delay: 0.3s; }

        .stat-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-value-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }

        .stat-value {
          font-size: var(--text-2xl, 2.25rem);
          font-weight: 700;
        }

        .stat-trend {
          font-size: 0.9rem;
          font-weight: 700;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }

        .stat-trend[data-status="primary"] { color: var(--accent-primary); }
        .stat-trend[data-status="success"] { color: var(--accent-success); }
        .stat-trend[data-status="warning"] { color: var(--accent-warning); }
        .stat-trend[data-status="danger"] { color: var(--accent-danger); }

        .dashboard-content-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
        }

        .section-title {
          font-size: 1.25rem;
          margin-bottom: 24px;
          font-weight: 700;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .activity-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .activity-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .activity-icon {
          font-size: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .activity-text {
          font-size: 0.95rem;
        }

        .activity-time {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-secondary);
        }

        .btn-maintenance {
          margin-top: 16px;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
