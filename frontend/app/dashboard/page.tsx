'use client';

import React from 'react';
import useSWR from 'swr';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import {
  Laptop,
  RotateCcw,
  Wrench,
  Plus,
  CheckCircle,
  Archive,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Sparkles,
  Info,
  Activity,
  Shield,
  ArrowRight,
} from 'lucide-react';
import DigitalTwin from '../../components/DigitalTwin';

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
  if (type === 'checkout') return <Laptop size={14} />;
  if (type === 'checkin') return <RotateCcw size={14} />;
  if (type === 'maintenance') return <Wrench size={14} />;
  if (type === 'added') return <Plus size={14} />;
  if (type === 'retired') return <Archive size={14} />;
  return <CheckCircle size={14} />;
}

const SkeletonDashboard = () => (
  <div className="mission-control-container">
    <div className="skeleton-box" style={{ width: '280px', height: '36px', marginBottom: '8px' }} />
    <div className="skeleton-box" style={{ width: '450px', height: '18px', marginBottom: '24px' }} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
          <div className="skeleton-box" style={{ height: '180px', borderRadius: '16px' }} />
          <div className="skeleton-box" style={{ height: '180px', borderRadius: '16px' }} />
        </div>
        <div className="skeleton-box" style={{ height: '360px', borderRadius: '16px' }} />
      </div>
      <div className="skeleton-box" style={{ height: '580px', borderRadius: '16px' }} />
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, error } = useSWR('/assets/summary', fetcher, { refreshInterval: 5000 });

  if (error) {
    return (
      <div className="mission-control-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '80vh', display: 'flex' }}>
        <div className="card-premium" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(248, 81, 73, 0.1)', borderRadius: '50%', color: 'var(--accent-danger)' }}>
            <AlertTriangle size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>Connection Failed</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
            Unable to reach VaultIQ Core Services. Please ensure the backend server and PostgreSQL database are running and accessible.
          </p>
          <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', color: '#ff7b78', fontFamily: 'monospace' }}>
            {error?.message || 'Network Error: Connection refused'}
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return <SkeletonDashboard />;

  const { stats, recentActivities, assetsByType } = summary;

  // Extract counts for quick-status-grid
  const total = stats.total || 0;
  const assigned = stats.assigned || 0;
  const maintenance = stats.maintenance || 0;
  const available = total - assigned - maintenance;

  return (
    <div className="mission-control-container">
      {/* Dashboard Top Header */}
      <header className="mission-control-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800 }}>
            Good Morning, {user?.fullName?.split(' ')[0] || 'Gokul'} 👋
          </h1>
          <div className="header-meta">
            <span className="pulse-dot" />
            <span>VaultIQ Engine Live</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-premium-secondary" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Activity size={14} /> System Health
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="dashboard-layout-grid">
        {/* Main Column */}
        <div className="dashboard-main-strip">
          {/* Health Score & Status overview */}
          <div className="health-summary-row">
            {/* Health dial */}
            <div className="health-score-card card-premium">
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '12px' }}>Organization Health</span>
              <div className="health-radial-wrap">
                <svg width="110" height="110" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--accent-success)"
                    strokeDasharray="98, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="health-percentage">98%</div>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>All systems performing within spec</span>
            </div>

            {/* Quick Status Cards */}
            <div className="quick-status-grid">
              <div className="quick-status-card card-premium">
                <div className="status-card-header">
                  <span>ACTIVE</span>
                  <Users size={14} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div className="status-card-val active">{assigned}</div>
              </div>
              <div className="quick-status-card card-premium">
                <div className="status-card-header">
                  <span>AVAILABLE</span>
                  <Package size={14} style={{ color: 'var(--accent-success)' }} />
                </div>
                <div className="status-card-val" style={{ color: 'var(--accent-success)' }}>{available}</div>
              </div>
              <div className="quick-status-card card-premium">
                <div className="status-card-header">
                  <span>CRITICAL</span>
                  <AlertTriangle size={14} style={{ color: 'var(--accent-danger)' }} />
                </div>
                <div className="status-card-val critical">{maintenance}</div>
              </div>
            </div>
          </div>

          {/* Interactive 3D Digital Twin Office Preview */}
          <section className="interactive-twin-section card-premium">
            <div className="interactive-twin-header">
              <h2 className="interactive-twin-title">
                <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
                Digital Twin Server Room (Visual Telemetry)
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '12px' }}>
                Live 3D Render
              </span>
            </div>
            <div className="mini-twin-viewport">
              <DigitalTwin status="HEALTHY" type="SERVER" />
            </div>
          </section>

          {/* AI recommendations & suggestion block */}
          <section className="ai-insights-panel card-premium glow-border">
            <h2 className="ai-insights-header">
              <Sparkles size={18} />
              AI Operations Assistant Insights
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="ai-suggestion-item">
                <strong>⚡ AI Incident Summary: Thermal Spike Warning</strong>
                <span>
                  Dell PowerEdge R750 (tag `VIQ-SV-001`) in R&D Lab is reaching 95°C causing high thermal throttling. Heuristics show fan 3 failure. We recommend scheduling immediate cleaning and fan replacement before node degradation.
                </span>
              </div>
              <div className="ai-suggestion-item">
                <strong>🔮 AI Procurement Recommendation</strong>
                <span>
                  A request for "200 laptops under ₹70 lakh" was processed. AI recommends Lenovo ThinkPad L14 Gen 4 at ₹32,000 each (Total ₹64 lakh) leaving ₹6 lakh headroom. Expected lifecycle: 3 years.
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Today's Alerts */}
          <section className="card-premium" style={{ padding: '24px' }}>
            <h2 className="section-title" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} style={{ color: 'var(--accent-warning)' }} />
              Today's Alerts
            </h2>
            <ul className="alerts-list">
              <li className="alert-item">
                <div className="alert-icon critical"><AlertTriangle size={14} /></div>
                <div className="alert-details">
                  <span className="alert-title">PowerEdge R750 Thermal Spike</span>
                  <span className="alert-time">High warning · 10m ago</span>
                </div>
              </li>
              <li className="alert-item">
                <div className="alert-icon warning"><Info size={14} /></div>
                <div className="alert-details">
                  <span className="alert-title">MacBook Pro M3 Max Checkout</span>
                  <span className="alert-time">Custody assignment · 2h ago</span>
                </div>
              </li>
            </ul>
          </section>

          {/* Recent Activity Logs */}
          <section className="card-premium" style={{ padding: '24px' }}>
            <h2 className="section-title" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              Recent Audit Trails
            </h2>
            <ul className="activity-list" style={{ gap: '14px' }}>
              {recentActivities.slice(0, 4).map((act: any) => (
                <li key={act.id} className="activity-item" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '0' }}>
                  <span className={`activity-icon act-${act.icon}`} style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
                    {activityIcon(act.icon)}
                  </span>
                  <div className="activity-details">
                    <span className="activity-name" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{act.action}</span>
                    <span className="activity-user" style={{ fontSize: '0.72rem' }}>by {act.user}</span>
                  </div>
                  <span className="activity-time" style={{ fontSize: '0.72rem' }}>{timeAgo(act.time)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Platform Quick links */}
          <section className="card-premium" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Compliance Summary</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
              <Shield size={16} style={{ color: 'var(--accent-success)' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Ledger Cryptochain Secure (SHA-256)</span>
            </div>
            <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', marginBottom: '14px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>ISO 27001 Status</span>
                <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>COMPLIANT</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>SOC2 Status</span>
                <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>COMPLIANT</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
