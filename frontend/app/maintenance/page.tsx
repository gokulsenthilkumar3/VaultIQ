"use client";

import React from 'react';
import useSWR from 'swr';
import { apiFetch } from '../../lib/api';

export default function MaintenancePage() {
  const { data: queue, error, isLoading } = useSWR('/maintenance/triage', apiFetch);

  if (error) {
    return (
      <div className="maintenance-container">
        <header>
          <h1 className="page-title">Predictive Maintenance</h1>
        </header>
        <div className="card glass error-card">
          <h3 className="error-title">Connection Error</h3>
          <p className="error-desc">Failed to load the triage queue. Please ensure backend services are responsive.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="maintenance-container">
        <header>
          <h1 className="page-title skeleton-text">Predictive Maintenance</h1>
          <p className="page-subtitle skeleton-text">Initializing Diagnostics...</p>
        </header>
        <div className="maintenance-grid">
          <section className="card glass queue-section skeleton-box skeleton-section"></section>
          <section className="card glass health-insights skeleton-box skeleton-section"></section>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-container">
      <header>
        <h1 className="page-title">Predictive Maintenance</h1>
        <p className="page-subtitle">AI-driven hardware health monitoring and triage queue.</p>
      </header>

      <div className="maintenance-grid">
        <section className="card glass queue-section">
          <h3 className="section-title">Active Triage Queue</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Asset</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {queue?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="mono">{item.id.substring(0, 8)}</td>
                    <td className="bold">{item.asset.modelName}</td>
                    <td>{item.issueType}</td>
                    <td>
                      <span className={`badge ${item.status.toLowerCase()}`}>{item.status.replace('_', ' ')}</span>
                    </td>
                    <td>
                      <button className="btn-text">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card glass health-insights">
          <h3 className="section-title">Health Insights</h3>
          <div className="insight-card">
            <div className="insight-icon">🤖</div>
            <div className="insight-content">
              <h4>System Health Index</h4>
              <p>Overall hardware reliability is at <span className="highlight">92%</span>. Thermal issues in Rack A-12 are the primary performance bottleneck.</p>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .maintenance-container {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .maintenance-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .error-card { padding: 40px; text-align: center; }
        .error-title { color: var(--accent-danger); }
        .error-desc { color: var(--text-secondary); }
        .skeleton-section { height: 300px; }

        .section-title {
          margin-bottom: 24px;
          font-weight: 700;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        th {
          padding: 16px;
          color: var(--text-secondary);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid var(--border-color);
        }

        td {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9rem;
        }

        .mono { font-family: monospace; color: var(--accent-primary); }
        .bold { font-weight: 600; }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .badge.critical { background: rgba(218, 54, 51, 0.1); color: var(--accent-danger); }
        .badge.high { background: rgba(210, 153, 34, 0.1); color: var(--accent-warning); }
        .badge.low { background: rgba(88, 166, 255, 0.1); color: var(--accent-primary); }

        .btn-text {
          background: transparent;
          border: none;
          color: var(--accent-primary);
          font-weight: 600;
          cursor: pointer;
        }

        .health-insights {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .insight-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .insight-icon { font-size: 2rem; }
        .insight-content h4 { margin-bottom: 8px; }
        .insight-content p { font-size: 0.9rem; color: var(--text-secondary); }
        .highlight { color: var(--accent-success); font-weight: 700; }
      `}</style>
    </div>
  );
}
