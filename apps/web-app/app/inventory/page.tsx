'use client';
import React, { useState } from 'react';
import { getAssets, updateAsset, addAsset, getActivity, Asset, ASSET_TYPES, LOCATIONS } from '../../lib/mockStore';
import { Plus, Search, Eye, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#3fb950',
  MAINTENANCE: '#d29922',
  RETIRED: '#8b949e',
  LOST: '#ff7b78',
};

function AddAssetModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    modelName: '', serialNumber: '', tagId: '', type: 'Laptop' as Asset['type'],
    location: LOCATIONS[0], assignedTo: '', purchasePrice: '', purchaseDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE' as Asset['status'],
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.modelName || !form.serialNumber || !form.tagId) {
      setError('Model name, serial number, and tag ID are required.');
      return;
    }
    addAsset({
      ...form,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      assignedTo: form.assignedTo || null,
    });
    onSuccess();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Register New Asset</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Model Name<input className="input" value={form.modelName} onChange={e => setForm({...form, modelName: e.target.value})} placeholder="e.g. Dell XPS 15" /></label>
          <label>Serial Number<input className="input" value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} placeholder="SN-XXXX" /></label>
          <label>Tag ID<input className="input" value={form.tagId} onChange={e => setForm({...form, tagId: e.target.value})} placeholder="VIQ-XXX" /></label>
          <label>Type<select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value as Asset['type']})}>{ASSET_TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
          <label>Location<select className="input" value={form.location} onChange={e => setForm({...form, location: e.target.value})}>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</select></label>
          <label>Assigned To<input className="input" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} placeholder="Leave blank if unassigned" /></label>
          <label>Purchase Price (₹)<input className="input" type="number" value={form.purchasePrice} onChange={e => setForm({...form, purchasePrice: e.target.value})} placeholder="85000" /></label>
          <label>Purchase Date<input className="input" type="date" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} /></label>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Register Asset</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [assets, setAssets] = useState<Asset[]>(getAssets());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const refresh = () => setAssets(getAssets());

  const filteredData = assets.filter(asset =>
    asset.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.tagId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="inventory-container">
      <header className="inventory-header">
        <div>
          <h1 className="page-title">Asset Inventory</h1>
          <p className="page-subtitle">{assets.length} assets registered in the system.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Register Asset
        </button>
      </header>

      <div className="search-bar glass">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search by name, tag, or type..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="asset-grid">
        {filteredData.map(asset => (
          <div key={asset.id} className="asset-card glass">
            <div className="asset-header">
              <div>
                <div className="asset-name">{asset.modelName}</div>
                <span className="asset-tag">{asset.tagId}</span>
              </div>
              <span className="asset-type-badge">{asset.type}</span>
            </div>
            <div className="asset-meta-grid">
              <div className="meta-item">
                <span className="meta-label">Location</span>
                <span className="meta-value">{asset.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Assigned To</span>
                <span className="meta-value">{asset.assignedTo || '—'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Purchase Price</span>
                <span className="meta-value">₹{asset.purchasePrice.toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Status</span>
                <span className="meta-value" style={{ color: STATUS_COLORS[asset.status] }}>
                  ● {asset.status}
                </span>
              </div>
            </div>
            <div className="asset-actions">
              <Link href={`/inventory/${asset.id}`} className="btn btn-outline">
                <Eye size={14} /> View Details
              </Link>
              <button
                className="btn btn-primary"
                disabled={asset.status !== 'ACTIVE'}
                onClick={() => {
                  const assignee = prompt('Assign to (name):');
                  if (!assignee) return;
                  updateAsset(asset.id, { assignedTo: assignee, status: 'ACTIVE' });
                  refresh();
                }}
              >
                <ChevronRight size={14} /> Assign
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <AddAssetModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); refresh(); }}
        />
      )}

      <style>{`
        .inventory-container { display: flex; flex-direction: column; gap: 24px; padding: 24px; }
        .inventory-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { font-size: 1.6rem; font-weight: 800; margin: 0; }
        .page-subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px; }
        .search-bar { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 10px; }
        .search-icon { color: var(--text-secondary); flex-shrink: 0; }
        .search-bar input { background: transparent; border: none; color: white; outline: none; font-size: 0.9rem; width: 100%; }
        .asset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
        .asset-card { padding: 20px; border-radius: 12px; display: flex; flex-direction: column; gap: 16px; }
        .asset-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .asset-name { font-size: 1.1rem; font-weight: 700; }
        .asset-tag { font-size: 0.7rem; font-family: monospace; background: rgba(88,166,255,0.1); color: var(--accent-primary); padding: 2px 6px; border-radius: 4px; margin-top: 4px; display: inline-block; }
        .asset-type-badge { font-size: 0.75rem; background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 6px; white-space: nowrap; }
        .asset-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; }
        .meta-item { display: flex; flex-direction: column; gap: 2px; }
        .meta-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); }
        .meta-value { font-size: 0.85rem; font-weight: 600; }
        .asset-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; border: none; text-decoration: none; transition: opacity 0.2s; }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); }
        .btn-outline:hover { background: rgba(255,255,255,0.05); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-card { padding: 32px; border-radius: 16px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .modal-title { font-size: 1.2rem; font-weight: 700; margin: 0 0 20px; }
        .modal-form { display: flex; flex-direction: column; gap: 12px; }
        .modal-form label { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary); }
        .input { background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: white; padding: 8px 12px; border-radius: 8px; font-size: 0.9rem; outline: none; }
        .modal-actions { display: flex; gap: 12px; margin-top: 8px; }
        .error-banner { background: rgba(255,77,77,0.1); border: 1px solid rgba(255,77,77,0.3); color: #ff7b78; padding: 10px; border-radius: 8px; font-size: 0.85rem; }
      `}</style>
    </div>
  );
}
