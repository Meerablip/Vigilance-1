import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Plus, 
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
  Repeat
} from 'lucide-react';
import type { WidgetConfig, WidgetCategory } from '../../types';

interface WidgetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widget: Omit<WidgetConfig, 'id' | 'x' | 'y'>) => void;
}

interface AvailableWidgetDef {
  type: string;
  title: string;
  description: string;
  category: WidgetCategory;
  defaultW: number;
  defaultH: number;
  icon: React.ComponentType<{ size: number; color?: string }>;
}

const availableWidgets: AvailableWidgetDef[] = [
  // Situational Awareness
  { type: 'regional_map', title: 'Regional Threat Map', description: 'Interactive MapLibre GIS tactical map with Indian defense sectors, sensor positions, and geofence overlays.', category: 'situational_awareness', defaultW: 18, defaultH: 14, icon: Map },
  { type: 'threat_heatmap', title: 'Threat Density Heatmap', description: 'Spatial kernel density visualization of active and historical perimeter events.', category: 'situational_awareness', defaultW: 14, defaultH: 10, icon: Flame },
  { type: 'sensor_coverage', title: 'Sensor Coverage & Blindspots', description: 'Field-of-view cones and overlapping radar/optical coverage zones.', category: 'situational_awareness', defaultW: 12, defaultH: 9, icon: Compass },

  // Alerts & Decisions
  { type: 'alert_queue', title: 'Active Alert Queue', description: 'Live prioritized triage queue of classified incidents with one-click acknowledgment.', category: 'alerts_decisions', defaultW: 16, defaultH: 12, icon: AlertTriangle },
  { type: 'highest_threats', title: 'Critical L4/L5 Threats', description: 'High-severity alerts requiring immediate supervisory inspection or escalation.', category: 'alerts_decisions', defaultW: 14, defaultH: 10, icon: ShieldAlert },
  { type: 'auth_queue_card', title: 'Authorization Desk', description: 'Decisions requiring human approval (Approve, Dismiss, Escalate) with written rationale.', category: 'alerts_decisions', defaultW: 15, defaultH: 11, icon: ClipboardCheck },

  // Live Monitoring
  { type: 'cctv_feeds', title: 'Live Tactical Video Feeds', description: 'High-throughput optical surveillance feeds with live YOLO bounding box AI overlays.', category: 'live_monitoring', defaultW: 16, defaultH: 13, icon: Video },
  { type: 'drone_feeds', title: 'UAV / Drone Recon Stream', description: 'Simulated VisDrone aerial telemetry and perimeter scan feed.', category: 'live_monitoring', defaultW: 14, defaultH: 11, icon: Eye },
  { type: 'radar_summary', title: 'Ground Radar Sweep', description: 'Simulated Doppler radar observation stream with velocity vectors.', category: 'live_monitoring', defaultW: 12, defaultH: 10, icon: Radio },

  // Data Fusion
  { type: 'fused_summary', title: 'Multi-Sensor Fusion Summary', description: 'Correlated event records combining CCTV, Radar, Thermal, and Acoustic sensor evidence.', category: 'data_fusion', defaultW: 16, defaultH: 11, icon: GitMerge },
  { type: 'sensor_disagreement', title: 'Sensor Discrepancy & Conflict', description: 'Flags contradictory sensor observations and triggers automated review workflows.', category: 'data_fusion', defaultW: 13, defaultH: 9, icon: AlertTriangle },

  // Analysis
  { type: 'analytics_card', title: 'Threat Distribution & Metrics', description: 'Five-level L1-L5 distribution, false-alarm rates, and response latency charts.', category: 'analysis', defaultW: 14, defaultH: 10, icon: BarChart3 },

  // Operations
  { type: 'system_health_card', title: 'Subsystem Health & Telemetry', description: 'Real-time heartbeat of AI inference engine, database latency, and sensor connectors.', category: 'operations', defaultW: 12, defaultH: 8, icon: Activity },
  { type: 'shift_handoff_card', title: 'Shift Transfer Summary', description: 'Outstanding items, unassigned alerts, and outgoing watch officer debrief log.', category: 'operations', defaultW: 13, defaultH: 9, icon: Repeat }
];

export const WidgetLibrary: React.FC<WidgetLibraryProps> = ({
  isOpen,
  onClose,
  onAddWidget
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

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '380px',
        height: '100%',
        background: 'var(--bg-surface-elevated)',
        borderLeft: '1px solid var(--border-focus)',
        boxShadow: 'var(--shadow-panel)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 500
      }}
    >
      {/* Header */}
      <div style={{
        height: '42px',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
          WIDGET REPOSITORY
        </span>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Search & Categories */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          padding: '0 8px',
          height: '30px',
          marginBottom: '8px'
        }}>
          <Search size={13} color="var(--text-muted)" />
          <input 
            type="text"
            placeholder="Search widget catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '11px',
              width: '100%'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'situational_awareness', label: 'Surveillance' },
            { id: 'alerts_decisions', label: 'Alerts' },
            { id: 'live_monitoring', label: 'Feeds' },
            { id: 'data_fusion', label: 'Fusion' },
            { id: 'operations', label: 'Operations' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id ? 'var(--accent-cyan-dim)' : 'var(--bg-card)',
                border: selectedCategory === cat.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: selectedCategory === cat.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontSize: '10px',
                padding: '3px 7px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontWeight: selectedCategory === cat.id ? 600 : 400
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredWidgets.map((w) => {
            const Icon = w.icon;
            return (
              <div
                key={w.type}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      padding: '5px',
                      borderRadius: '4px',
                      background: 'var(--bg-surface)',
                      color: 'var(--accent-cyan)'
                    }}>
                      <Icon size={14} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {w.title}
                    </span>
                  </div>

                  <button
                    onClick={() => onAddWidget({
                      type: w.type,
                      title: w.title,
                      category: w.category,
                      w: w.defaultW,
                      h: w.defaultH
                    })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'var(--accent-cyan-dim)',
                      border: '1px solid rgba(0, 210, 255, 0.4)',
                      color: 'var(--accent-cyan)',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={12} />
                    <span>ADD</span>
                  </button>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  {w.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Default Size: {w.defaultW}x{w.defaultH} grid
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
