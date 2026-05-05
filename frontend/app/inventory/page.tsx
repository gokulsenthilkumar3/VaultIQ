'use client';

import React from 'react';
import DigitalTwin from '../../components/DigitalTwin';

const sampleAssets = [
  { id: '1', name: 'Primary Web Server', tagId: 'SRV-001', type: 'SERVER', status: 'HEALTHY', location: 'Rack A-12' },
  { id: '2', name: 'Design Workstation', tagId: 'LAP-442', type: 'LAPTOP', status: 'WARNING', location: 'Studio 4' },
  { id: '3', name: 'Main Console', tagId: 'MON-901', type: 'MONITOR', status: 'CRITICAL', location: 'Reception' },
  { id: '4', name: 'Backup Cluster', tagId: 'SRV-002', type: 'SERVER', status: 'HEALTHY', location: 'Rack B-04' },
];

export default function InventoryPage() {
  return (
    <div className="inventory-container">
      <header className="inventory-header">
        <div>
          <h1 className="page-title">Asset Registry</h1>
          <p className="page-subtitle">Manage and monitor {sampleAssets.length} active digital twins.</p>
        </div>
        <div className="filter-group">
          <button className="btn glass">Filter by Type</button>
          <button className="btn glass">Export PDF</button>
        </div>
      </header>

      <div className="asset-grid">
        {sampleAssets.map((asset) => (
          <div key={asset.id} className="asset-card card animate-fade-in">
            <div className="twin-preview">
              <DigitalTwin 
                type={asset.type as any} 
                status={asset.status as any} 
              />
            </div>
            
            <div className="asset-info">
              <div className="asset-main">
                <h3 className="asset-name">{asset.name}</h3>
                <span className="asset-tag">{asset.tagId}</span>
              </div>
              
              <div className="asset-meta">
                <p>Location: <strong>{asset.location}</strong></p>
                <div className="status-indicator">
                  <span className={`status-dot ${asset.status.toLowerCase()}`}></span>
                  {asset.status}
                </div>
              </div>

              <div className="asset-actions">
                <button className="btn btn-outline">Details</button>
                <button className="btn btn-primary">Check Out</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .inventory-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .filter-group {
          display: flex;
          gap: 12px;
        }

        .asset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .asset-card {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .twin-preview {
          height: 200px;
          border-bottom: 1px solid var(--border-color);
        }

        .asset-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .asset-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .asset-name {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .asset-tag {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 4px;
          color: var(--text-secondary);
        }

        .asset-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.healthy { background: var(--accent-success); box-shadow: 0 0 8px var(--accent-success); }
        .status-dot.warning { background: var(--accent-warning); box-shadow: 0 0 8px var(--accent-warning); }
        .status-dot.critical { background: var(--accent-danger); box-shadow: 0 0 8px var(--accent-danger); }

        .asset-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 8px;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
