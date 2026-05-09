'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { apiFetch } from '../../../lib/api';
import DigitalTwin from '../../../components/DigitalTwin';
import BlockchainBadge from '../../../components/BlockchainBadge';

export default function AssetDetailPage() {
  const { id } = useParams();
  const { data: asset, error, isLoading } = useSWR(`/assets/${id}`, apiFetch);

  if (error) return <div className="error">Failed to locate asset in the registry.</div>;
  if (isLoading) return <div className="loading">Retrieving hardware vitals...</div>;

  return (
    <div className="asset-detail-container">
      <header className="detail-header">
        <div className="back-nav">
          <a href="/inventory">← Back to Registry</a>
        </div>
        <div className="header-main">
          <h1>{asset.modelName}</h1>
          <BlockchainBadge assetId={asset.id} />
        </div>
      </header>

      <div className="detail-grid">
        <section className="twin-section card glass">
          <DigitalTwin 
            type={asset.type.name.toUpperCase() as any} 
            status={asset.status === 'AVAILABLE' ? 'HEALTHY' : asset.status === 'MAINTENANCE' ? 'CRITICAL' : 'WARNING'} 
          />
        </section>

        <section className="info-section">
          <div className="card glass info-card">
            <h3 className="section-title">Specifications</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="label">Serial Number</span>
                <span className="value">{asset.serialNumber}</span>
              </div>
              <div className="spec-item">
                <span className="label">Tag ID</span>
                <span className="value">{asset.tagId}</span>
              </div>
              <div className="spec-item">
                <span className="label">Purchase Date</span>
                <span className="value">{new Date(asset.purchaseDate).toLocaleDateString()}</span>
              </div>
              <div className="spec-item">
                <span className="label">Purchase Price</span>
                <span className="value">${asset.purchasePrice.toLocaleString()}</span>
              </div>
              <div className="spec-item highlight">
                <span className="label">Current Valuation</span>
                <span className="value">${Math.round(asset.depreciation.currentValue).toLocaleString()}</span>
              </div>
              <div className="spec-item">
                <span className="label">Monthly Depreciation</span>
                <span className="value">${Math.round(asset.depreciation.monthlyDepreciation).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card glass assignment-card">
            <h3 className="section-title">Custody History</h3>
            <div className="history-list">
              {asset.assignments.length > 0 ? asset.assignments.map((as: any) => (
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
        }

        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
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
