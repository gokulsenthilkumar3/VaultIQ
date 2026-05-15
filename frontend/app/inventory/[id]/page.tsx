'use client';

export function generateStaticParams() {
  return [];
}

import React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { apiFetch } from '../../../lib/api';
import DigitalTwin from '../../../components/DigitalTwin';
import BlockchainBadge from '../../../components/BlockchainBadge';
import { ArrowLeft, RotateCcw, Wrench } from 'lucide-react';

export default function AssetDetailPage() {
  const { id } = useParams();
  const { data: asset, error, isLoading, mutate } = useSWR<any>(`/assets/${id}`, apiFetch);

  if (error || !asset) return <div className="error">Failed to locate asset in the registry.</div>;
  if (isLoading) return <div className="loading">Retrieving hardware vitals...</div>;

  const data = asset as any;

  const handleReturn = async () => {
    try {
      await apiFetch(`/assets/${data.id}/checkin`, { method: 'POST', body: JSON.stringify({ conditionNotes: 'Returned via UI' }) });
      mutate();
    } catch (err) {
      console.error('Failed to return asset', err);
    }
  };

  return (
    <div className="asset-detail-container">
      <header className="detail-header">
        <div className="back-nav">
          <a href="/inventory"><ArrowLeft size={16} /> Back to Registry</a>
        </div>
        <div className="header-main">
          <div className="header-title-group">
            <h1>{data.modelName}</h1>
            <BlockchainBadge assetId={data.id} />
          </div>
          {data.status === 'ASSIGNED' && (
            <button className="btn btn-outline" onClick={handleReturn}>
              <RotateCcw size={16} /> Return Asset
            </button>
          )}
        </div>
      </header>

      <div className="detail-grid">
        <section className="twin-section card glass">
          <DigitalTwin 
            type={data.type.name.toUpperCase() as any} 
            status={data.status === 'AVAILABLE' ? 'HEALTHY' : data.status === 'MAINTENANCE' ? 'CRITICAL' : 'WARNING'} 
          />
        </section>

        <section className="info-section">
          <div className="card glass info-card">
            <h3 className="section-title">Specifications</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="label">Serial Number</span>
                <span className="value">{data.serialNumber}</span>
              </div>
              <div className="spec-item">
                <span className="label">Tag ID</span>
                <span className="value">{data.tagId}</span>
              </div>
              <div className="spec-item">
                <span className="label">Purchase Date</span>
                <span className="value">{new Date(data.purchaseDate).toLocaleDateString()}</span>
              </div>
              <div className="spec-item">
                <span className="label">Purchase Price</span>
                <span className="value">${data.purchasePrice.toLocaleString()}</span>
              </div>
              <div className="spec-item highlight">
                <span className="label">Current Valuation</span>
                <span className="value">${Math.round(data.depreciation.currentValue).toLocaleString()}</span>
              </div>
              <div className="spec-item">
                <span className="label">Monthly Depreciation</span>
                <span className="value">${Math.round(data.depreciation.monthlyDepreciation).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card glass assignment-card">
            <h3 className="section-title">Custody History</h3>
            <div className="history-list">
              {data.assignments.length > 0 ? data.assignments.map((as: any) => (
                <div key={as.id} className="history-item">
                  <div className="history-user">
                    <span className="avatar-sm">{as.user.fullName.substring(0, 2).toUpperCase()}</span>
                    <span>{as.user.fullName}</span>
                  </div>
                  <div className="history-meta">
                    <span className="date">{new Date(as.assignedAt).toLocaleDateString()}</span>
                    <span className="status">{as.returnedAt ? 'Returned' : 'In Custody'}</span>
                  </div>
                </div>
              )) : (
                <p className="empty-text">No assignment history recorded.</p>
              )}
            </div>
          </div>

          <div className="card glass assignment-card">
            <h3 className="section-title">Maintenance History</h3>
            <div className="history-list">
              {data.maintenance?.length > 0 ? data.maintenance.map((m: any) => (
                <div key={m.id} className="history-item">
                  <div className="history-user">
                    <span className="avatar-sm"><Wrench size={12} /></span>
                    <span>{m.issueType}</span>
                  </div>
                  <div className="history-meta">
                    <span className="date">{new Date(m.scheduledDate).toLocaleDateString()}</span>
                    <span className={`status ${m.status.toLowerCase()}`}>{m.status.replace('_', ' ')}</span>
                  </div>
                </div>
              )) : (
                <p className="empty-text">No maintenance history recorded.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .asset-detail-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .detail-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .back-nav a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
          height: 600px;
        }

        .twin-section {
          padding: 0;
          overflow: hidden;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--accent-primary);
        }

        .specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }

        .value {
          font-size: 1rem;
          font-weight: 600;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .history-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-sm {
          width: 24px;
          height: 24px;
          background: var(--bg-tertiary);
          border-radius: 50%;
          font-size: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .history-meta {
          text-align: right;
          font-size: 0.85rem;
        }

        .history-meta .status {
          display: block;
          font-size: 0.7rem;
          color: var(--accent-success);
          font-weight: 700;
        }

        .empty-text {
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
