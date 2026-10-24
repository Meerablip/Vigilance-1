import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Map, 
  Video, 
  AlertTriangle, 
  Radio, 
  GitMerge, 
  BarChart3, 
  Activity, 
  ClipboardCheck, 
  Flame, 
  ShieldAlert, 
  Eye, 
  Compass, 
  Repeat,
  GripVertical
} from 'lucide-react';
import type { WidgetCategory } from '../../types';

interface WidgetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AvailableWidgetDef {
  type: string;
  title: string;
  description: string;
  category: WidgetCategory;
  defaultW: number;
  defaultH: number;
  icon: React.ComponentType<{ size: number; color?: string }>;
}

export const availableWidgets: AvailableWidgetDef[] = [
  // Situational Awareness
  { type: 'regional_map', title: 'Regional Threat Map', description: 'GIS tactical map with defense sectors, sensor positions, and geofences.', category: 'situational_awareness', defaultW: 22, defaultH: 16, icon: Map },
  { type: 'threat_heatmap', title: 'Threat Density Heatmap', description: 'Spatial kernel density of active and historical perimeter events.', category: 'situational_awareness', defaultW: 16, defaultH: 12, icon: Flame },
  { type: 'sensor_coverage', title: 'Sensor Coverage Cones', description: 'Field-of-view cones and overlapping radar/optical coverage zones.', category: 'situational_awareness', defaultW: 14, defaultH: 10, icon: Compass },

  // Alerts & Decisions
  { type: 'alert_queue', title: 'Active Alert Queue', description: 'Live prioritized triage queue of classified incidents with acknowledgment.', category: 'alerts_decisions', defaultW: 18, defaultH: 13, icon: AlertTriangle },
  { type: 'highest_threats', title: 'Critical L4/L5 Threats', description: 'High-severity alerts requiring immediate supervisory inspection.', category: 'alerts_decisions', defaultW: 15, defaultH: 11, icon: ShieldAlert },
  { type: 'auth_queue_card', title: 'Authorization Desk', description: 'Decisions requiring human approval (Approve, Dismiss, Escalate).', category: 'alerts_decisions', defaultW: 16, defaultH: 12, icon: ClipboardCheck },

  // Live Monitoring
  { type: 'cctv_feeds', title: 'Live Tactical Optical Feed', description: 'Optical surveillance feed with live YOLO bounding box overlays.', category: 'live_monitoring', defaultW: 18, defaultH: 14, icon: Video },
  { type: 'drone_feeds', title: 'UAV / Recon Stream', description: 'VisDrone aerial telemetry and perimeter scan feed.', category: 'live_monitoring', defaultW: 16, defaultH: 12, icon: Eye },
  { type: 'radar_summary', title: 'Ground Radar Sweep', description: 'Doppler radar observation stream with velocity vectors.', category: 'live_monitoring', defaultW: 14, defaultH: 10, icon: Radio },

  // Data Fusion
  { type: 'fused_summary', title: '5-Level Policy Distribution', description: 'Policy handling distribution and multi-sensor fusion summary.', category: 'data_fusion', defaultW: 18, defaultH: 12, icon: GitMerge },
  { type: 'sensor_disagreement', title: 'Sensor Discrepancy Matrix', description: 'Flags contradictory sensor observations across feeds.', category: 'data_fusion', defaultW: 15, defaultH: 10, icon: AlertTriangle },

  // Analysis
  { type: 'analytics_card', title: 'Response Metrics', description: 'Five-level L1-L5 distribution, false-alarm rates, and latency.', category: 'analysis', defaultW: 15, defaultH: 11, icon: BarChart3 },

  // Operations
  { type: 'connected_systems', title: 'Connected Defense Systems', description: 'Military network ledger (AD-Net, HQ, QRF) with live ACK receipts.', category: 'operations', defaultW: 18, defaultH: 14, icon: Radio },
  { type: 'system_health_card', title: 'Subsystem Telemetry', description: 'Heartbeat of AI inference engine, database latency, and sensors.', category: 'operations', defaultW: 14, defaultH: 9, icon: Activity },
  { type: 'shift_handoff_card', title: 'Shift Transfer Summary', description: 'Outstanding items, unassigned alerts, and watch officer log.', category: 'operations', defaultW: 14, defaultH: 10, icon: Repeat }
];

export const WidgetLibrary: React.FC<WidgetLibraryProps> = ({
  isOpen,
  onClose
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredWidgets = availableWidgets.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) || 
                          w.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, widget: AvailableWidgetDef) => {
    const payload = {
      type: widget.type,
      title: widget.title,
      category: widget.category,
      w: widget.defaultW,
      h: widget.defaultH
    };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '320px',
        height: '100%',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-focus)',
        boxShadow: 'var(--shadow-panel)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 500
      }}
    >
      {/* Header */}
      <div style={{
        height: '38px',
        padding: '0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface-elevated)'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.4px', color: 'var(--text-primary)' }}>
          WIDGET LIBRARY
        </span>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '3px'
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Drag instruction notice */}
      <div style={{
        padding: '6px 10px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid var(--border-dim)',
        fontSize: '10px',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <GripVertical size={13} color="var(--text-muted)" />
        <span>Drag any module onto the screen to position it</span>
      </div>

      {/* Search & Categories */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '0 8px',
          height: '26px',
          marginBottom: '6px'
        }}>
          <Search size={11} color="var(--text-muted)" />
          <input 
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '10px',
              width: '100%'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'situational_awareness', label: 'Surveillance' },
            { id: 'alerts_decisions', label: 'Alerts' },
            { id: 'live_monitoring', label: 'Feeds' },
            { id: 'data_fusion', label: 'Fusion' },
            { id: 'operations', label: 'Ops' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id ? 'var(--bg-card-hover)' : 'transparent',
                border: selectedCategory === cat.id ? '1px solid var(--border-focus)' : '1px solid transparent',
                color: selectedCategory === cat.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '9px',
                padding: '2px 5px',
                borderRadius: '2px',
                cursor: 'pointer',
                fontWeight: selectedCategory === cat.id ? 600 : 400
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Draggable Cards List (No Add button, pure drag-and-drop) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredWidgets.map((w) => {
            const Icon = w.icon;
            return (
              <div
                key={w.type}
                className="draggable-widget-card"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, w)}
                title="Click and drag onto the workspace canvas"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      padding: '3px',
                      borderRadius: '2px',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-secondary)'
                    }}>
                      <Icon size={12} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {w.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                    <GripVertical size={13} />
                  </div>
                </div>

                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  {w.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Size: {w.defaultW}x{w.defaultH}
                  </span>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                    DRAG TO PLACE
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
