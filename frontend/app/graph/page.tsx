'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getAssets, getActivity, getTickets, Asset, ActivityLog, MaintenanceTicket } from '../../lib/mockStore';
import { X, User, Monitor, Cpu, Printer, Server, Smartphone, Tablet, Mouse, Keyboard, HelpCircle } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type NodeKind = 'user' | 'asset';

interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  assetType?: Asset['type'];
  assetStatus?: Asset['status'];
  assetData?: Asset;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned?: boolean;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  edgeType: 'assigned' | 'checkout' | 'checkin' | 'maintenance' | 'retired';
  label: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const ASSET_COLORS: Record<string, string> = {
  Laptop: '#a371f7',
  Monitor: '#39d353',
  Phone: '#58a6ff',
  Tablet: '#f0883e',
  Printer: '#ffa657',
  Server: '#ff7b72',
  Mouse: '#8b949e',
  Keyboard: '#8b949e',
  Other: '#8b949e',
};

const EDGE_STYLES: Record<string, { stroke: string; dasharray: string; width: number }> = {
  assigned: { stroke: '#58a6ff', dasharray: 'none', width: 2 },
  checkout: { stroke: '#58a6ff', dasharray: '6,4', width: 1.5 },
  checkin: { stroke: '#ffa657', dasharray: '6,4', width: 1.5 },
  maintenance: { stroke: '#ff7b72', dasharray: '6,4', width: 1.5 },
  retired: { stroke: '#8b949e', dasharray: '3,4', width: 1 },
};

const NODE_R = 28;   // user circle radius
const RECT_W = 80;  // asset rect width
const RECT_H = 40;  // asset rect height

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// ─── Build graph data ────────────────────────────────────────────────────────
function buildGraph(assets: Asset[], activity: ActivityLog[]) {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const userSet = new Set<string>();

  // Collect unique users from assignedTo
  assets.forEach(a => { if (a.assignedTo) userSet.add(a.assignedTo); });
  activity.forEach(ac => { if (ac.user) userSet.add(ac.user); });

  const W = typeof window !== 'undefined' ? window.innerWidth - 320 : 900;
  const H = typeof window !== 'undefined' ? window.innerHeight - 120 : 600;
  const cx = W / 2, cy = H / 2;

  // User nodes — circle around center
  const userArr = Array.from(userSet);
  userArr.forEach((name, i) => {
    const angle = (i / userArr.length) * Math.PI * 2;
    const r = Math.min(W, H) * 0.22;
    nodes.push({
      id: 'user:' + name, kind: 'user', label: name,
      x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 20,
      y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 20,
      vx: 0, vy: 0,
    });
  });

  // Asset nodes — scattered
  assets.forEach((a, i) => {
    const angle = (i / assets.length) * Math.PI * 2;
    const r = Math.min(W, H) * 0.38;
    nodes.push({
      id: 'asset:' + a.id, kind: 'asset', label: a.modelName,
      assetType: a.type, assetStatus: a.status, assetData: a,
      x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 40,
      y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 40,
      vx: 0, vy: 0,
    });

    // Assigned edge
    if (a.assignedTo) {
      edges.push({
        id: `assign:${a.id}`,
        source: 'user:' + a.assignedTo,
        target: 'asset:' + a.id,
        edgeType: 'assigned',
        label: 'assigned',
      });
    }
  });

  // Activity edges (checkout / checkin / maintenance / retired)
  const actTypes = ['checkout', 'checkin', 'maintenance', 'retired'] as const;
  activity.forEach(ac => {
    if (!actTypes.includes(ac.type as any)) return;
    const assetNode = nodes.find(n => n.kind === 'asset' && n.assetData?.tagId === ac.tagId);
    if (!assetNode) return;
    edges.push({
      id: `act:${ac.id}`,
      source: 'user:' + ac.user,
      target: assetNode.id,
      edgeType: ac.type as any,
      label: `${ac.type} ${timeAgo(ac.timestamp)}`,
    });
  });

  return { nodes, edges };
}

