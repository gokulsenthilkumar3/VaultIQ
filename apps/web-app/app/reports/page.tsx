'use client';
import React, { useState } from 'react';
import { getAssets, getTickets, getDashboardSummary } from '../../lib/mockStore';
import { Download, BarChart2, Shield, Wrench, TrendingDown } from 'lucide-react';

function exportJSON(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function ReportsPage() {
  const assets = getAssets();
  const tickets = getTickets();
  const summary = getDashboardSummary();
  const [exported, setExported] = useState<string | null>(null);

  const generateReport = (type: string) => {
    let data: any;
    let filename: string;

    if (type === 'AUDIT') {
      data = {
        generatedAt: new Date().toISOString(),
        totalAssets: assets.length,
        assets: assets.map(a => ({
          tagId: a.tagId,
          modelName: a.modelName,
          type: a.type,
          status: a.status,
          location: a.location,
          assignedTo: a.assignedTo,
          purchaseDate: a.purchaseDate,
          purchasePrice: a.purchasePrice,
        })),
      };
      filename = 'audit-report.json';
    } else if (type === 'FINANCE') {
      const totalValue = assets.reduce((s, a) => s + a.purchasePrice, 0);
      data = {
        generatedAt: new Date().toISOString(),
        totalAssetValue: totalValue,
        monthlyDepreciation: Math.round(totalValue * 0.02),
        utilizationRate: summary.stats.utilization,
        breakdown: summary.assetsByType,
      };
      filename = 'finance-report.json';
    } else if (type === 'MAINTENANCE') {
      data = {
        generatedAt: new Date().toISOString(),
        totalTickets: tickets.length,
        open: tickets.filter(t => t.status === 'OPEN').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
        tickets,
      };
      filename = 'maintenance-report.json';
    } else {
      data = { ...summary, generatedAt: new Date().toISOString() };
      filename = 'operations-report.json';
    }

    exportJSON(filename, data);
    setExported(filename);
    setTimeout(() => setExported(null), 3000);
  };

  const totalValue = assets.reduce((s, a) => s + a.purchasePrice, 0);
  const openTickets = tickets.filter(t => t.status === 'OPEN').length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED').length;

  const reportCards = [
    {
      type: 'AUDIT',
      icon: <Shield size={22} />,
      title: 'Compliance Audit Trail',
      description: 'Full asset registry with location, assignment, and status for all assets.',
      stat: `${assets.length} assets`,
      color: '#58a6ff',
    },
    {
      type: 'FINANCE',
      icon: <TrendingDown size={22} />,
      title: 'Asset Depreciation Schedule',
      description: `Total asset value ₹${totalValue.toLocaleString()} with ${summary.stats.utilization}% utilization rate.`,
      stat: `₹${Math.round(totalValue * 0.02).toLocaleString()}/mo`,
      color: '#d29922',
    },
    {
      type: 'MAINTENANCE',
      icon: <Wrench size={22} />,
      title: 'Maintenance Efficiency',
      description: `${openTickets} open tickets, ${resolvedTickets} resolved. Tracks repair SLA performance.`,
      stat: `${tickets.length} tickets`,
      color: '#ff7b78',
    },
    {
      type: 'OPERATIONS',
      icon: <BarChart2 size={22} />,
      title: 'Operations Summary',
      description: 'Complete operational dashboard snapshot including activity log and type breakdown.',
      stat: `${summary.stats.assigned} assigned`,
      color: '#3fb950',
    },
  ];

  return (
    <div className="reports-container">
      <header className="reports-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Export intelligence reports as JSON for stakeholder review.</p>
      </header>

      {exported && (
        <div className="export-toast">
          <Download size={14} /> Downloaded: <strong>{exported}</strong>
        </div>
      )}

      <div className="reports-grid">
        {reportCards.map(card => (
          <div key={card.type} className="report-card glass">
            <div className="report-icon" style={{ color: card.color }}>{card.icon}</div>
            <div className="report-content">
              <h3 className="report-title">{card.title}</h3>
              <p className="report-desc">{card.description}</p>
              <div className="report-footer">
                <span className="report-stat" style={{ color: card.color }}>{card.stat}</span>
                <button
                  className="btn btn-export"
                  style={{ borderColor: card.color, color: card.color }}
                  onClick={() => generateReport(card.type)}
                >
                  <Download size={13} /> Export JSON
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .reports-container { display: flex; flex-direction: column; gap: 24px; padding: 24px; }
        .reports-header { margin-bottom: 4px; }
        .page-title { font-size: 1.6rem; font-weight: 800; margin: 0; }
        .page-subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px; }
        .export-toast { display: flex; align-items: center; gap: 8px; background: rgba(63,185,80,0.12); border: 1px solid rgba(63,185,80,0.3); color: #3fb950; padding: 10px 16px; border-radius: 8px; font-size: 0.85rem; }
        .reports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .report-card { padding: 24px; border-radius: 12px; display: flex; gap: 16px; align-items: flex-start; }
        .report-icon { flex-shrink: 0; margin-top: 2px; }
        .report-content { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .report-title { font-size: 1rem; font-weight: 700; margin: 0; }
        .report-desc { font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }
        .report-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
        .report-stat { font-size: 0.9rem; font-weight: 700; }
        .btn-export { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 7px; background: transparent; border: 1px solid; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .btn-export:hover { opacity: 0.75; }
      `}</style>
    </div>
  );
}
