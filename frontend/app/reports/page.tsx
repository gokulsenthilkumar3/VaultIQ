'use client';

import React from 'react';

export default function ReportsPage() {
  const reportTemplates = [
    { title: 'Asset Depreciation Schedule', description: 'Financial projection for IT asset value over 5 years.', category: 'FINANCE' },
    { title: 'Lifecycle Distribution', description: 'Breakdown of current asset age and replacement roadmap.', category: 'OPERATIONS' },
    { title: 'Compliance Audit Trail', description: 'Complete SHA-256 anchored history of all custodial changes.', category: 'AUDIT' },
    { title: 'Maintenance Efficiency', description: 'Analysis of time-to-repair and predictive accuracy.', category: 'ANALYTICS' },
  ];

  return (
    <div className="reports-container">
      <header>
        <h1 className="page-title">Executive Reporting</h1>
        <p className="page-subtitle">Generate high-fidelity intelligence reports for stakeholders.</p>
      </header>

      <div className="reports-grid">
        {reportTemplates.map((report, i) => (
          <div key={i} className="report-card card glass animate-fade-in">
            <div className="report-category">{report.category}</div>
            <h3 className="report-title">{report.title}</h3>
            <p className="report-description">{report.description}</p>
            <div className="report-actions">
              <button className="btn btn-outline">Preview</button>
              <button className="btn btn-primary">Generate PDF</button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .reports-container {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .report-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 32px;
        }

        .report-card:nth-child(1) { animation-delay: 0.1s; }
        .report-card:nth-child(2) { animation-delay: 0.2s; }
        .report-card:nth-child(3) { animation-delay: 0.3s; }
        .report-card:nth-child(4) { animation-delay: 0.4s; }
        .report-card:nth-child(5) { animation-delay: 0.5s; }

        .report-category {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: var(--accent-primary);
          background: rgba(88, 166, 255, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
          align-self: flex-start;
        }

        .report-title {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .report-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          flex: 1;
          margin-bottom: 24px;
        }

        .report-actions {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 12px;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
