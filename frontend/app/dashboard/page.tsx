import React from 'react';

export default function Dashboard() {
  const stats = [
    { label: 'Total Assets', value: '1,248', trend: '+12%', color: 'var(--accent-primary)' },
    { label: 'Assigned', value: '842', trend: '67%', color: 'var(--accent-success)' },
    { label: 'In Maintenance', value: '24', trend: '-2%', color: 'var(--accent-warning)' },
    { label: 'Monthly Depreciation', value: '$4,120', trend: '+5%', color: 'var(--accent-danger)' },
  ];

  const recentActivities = [
    { user: 'Sarah Chen', action: 'Checked out MacBook Pro M3', time: '12 mins ago', icon: '💻' },
    { user: 'Mike Ross', action: 'Reported Monitor Issue', time: '45 mins ago', icon: '⚠️' },
    { user: 'Admin', action: 'Added 50x Herman Miller Chairs', time: '2 hours ago', icon: '🪑' },
  ];

  return (
    <div className="dashboard-container">
      <header>
        <h1 className="page-title">Operational Overview</h1>
        <p className="page-subtitle">Real-time insights into your office inventory and asset lifecycle.</p>
      </header>

      <section className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="card stat-card animate-fade-in" style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}>
            <p className="stat-label">{stat.label}</p>
            <div className="stat-value-row">
              <h2 className="stat-value">{stat.value}</h2>
              <span className="stat-trend" style={{ '--trend-color': stat.color } as React.CSSProperties}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="dashboard-content-grid">
        <section className="card activity-section glass">
          <h3 className="section-title">Recent Activity</h3>
          <div className="activity-list">
            {recentActivities.map((activity, i) => (
              <div key={i} className="activity-item">
                <span className="activity-icon">{activity.icon}</span>
                <div className="activity-details">
                  <p className="activity-text"><strong>{activity.user}</strong> {activity.action}</p>
                  <p className="activity-time">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card maintenance-section glass">
          <h3 className="section-title">Maintenance Queue</h3>
          <div className="empty-state">
            <p>Everything is running smoothly.</p>
            <button className="btn btn-primary btn-maintenance">View Schedule</button>
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
          font-size: 2rem;
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
          animation-delay: var(--delay);
        }

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
          font-size: 2.25rem;
          font-weight: 700;
        }

        .stat-trend {
          font-size: 0.9rem;
          font-weight: 700;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          color: var(--trend-color);
        }

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
        }
      `}</style>
    </div>
  );
}
