// VaultIQ Mock Data Store
// Single source of truth for all frontend mock data
// Reactive: use getAssets(), getTickets() etc. to always get latest state

export type AssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED' | 'LOST';
export type AssetType = 'Laptop' | 'Monitor' | 'Keyboard' | 'Mouse' | 'Printer' | 'Server' | 'Phone' | 'Tablet' | 'Other';

export interface Asset {
  id: string;
  tagId: string;
  modelName: string;
  serialNumber: string;
  type: AssetType;
  status: AssetStatus;
  location: string;
  assignedTo: string | null;
  purchasePrice: number;
  purchaseDate: string;
  lastSeen: string;
}

export interface MaintenanceTicket {
  id: string;
  assetId: string;
  assetName: string;
  tagId: string;
  issue: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  reportedBy: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ActivityLog {
  id: string;
  type: 'checkout' | 'checkin' | 'maintenance' | 'added' | 'retired';
  assetName: string;
  tagId: string;
  user: string;
  timestamp: string;
}

// ---- Initial seed data ----
const SEED_ASSETS: Asset[] = [
  { id: 'a1', tagId: 'VIQ-001', modelName: 'Dell XPS 15', serialNumber: 'DXP15-001', type: 'Laptop', status: 'ACTIVE', location: 'HQ - Floor 2', assignedTo: 'Gokul S.', purchasePrice: 85000, purchaseDate: '2024-01-15', lastSeen: new Date().toISOString() },
  { id: 'a2', tagId: 'VIQ-002', modelName: 'MacBook Pro 14"', serialNumber: 'MBP14-002', type: 'Laptop', status: 'ACTIVE', location: 'HQ - Floor 1', assignedTo: 'Priya M.', purchasePrice: 120000, purchaseDate: '2024-02-10', lastSeen: new Date().toISOString() },
  { id: 'a3', tagId: 'VIQ-003', modelName: 'LG UltraWide 34"', serialNumber: 'LGU34-003', type: 'Monitor', status: 'ACTIVE', location: 'HQ - Floor 2', assignedTo: 'Gokul S.', purchasePrice: 35000, purchaseDate: '2024-01-20', lastSeen: new Date().toISOString() },
  { id: 'a4', tagId: 'VIQ-004', modelName: 'HP LaserJet Pro', serialNumber: 'HPLJ-004', type: 'Printer', status: 'MAINTENANCE', location: 'HQ - Floor 1', assignedTo: null, purchasePrice: 22000, purchaseDate: '2023-06-05', lastSeen: new Date().toISOString() },
  { id: 'a5', tagId: 'VIQ-005', modelName: 'ThinkPad X1 Carbon', serialNumber: 'TPX1-005', type: 'Laptop', status: 'ACTIVE', location: 'Remote', assignedTo: 'Raj K.', purchasePrice: 95000, purchaseDate: '2024-03-01', lastSeen: new Date().toISOString() },
  { id: 'a6', tagId: 'VIQ-006', modelName: 'Logitech MX Master 3', serialNumber: 'LGMX-006', type: 'Mouse', status: 'ACTIVE', location: 'HQ - Floor 2', assignedTo: 'Priya M.', purchasePrice: 8500, purchaseDate: '2024-02-15', lastSeen: new Date().toISOString() },
  { id: 'a7', tagId: 'VIQ-007', modelName: 'Dell PowerEdge R740', serialNumber: 'DPE-007', type: 'Server', status: 'ACTIVE', location: 'Data Center', assignedTo: null, purchasePrice: 450000, purchaseDate: '2023-09-01', lastSeen: new Date().toISOString() },
  { id: 'a8', tagId: 'VIQ-008', modelName: 'iPhone 15 Pro', serialNumber: 'IP15P-008', type: 'Phone', status: 'ACTIVE', location: 'HQ - Floor 1', assignedTo: 'Admin User', purchasePrice: 130000, purchaseDate: '2024-04-10', lastSeen: new Date().toISOString() },
  { id: 'a9', tagId: 'VIQ-009', modelName: 'Keychron K2 Pro', serialNumber: 'KCK2-009', type: 'Keyboard', status: 'RETIRED', location: 'Storage', assignedTo: null, purchasePrice: 7000, purchaseDate: '2022-11-01', lastSeen: new Date().toISOString() },
  { id: 'a10', tagId: 'VIQ-010', modelName: 'iPad Pro 12.9"', serialNumber: 'IPP12-010', type: 'Tablet', status: 'ACTIVE', location: 'Meeting Room A', assignedTo: null, purchasePrice: 95000, purchaseDate: '2024-01-05', lastSeen: new Date().toISOString() },
];

const SEED_TICKETS: MaintenanceTicket[] = [
  { id: 't1', assetId: 'a4', assetName: 'HP LaserJet Pro', tagId: 'VIQ-004', issue: 'Paper jam — roller replacement needed', priority: 'HIGH', status: 'OPEN', reportedBy: 'Priya M.', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 't2', assetId: 'a2', assetName: 'MacBook Pro 14"', tagId: 'VIQ-002', issue: 'Battery not charging above 80%', priority: 'MEDIUM', status: 'IN_PROGRESS', reportedBy: 'Priya M.', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 't3', assetId: 'a7', assetName: 'Dell PowerEdge R740', tagId: 'VIQ-007', issue: 'Fan noise elevated — possible bearing failure', priority: 'CRITICAL', status: 'OPEN', reportedBy: 'Admin User', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 't4', assetId: 'a5', assetName: 'ThinkPad X1 Carbon', tagId: 'VIQ-005', issue: 'Keyboard backlight flickering', priority: 'LOW', status: 'RESOLVED', reportedBy: 'Raj K.', createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), resolvedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
];

const SEED_ACTIVITY: ActivityLog[] = [
  { id: 'ac1', type: 'checkout', assetName: 'Dell XPS 15', tagId: 'VIQ-001', user: 'Gokul S.', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'ac2', type: 'maintenance', assetName: 'HP LaserJet Pro', tagId: 'VIQ-004', user: 'Admin User', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'ac3', type: 'added', assetName: 'iPhone 15 Pro', tagId: 'VIQ-008', user: 'Admin User', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ac4', type: 'checkin', assetName: 'iPad Pro 12.9"', tagId: 'VIQ-010', user: 'Raj K.', timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: 'ac5', type: 'retired', assetName: 'Keychron K2 Pro', tagId: 'VIQ-009', user: 'Admin User', timestamp: new Date(Date.now() - 259200000).toISOString() },
];

// ---- In-memory store ----
if (typeof window !== 'undefined') {
  (window as any).__vaultiq_assets = (window as any).__vaultiq_assets || [...SEED_ASSETS];
  (window as any).__vaultiq_tickets = (window as any).__vaultiq_tickets || [...SEED_TICKETS];
  (window as any).__vaultiq_activity = (window as any).__vaultiq_activity || [...SEED_ACTIVITY];
}

export const getAssets = (): Asset[] => {
  if (typeof window === 'undefined') return [...SEED_ASSETS];
  return (window as any).__vaultiq_assets || [...SEED_ASSETS];
};

export const addAsset = (asset: Omit<Asset, 'id' | 'lastSeen'>): Asset => {
  const newAsset: Asset = {
    ...asset,
    id: 'a' + Date.now(),
    lastSeen: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    (window as any).__vaultiq_assets = [...getAssets(), newAsset];
    const log: ActivityLog = { id: 'ac' + Date.now(), type: 'added', assetName: newAsset.modelName, tagId: newAsset.tagId, user: 'Admin User', timestamp: new Date().toISOString() };
    (window as any).__vaultiq_activity = [log, ...getActivity()];
  }
  return newAsset;
};

export const updateAsset = (id: string, updates: Partial<Asset>): void => {
  if (typeof window !== 'undefined') {
    (window as any).__vaultiq_assets = getAssets().map(a => a.id === id ? { ...a, ...updates } : a);
  }
};

export const getTickets = (): MaintenanceTicket[] => {
  if (typeof window === 'undefined') return [...SEED_TICKETS];
  return (window as any).__vaultiq_tickets || [...SEED_TICKETS];
};

export const addTicket = (ticket: Omit<MaintenanceTicket, 'id' | 'createdAt'>): MaintenanceTicket => {
  const newTicket: MaintenanceTicket = { ...ticket, id: 't' + Date.now(), createdAt: new Date().toISOString() };
  if (typeof window !== 'undefined') {
    (window as any).__vaultiq_tickets = [...getTickets(), newTicket];
  }
  return newTicket;
};

export const updateTicket = (id: string, updates: Partial<MaintenanceTicket>): void => {
  if (typeof window !== 'undefined') {
    (window as any).__vaultiq_tickets = getTickets().map(t => t.id === id ? { ...t, ...updates } : t);
  }
};

export const getActivity = (): ActivityLog[] => {
  if (typeof window === 'undefined') return [...SEED_ACTIVITY];
  return (window as any).__vaultiq_activity || [...SEED_ACTIVITY];
};

export const getDashboardSummary = () => {
  const assets = getAssets();
  const active = assets.filter(a => a.status === 'ACTIVE').length;
  const maintenance = assets.filter(a => a.status === 'MAINTENANCE').length;
  const assigned = assets.filter(a => a.assignedTo !== null).length;
  const totalValue = assets.reduce((sum, a) => sum + a.purchasePrice, 0);
  const monthlyDepreciation = Math.round(totalValue * 0.02);
  const utilization = Math.round((assigned / assets.length) * 100);
  return {
    stats: { total: assets.length, active, maintenance, assigned, utilization, totalMonthlyDepreciation: monthlyDepreciation },
    recentActivities: getActivity().slice(0, 5),
    assetsByType: ['Laptop','Monitor','Printer','Server','Phone','Tablet','Mouse','Keyboard','Other'].map(type => ({
      type, count: assets.filter(a => a.type === type).length
    })).filter(x => x.count > 0),
  };
};

export const ASSET_TYPES: AssetType[] = ['Laptop','Monitor','Keyboard','Mouse','Printer','Server','Phone','Tablet','Other'];
export const LOCATIONS = ['HQ - Floor 1', 'HQ - Floor 2', 'Remote', 'Data Center', 'Meeting Room A', 'Meeting Room B', 'Storage', 'Reception'];