// ─── Physics tick ─────────────────────────────────────────────────────────────
function runPhysics(nodes: GraphNode[], edges: GraphEdge[], cx: number, cy: number): GraphNode[] {
  const K_REPEL = 4000;
  const K_ATTRACT = 0.03;
  const REST = 160;
  const K_GRAVITY = 0.005;
  const DAMP = 0.85;

  const next = nodes.map(n => ({ ...n }));

  for (let i = 0; i < next.length; i++) {
    if (next[i].pinned) continue;
    let fx = 0, fy = 0;

    // Repulsion
    for (let j = 0; j < next.length; j++) {
      if (i === j) continue;
      const dx = next[i].x - next[j].x;
      const dy = next[i].y - next[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
      const f = K_REPEL / (dist * dist);
      fx += (dx / dist) * f;
      fy += (dy / dist) * f;
    }

    // Attraction along edges
    edges.forEach(e => {
      const isSource = e.source === next[i].id;
      const isTarget = e.target === next[i].id;
      if (!isSource && !isTarget) return;
      const other = next.find(n => n.id === (isSource ? e.target : e.source));
      if (!other) return;
      const dx = other.x - next[i].x;
      const dy = other.y - next[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
      const f = K_ATTRACT * (dist - REST);
      fx += (dx / dist) * f;
      fy += (dy / dist) * f;
    });

    // Center gravity
    fx += (cx - next[i].x) * K_GRAVITY;
    fy += (cy - next[i].y) * K_GRAVITY;

    next[i].vx = (next[i].vx + fx) * DAMP;
    next[i].vy = (next[i].vy + fy) * DAMP;
    next[i].x += next[i].vx;
    next[i].y += next[i].vy;
  }
  return next;
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function GraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterNodeKind, setFilterNodeKind] = useState<string>('All');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{ nodeId: string; ox: number; oy: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ mx: 0, my: 0, px: 0, py: 0 });

  const nodesRef = useRef<GraphNode[]>([]);
  const rafRef = useRef<number>(0);
  const settledRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const ticksRef = useRef(0);

  const W = typeof window !== 'undefined' ? window.innerWidth - 320 : 900;
  const H = typeof window !== 'undefined' ? window.innerHeight - 120 : 600;

  // Init
  useEffect(() => {
    const assets = getAssets();
    const activity = getActivity();
    const { nodes: n, edges: e } = buildGraph(assets, activity);
    setEdges(e);
    setTickets(getTickets());
    nodesRef.current = n;
    setNodes([...n]);
    ticksRef.current = 0;
    settledRef.current = false;
  }, []);

  // Physics loop
  useEffect(() => {
    if (settledRef.current) return;
    const cx = W / 2, cy = H / 2;
    const tick = () => {
      ticksRef.current++;
      nodesRef.current = runPhysics(nodesRef.current, edges, cx, cy);
      if (ticksRef.current % 3 === 0) setNodes([...nodesRef.current]);
      if (ticksRef.current < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        settledRef.current = true;
        setNodes([...nodesRef.current]);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [edges, W, H]);

  // ── Derived visibility ────────────────────────────────────────────────────
  const visibleNodes = nodes.filter(n => {
    if (filterNodeKind === 'Users' && n.kind !== 'user') return false;
    if (filterNodeKind === 'Assets' && n.kind !== 'asset') return false;
    if (n.kind === 'asset') {
      if (filterType !== 'All' && n.assetType !== filterType) return false;
      if (filterStatus !== 'All' && n.assetStatus !== filterStatus) return false;
    }
    return true;
  });
  const visibleIds = new Set(visibleNodes.map(n => n.id));

  const connectedEdges = hoveredId
    ? new Set(edges.filter(e => e.source === hoveredId || e.target === hoveredId).map(e => e.id))
    : null;

  const connectedNodes = hoveredId
    ? new Set(edges.filter(e => e.source === hoveredId || e.target === hoveredId).flatMap(e => [e.source, e.target]))
    : null;

  // ── Drag node ────────────────────────────────────────────────────────────
  const onNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node) return;
    setDragging({ nodeId, ox: svgP.x - node.x, oy: svgP.y - node.y });
    nodesRef.current = nodesRef.current.map(n => n.id === nodeId ? { ...n, pinned: true } : n);
  }, []);

  const onSvgMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
      nodesRef.current = nodesRef.current.map(n =>
        n.id === dragging.nodeId
          ? { ...n, x: svgP.x - dragging.ox, y: svgP.y - dragging.oy, vx: 0, vy: 0 }
          : n
      );
      setNodes([...nodesRef.current]);
    } else if (isPanning) {
      setPan({ x: panStart.px + (e.clientX - panStart.mx), y: panStart.py + (e.clientY - panStart.my) });
    }
  }, [dragging, isPanning, panStart]);

  const onSvgMouseUp = useCallback(() => {
    if (dragging) {
      nodesRef.current = nodesRef.current.map(n => n.id === dragging.nodeId ? { ...n, pinned: false } : n);
      setDragging(null);
    }
    setIsPanning(false);
  }, [dragging]);

  const onBgMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !dragging) {
      setIsPanning(true);
      setPanStart({ mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y });
      setSelectedId(null);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(3, Math.max(0.3, z - e.deltaY * 0.001)));
  };

  // ── Detail panel data ─────────────────────────────────────────────────────
  const selectedNode = nodes.find(n => n.id === selectedId);
  const allAssets = getAssets();
  const allActivity = getActivity();

  const detailContent = (() => {
    if (!selectedNode) return null;
    if (selectedNode.kind === 'user') {
      const userName = selectedNode.label;
      const userAssets = allAssets.filter(a => a.assignedTo === userName);
      return (
        <div className="detail-body">
          <div className="detail-avatar">{userName.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()}</div>
          <div className="detail-name">{userName}</div>
          <div className="detail-role">Team Member</div>
          <div className="detail-section-title">Assigned Assets ({userAssets.length})</div>
          {userAssets.length === 0 && <div className="detail-empty">No assets assigned</div>}
          {userAssets.map(a => (
            <div key={a.id} className="detail-asset-row">
              <span className="detail-asset-dot" style={{ background: ASSET_COLORS[a.type] || '#8b949e' }} />
              <span className="detail-asset-name">{a.modelName}</span>
              <span className="detail-badge" style={{ color: a.status === 'ACTIVE' ? '#3fb950' : a.status === 'MAINTENANCE' ? '#d29922' : '#8b949e' }}>{a.status}</span>
            </div>
          ))}
        </div>
      );
    }
    // Asset node
    const a = selectedNode.assetData!;
    const assetActivity = allActivity.filter(ac => ac.tagId === a.tagId);
    const assetTickets = tickets.filter(t => t.assetId === a.id && t.status !== 'RESOLVED');
    return (
      <div className="detail-body">
        <div className="detail-asset-icon" style={{ background: ASSET_COLORS[a.type] + '22', color: ASSET_COLORS[a.type] }}>
          <AssetIcon type={a.type} size={28} />
        </div>
        <div className="detail-name">{a.modelName}</div>
        <div className="detail-tag">{a.tagId}</div>
        <div className="detail-grid">
          <div className="detail-kv"><span>Type</span><b>{a.type}</b></div>
          <div className="detail-kv"><span>Status</span><b style={{ color: a.status === 'ACTIVE' ? '#3fb950' : a.status === 'MAINTENANCE' ? '#d29922' : '#8b949e' }}>{a.status}</b></div>
          <div className="detail-kv"><span>Location</span><b>{a.location}</b></div>
          <div className="detail-kv"><span>Price</span><b>₹{a.purchasePrice.toLocaleString()}</b></div>
          <div className="detail-kv"><span>Purchased</span><b>{a.purchaseDate}</b></div>
          <div className="detail-kv"><span>Assigned To</span><b>{a.assignedTo || 'Unassigned'}</b></div>
        </div>
        {assetTickets.length > 0 && (
          <>
            <div className="detail-section-title" style={{ color: '#ff7b72' }}>⚠ Open Tickets ({assetTickets.length})</div>
            {assetTickets.map(t => (
              <div key={t.id} className="detail-ticket">
                <span className="ticket-priority" style={{ color: t.priority === 'CRITICAL' ? '#ff7b72' : t.priority === 'HIGH' ? '#ffa657' : '#d29922' }}>{t.priority}</span>
                <span>{t.issue}</span>
              </div>
            ))}
          </>
        )}
        {assetActivity.length > 0 && (
          <>
            <div className="detail-section-title">Activity History</div>
            {assetActivity.slice(0, 5).map(ac => (
              <div key={ac.id} className="detail-activity">
                <span className="act-type" style={{ color: EDGE_STYLES[ac.type as keyof typeof EDGE_STYLES]?.stroke || '#8b949e' }}>{ac.type}</span>
                <span className="act-user">by {ac.user}</span>
                <span className="act-time">{timeAgo(ac.timestamp)}</span>
              </div>
            ))}
          </>
        )}
      </div>
    );
  })();

  return (
    <div className="graph-page">
      {/* Filter toolbar */}
      <div className="graph-toolbar glass">
        <div className="toolbar-group">
          {['All','Users','Assets','Activity Edges'].map(v => (
            <button key={v} className={`toolbar-btn ${filterNodeKind === v ? 'active' : ''}`} onClick={() => setFilterNodeKind(v)}>{v}</button>
          ))}
        </div>
        <div className="toolbar-group">
          <label className="toolbar-label">Type</label>
          <select className="toolbar-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            {['All','Laptop','Monitor','Phone','Tablet','Printer','Server','Mouse','Keyboard','Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="toolbar-group">
          <label className="toolbar-label">Status</label>
          <select className="toolbar-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {['All','ACTIVE','MAINTENANCE','RETIRED','LOST'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="toolbar-group" style={{ marginLeft: 'auto' }}>
          <button className="toolbar-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset View</button>
        </div>
      </div>

      <div className="graph-body">
        {/* SVG canvas */}
        <svg
          ref={svgRef}
          className="graph-canvas"
          style={{ cursor: isPanning ? 'grabbing' : dragging ? 'grabbing' : 'grab' }}
          onMouseMove={onSvgMouseMove}
          onMouseUp={onSvgMouseUp}
          onMouseLeave={onSvgMouseUp}
          onMouseDown={onBgMouseDown}
          onWheel={onWheel}
        >
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#58a6ff" opacity="0.5" />
            </marker>
          </defs>
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {filterNodeKind !== 'Users' && filterNodeKind !== 'Assets' &&
              edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target)).map(edge => {
                const src = nodesRef.current.find(n => n.id === edge.source);
                const tgt = nodesRef.current.find(n => n.id === edge.target);
                if (!src || !tgt) return null;
                const style = EDGE_STYLES[edge.edgeType] || EDGE_STYLES.assigned;
                const isHighlighted = connectedEdges ? connectedEdges.has(edge.id) : true;
                const mx = (src.x + tgt.x) / 2;
                const my = (src.y + tgt.y) / 2;
                return (
                  <g key={edge.id} opacity={hoveredId ? (isHighlighted ? 1 : 0.1) : 0.7}>
                    <line
                      x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                      stroke={style.stroke}
                      strokeWidth={style.width}
                      strokeDasharray={style.dasharray}
                    />
                    <text x={mx} y={my - 4} textAnchor="middle" fontSize="9" fill={style.stroke} opacity="0.8" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                      {edge.label}
                    </text>
                  </g>
                );
              })
            }

            {/* Nodes */}
            {visibleNodes.map(node => {
              const isSelected = selectedId === node.id;
              const isHovered = hoveredId === node.id;
              const dimmed = hoveredId ? (!connectedNodes?.has(node.id) && node.id !== hoveredId) : false;
              const hasTicket = tickets.some(t => t.status !== 'RESOLVED' && node.assetData?.id === t.assetId);
              const color = node.kind === 'user' ? '#58a6ff' : (ASSET_COLORS[node.assetType!] || '#8b949e');
              const isUnassigned = node.kind === 'asset' && !node.assetData?.assignedTo;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  style={{ cursor: 'pointer' }}
                  opacity={dimmed ? 0.15 : 1}
                  onMouseDown={e => onNodeMouseDown(e, node.id)}
                  onClick={e => { e.stopPropagation(); setSelectedId(node.id === selectedId ? null : node.id); }}
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {node.kind === 'user' ? (
                    <>
                      <circle r={NODE_R} fill={color + '22'} stroke={isSelected ? color : color + '88'} strokeWidth={isSelected ? 3 : 2} />
                      <text textAnchor="middle" dominantBaseline="central" fontSize="10" fill={color} fontWeight="600" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                        {node.label.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()}
                      </text>
                      <text y={NODE_R + 14} textAnchor="middle" fontSize="10" fill="#e6edf3" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                        {node.label}
                      </text>
                    </>
                  ) : (
                    <>
                      <rect
                        x={-RECT_W/2} y={-RECT_H/2}
                        width={RECT_W} height={RECT_H}
                        rx={8}
                        fill={color + (isUnassigned ? '11' : '22')}
                        stroke={isUnassigned ? color + '44' : (isSelected ? color : color + '88')}
                        strokeWidth={isSelected ? 3 : 2}
                        strokeDasharray={isUnassigned ? '5,3' : 'none'}
                      />
                      <AssetIconSvg type={node.assetType!} color={color} />
                      <text y={RECT_H/2 + 13} textAnchor="middle" fontSize="9" fill="#e6edf3" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                        {node.label.length > 14 ? node.label.slice(0,13)+'…' : node.label}
                      </text>
                      {/* Maintenance badge */}
                      {hasTicket && (
                        <g transform={`translate(${RECT_W/2 - 8},${-RECT_H/2 - 2})`}>
                          <circle r={7} fill="#ff7b72" />
                          <text textAnchor="middle" dominantBaseline="central" fontSize="8" fill="white" style={{ pointerEvents: 'none' }}>!</text>
                        </g>
                      )}
                    </>
                  )}
                  {(isHovered || isSelected) && (
                    <circle r={node.kind === 'user' ? NODE_R + 6 : 46} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} />
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Detail Panel */}
        <div className={`detail-panel glass ${selectedId ? 'open' : ''}`}>
          <div className="detail-header">
            <span className="detail-title">Details</span>
            <button className="detail-close" onClick={() => setSelectedId(null)}><X size={16} /></button>
          </div>
          {detailContent || <div className="detail-empty" style={{ padding: '24px', color: 'var(--text-secondary)' }}>Select a node to view details.</div>}
        </div>
      </div>

      <style>{`
        .graph-page { display: flex; flex-direction: column; height: calc(100vh - 0px); overflow: hidden; background: var(--bg-primary); }
        .graph-toolbar { display: flex; align-items: center; gap: 12px; padding: 10px 20px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; flex-wrap: wrap; }
        .toolbar-group { display: flex; align-items: center; gap: 6px; }
        .toolbar-label { font-size: 0.75rem; color: var(--text-secondary); }
        .toolbar-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-secondary); padding: 5px 12px; border-radius: 6px; font-size: 0.78rem; cursor: pointer; transition: all 0.15s; }
        .toolbar-btn:hover { background: rgba(88,166,255,0.1); color: var(--text-primary); }
        .toolbar-btn.active { background: rgba(88,166,255,0.15); border-color: #58a6ff; color: #58a6ff; }
        .toolbar-select { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 5px 8px; border-radius: 6px; font-size: 0.78rem; cursor: pointer; outline: none; }
        .graph-body { display: flex; flex: 1; overflow: hidden; }
        .graph-canvas { flex: 1; height: 100%; display: block; }
        .detail-panel { width: 0; min-width: 0; overflow: hidden; transition: width 0.25s ease, min-width 0.25s ease; border-left: 1px solid transparent; }
        .detail-panel.open { width: 300px; min-width: 300px; border-left-color: var(--border-color); overflow-y: auto; }
        .detail-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px 12px; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; background: var(--bg-secondary); z-index: 1; }
        .detail-title { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); }
        .detail-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; display: flex; align-items: center; }
        .detail-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
        .detail-avatar { width: 52px; height: 52px; border-radius: 50%; background: rgba(88,166,255,0.15); color: #58a6ff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800; margin: 0 auto 4px; }
        .detail-asset-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px; }
        .detail-name { font-size: 1.05rem; font-weight: 700; text-align: center; }
        .detail-role { font-size: 0.8rem; color: var(--text-secondary); text-align: center; }
        .detail-tag { font-size: 0.72rem; font-family: monospace; background: rgba(88,166,255,0.1); color: #58a6ff; padding: 2px 8px; border-radius: 4px; text-align: center; display: inline-block; align-self: center; }
        .detail-section-title { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin-top: 4px; font-weight: 700; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; }
        .detail-kv { display: flex; flex-direction: column; gap: 2px; }
        .detail-kv span { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); }
        .detail-kv b { font-size: 0.82rem; font-weight: 600; word-break: break-word; }
        .detail-asset-row { display: flex; align-items: center; gap: 8px; padding: 6px 8px; background: rgba(255,255,255,0.03); border-radius: 6px; }
        .detail-asset-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .detail-asset-name { font-size: 0.82rem; flex: 1; }
        .detail-badge { font-size: 0.68rem; font-weight: 700; }
        .detail-ticket { display: flex; gap: 8px; align-items: flex-start; padding: 6px 8px; background: rgba(255,123,114,0.06); border-radius: 6px; font-size: 0.8rem; }
        .ticket-priority { font-size: 0.68rem; font-weight: 800; flex-shrink: 0; }
        .detail-activity { display: flex; gap: 8px; align-items: center; font-size: 0.78rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .act-type { font-weight: 700; font-size: 0.72rem; }
        .act-user { flex: 1; color: var(--text-secondary); }
        .act-time { font-size: 0.68rem; color: var(--text-secondary); flex-shrink: 0; }
        .detail-empty { font-size: 0.82rem; color: var(--text-secondary); }
      `}</style>
    </div>
  );
}

// ─── SVG inline icon for asset nodes ─────────────────────────────────────────
function AssetIconSvg({ type, color }: { type: string; color: string }) {
  const icons: Record<string, string> = {
    Laptop: 'M-8-6h16v10H-8zM-10 6h20v2H-10z',
    Monitor: 'M-9-7h18v12H-9zM-3 5h6v2H-3z',
    Phone: 'M-4-8h8v16H-4zM-1 6h2v1H-1z',
    Tablet: 'M-6-8h12v16H-6zM-1 6h2v1H-1z',
    Printer: 'M-8-2h16v8H-8zM-6-6h12v4H-6zM-6 6h12v4H-6z',
    Server: 'M-8-8h16v5H-8zM-8 0h16v5H-8zM6-6h1v2H6zM6 2h1v2H6z',
    Mouse: 'M0-8C-4-8-6-4-6 0h6zM0-8C4-8 6-4 6 0H0zM-6 0C-6 4-3 7 0 7 3 7 6 4 6 0z',
    Keyboard: 'M-9-4h18v8H-9zM-7-2h2v1H-7zM-4-2h2v1H-4zM-1-2h2v1H-1zM2-2h2v1H2zM5-2h2v1H5zM-7 1h14v1H-7z',
    Other: 'M0-8 L7 4 H-7 Z',
  };
  return (
    <path
      d={icons[type] || icons.Other}
      fill={color}
      opacity={0.8}
      style={{ pointerEvents: 'none' }}
    />
  );
}

// ─── Lucide icon helper for detail panel ─────────────────────────────────────
function AssetIcon({ type, size }: { type: string; size: number }) {
  const props = { size, strokeWidth: 1.5 };
  switch (type) {
    case 'Laptop': return <Cpu {...props} />;
    case 'Monitor': return <Monitor {...props} />;
    case 'Phone': return <Smartphone {...props} />;
    case 'Tablet': return <Tablet {...props} />;
    case 'Printer': return <Printer {...props} />;
    case 'Server': return <Server {...props} />;
    case 'Mouse': return <Mouse {...props} />;
    case 'Keyboard': return <Keyboard {...props} />;
    default: return <HelpCircle {...props} />;
  }
}
