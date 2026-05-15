"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { apiFetch } from '../../lib/api';
import DigitalTwin from '../../components/DigitalTwin';
import BlockchainBadge from '../../components/BlockchainBadge';
import CheckoutModal from '../../components/CheckoutModal';

import { Plus, ChevronRight, Search, Eye, MoveRight } from 'lucide-react';

export default function InventoryPage() {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: assets, error, isLoading, mutate } = useSWR<any[]>('/assets', apiFetch);

  if (error || !assets) return <div className="error-card glass">Failed to load registry.</div>;
  if (isLoading) return <div className="loading">Syncing Digital Twin Registry...</div>;

  const dataArray = Array.isArray(assets) ? assets : ((assets as any).data || []);
  const data = dataArray as any[];

  const filteredData = data.filter((asset) => 
    asset.modelName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    asset.tagId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="inventory-container">
      <header className="inventory-header">
        <div>
          <h1 className="page-title">Digital Twin Registry</h1>
          <p className="page-subtitle">Real-time synchronization across {data.length} enterprise assets.</p>
        </div>
        <div className="filter-group">
          <div className="search-bar glass">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary"><Plus size={18} /> Register Asset</button>
        </div>
      </header>

      <div className="asset-grid">
        {filteredData.map((asset: any) => (
          <div key={asset.id} className="asset-card card animate-fade-in">
            <div className="twin-preview">
              <DigitalTwin 
                type={asset.type.name.toUpperCase() as any} 
                status={asset.status === 'AVAILABLE' ? 'HEALTHY' : asset.status === 'MAINTENANCE' ? 'CRITICAL' : 'WARNING'} 
              />
            </div>
            
            <div className="asset-info">
              <div className="asset-main">
                <div>
                  <h3 className="asset-name">{asset.modelName}</h3>
                  <span className="asset-tag">{asset.tagId}</span>
                </div>
                <BlockchainBadge assetId={asset.id} />
              </div>
              
              <div className="asset-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Location</span>
                  <span className="meta-value">{asset.location.name}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Condition</span>
                  <div className="status-indicator">
                    <span className={`status-dot ${asset.status.toLowerCase()}`}></span>
                    <span className="status-text">{asset.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="asset-actions">
                <a href={`/inventory/${asset.id}`} className="btn btn-outline"><Eye size={16} /> Vitals</a>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setSelectedAsset(asset)}
                  disabled={asset.status !== 'AVAILABLE'}
                >
                  <MoveRight size={16} /> Deployment
                </button>
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
          align-items: center;
        }

        .filter-group {
          display: flex;
          gap: 16px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .search-icon {
          color: var(--text-secondary);
        }

        .search-bar input {
          background: transparent;
          border: none;
          color: white;
          outline: none;
          font-size: 0.9rem;
        }

        .asset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
        }

        .asset-card {
          padding: 0;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .asset-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .twin-preview {
          height: 240px;
          background: black;
          border-bottom: 1px solid var(--border-color);
        }

        .asset-info {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .asset-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .asset-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .asset-tag {
          font-size: 0.7rem;
          font-family: monospace;
          background: rgba(88, 166, 255, 0.1);
          color: var(--accent-primary);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .asset-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }

        .meta-value {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.healthy { background: var(--accent-success); box-shadow: 0 0 8px var(--accent-success); }
        .status-dot.warning { background: var(--accent-warning); box-shadow: 0 0 8px var(--accent-warning); }
        .status-dot.critical { background: var(--accent-danger); box-shadow: 0 0 8px var(--accent-danger); }

        .status-text {
          font-size: 0.8rem;
          font-weight: 700;
        }

        .asset-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: white;
        }
      `}</style>

      {selectedAsset && (
        <CheckoutModal 
          asset={selectedAsset} 
          onClose={() => setSelectedAsset(null)}
          onSuccess={() => {
            mutate();
            setSelectedAsset(null);
          }}
        />
      )}
    </div>
  );
}
