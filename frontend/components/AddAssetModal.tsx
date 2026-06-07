'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { apiFetch } from '../lib/api';
import { QRCodeCanvas } from 'qrcode.react';

interface AddAssetModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAssetModal({ onClose, onSuccess }: AddAssetModalProps) {
  const { data: types, mutate: mutateTypes } = useSWR<any[]>('/assets/types', apiFetch);
  const { data: locations, mutate: mutateLocations } = useSWR<any[]>('/assets/locations', apiFetch);
  
  const [formData, setFormData] = useState({
    modelName: '',
    serialNumber: '',
    tagId: '',
    typeId: '',
    locationId: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  const generateTagId = () => {
    return 'VIQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  useEffect(() => {
    setFormData(prev => ({ ...prev, tagId: generateTagId() }));
  }, []);

  const handleCreateType = async () => {
    if (!newTypeName.trim()) return;
    try {
      const created = await apiFetch('/assets/types', {
        method: 'POST',
        body: JSON.stringify({ name: newTypeName.trim(), lifespanYears: 3 })
      });
      await mutateTypes();
      setFormData({ ...formData, typeId: created.id });
      setIsCreatingType(false);
      setNewTypeName('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create asset type');
    }
  };

  const handleCreateLocation = async () => {
    if (!newLocationName.trim()) return;
    try {
      const created = await apiFetch('/assets/locations', {
        method: 'POST',
        body: JSON.stringify({ name: newLocationName.trim() })
      });
      await mutateLocations();
      setFormData({ ...formData, locationId: created.id });
      setIsCreatingLocation(false);
      setNewLocationName('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create location');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingType || isCreatingLocation) return; // Prevent full submit if editing
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await apiFetch('/assets', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          purchasePrice: parseFloat(formData.purchasePrice),
          purchaseDate: new Date(formData.purchaseDate).toISOString(),
        }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to register asset. Check serial number uniqueness.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintQR = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<img src="${canvas.toDataURL()}" />`);
        win.print();
        win.close();
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card glass animate-slide-up" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Register New Asset</h2>
          <p>Add a new hardware entity to the Digital Twin Registry.</p>
        </header>

        <form onSubmit={handleSubmit} className="modal-body">
          {errorMessage && <div className="error-toast">{errorMessage}</div>}
          <div className="form-grid">
            <div className="input-group">
              <label>Model Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. MacBook Pro M3" 
                value={formData.modelName}
                onChange={e => setFormData({...formData, modelName: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>Serial Number</label>
              <input 
                type="text" 
                required 
                placeholder="Unique Hardware ID" 
                value={formData.serialNumber}
                onChange={e => setFormData({...formData, serialNumber: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>Tag ID (QR/Barcode)</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  required 
                  placeholder="VIQ-LT-XXX" 
                  value={formData.tagId}
                  onChange={e => setFormData({...formData, tagId: e.target.value})}
                  style={{ flex: 1 }}
                />
                {formData.tagId && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <QRCodeCanvas id="qr-code-canvas" value={formData.tagId} size={64} />
                    <button type="button" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={handlePrintQR}>Print QR</button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="type-select">Asset Type</label>
              {isCreatingType ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Server, Mouse..."
                    value={newTypeName}
                    onChange={e => setNewTypeName(e.target.value)}
                    style={{ flex: 1 }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateType();
                      }
                    }}
                  />
                  <button type="button" className="btn btn-primary" onClick={handleCreateType}>Save</button>
                  <button type="button" className="btn btn-outline" onClick={() => setIsCreatingType(false)}>X</button>
                </div>
              ) : (
                <select 
                  id="type-select"
                  aria-label="Select asset category"
                  required 
                  value={formData.typeId}
                  onChange={e => {
                    if (e.target.value === 'CREATE_NEW') {
                      setIsCreatingType(true);
                      setFormData({...formData, typeId: ''});
                    } else {
                      setFormData({...formData, typeId: e.target.value});
                    }
                  }}
                >
                  <option value="">Select Type...</option>
                  {types?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  <option value="CREATE_NEW" style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>+ Create New Type...</option>
                </select>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="location-select">Storage Location</label>
              {isCreatingLocation ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Desk 42, Floor 3"
                    value={newLocationName}
                    onChange={e => setNewLocationName(e.target.value)}
                    style={{ flex: 1 }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateLocation();
                      }
                    }}
                  />
                  <button type="button" className="btn btn-primary" onClick={handleCreateLocation}>Save</button>
                  <button type="button" className="btn btn-outline" onClick={() => setIsCreatingLocation(false)}>X</button>
                </div>
              ) : (
                <select 
                  id="location-select"
                  aria-label="Select initial storage location"
                  required 
                  value={formData.locationId}
                  onChange={e => {
                    if (e.target.value === 'CREATE_NEW') {
                      setIsCreatingLocation(true);
                      setFormData({...formData, locationId: ''});
                    } else {
                      setFormData({...formData, locationId: e.target.value});
                    }
                  }}
                >
                  <option value="">Select Location...</option>
                  {locations?.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  <option value="CREATE_NEW" style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>+ Create New Location...</option>
                </select>
              )}
            </div>
            <div className="input-group">
              <label>Purchase Price ($)</label>
              <input 
                type="number" 
                required 
                step="0.01" 
                placeholder="0.00" 
                value={formData.purchasePrice}
                onChange={e => setFormData({...formData, purchasePrice: e.target.value})}
              />
            </div>
          </div>

          <footer className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Add to Registry'}
            </button>
          </footer>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal-content {
          width: 600px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .input-group input, .input-group select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: 8px;
          color: white;
          outline: none;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
        }

        .error-toast {
          background: rgba(255, 77, 77, 0.1);
          border: 1px solid rgba(255, 77, 77, 0.3);
          color: #ff4d4d;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
}
