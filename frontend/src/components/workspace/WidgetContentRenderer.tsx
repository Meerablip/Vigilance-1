import { useState } from 'react';
import { 
  Play,
  Pause,
  ExternalLink,
  Layers
} from 'lucide-react';
import type { WidgetConfig, ThreatLevel, PageId } from '../../types';

interface WidgetContentRendererProps {
  widget: WidgetConfig;
  onNavigate: (page: PageId) => void;
  onSelectIncident?: (incidentId: string) => void;
}

export const WidgetContentRenderer: React.FC<WidgetContentRendererProps> = ({
  widget,
  onNavigate,
  onSelectIncident
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showAIOverlay, setShowAIOverlay] = useState(true);

  switch (widget.type) {
    case 'regional_map':
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Map Controls Overlay */}
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            zIndex: 10,
            background: 'rgba(18, 22, 31, 0.85)',
            backdropFilter: 'blur(4px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px'
          }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>INDIA DEFENSE SECTOR GRID</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>Coords: 34.0837° N, 74.7973° E</span>
          </div>

          <button
            onClick={() => onNavigate('map')}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              zIndex: 10,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-focus)',
              color: 'var(--text-primary)',
              borderRadius: '3px',
              padding: '3px 8px',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ExternalLink size={11} />
            <span>Open Full GIS Map</span>
          </button>

          {/* Tactical Vector Map Canvas Mockup with Indian Perimeter & Points */}
          <div style={{
            flex: 1,
            background: '#090d14',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* SVG Tactical Map Geometry */}
            <svg width="100%" height="100%" viewBox="0 0 500 350" preserveAspectRatio="none">
              <defs>
                <radialGradient id="radarScan" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(0, 210, 255, 0.15)" />
                  <stop offset="100%" stopColor="rgba(0, 210, 255, 0)" />
                </radialGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="175" x2="500" y2="175" stroke="#141c2b" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="250" y1="0" x2="250" y2="350" stroke="#141c2b" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="250" cy="175" r="100" fill="url(#radarScan)" stroke="#1a2538" strokeWidth="1" />
              <circle cx="250" cy="175" r="50" fill="none" stroke="#1a2538" strokeWidth="1" />

              {/* Schematic Indian Northern & Western Perimeter Outline */}
              <path 
                d="M 120 70 Q 180 30 250 50 T 320 120 Q 380 180 340 260 T 250 320 Q 180 260 160 210 Z" 
                fill="rgba(14, 23, 38, 0.7)" 
                stroke="#2a3b59" 
                strokeWidth="1.5"
              />

              {/* Sensors markers (Green dots) */}
              <circle cx="200" cy="90" r="4" fill="#10b981" />
              <circle cx="260" cy="110" r="4" fill="#10b981" />
              <circle cx="310" cy="170" r="4" fill="#10b981" />
              <circle cx="220" cy="180" r="4" fill="#10b981" />
              <circle cx="180" cy="230" r="4" fill="#10b981" />

              {/* Active Threat Marker (Pulsing Red L4) */}
              <circle cx="205" cy="88" r="14" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="r" values="8;20;8" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="205" cy="88" r="5" fill="#ef4444" />
            </svg>

            {/* Tactical Marker Card Floating */}
            <div 
              onClick={() => onNavigate('incident_details')}
              style={{
                position: 'absolute',
                top: '55px',
                left: '90px',
                background: 'rgba(18, 22, 31, 0.95)',
                border: '1px solid var(--threat-l4)',
                borderRadius: '4px',
                padding: '6px 10px',
                boxShadow: 'var(--shadow-panel)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="badge-threat badge-threat-l4">L4 HIGH</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>INC-2026-9041</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Northern Line Sector 4 • Unidentified Movement
              </div>
            </div>
          </div>

          {/* Bottom telemetry bar */}
          <div style={{
            height: '28px',
            background: 'var(--bg-surface-elevated)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px',
            fontSize: '10px',
            color: 'var(--text-muted)'
          }}>
            <div>Active Sensors: <strong style={{ color: 'var(--status-healthy)' }}>48 Online</strong></div>
            <div>Active Geofences: <strong style={{ color: 'var(--text-secondary)' }}>6 Defined</strong></div>
            <div>Basemap: <strong style={{ color: 'var(--accent-cyan)' }}>Survey of India Compliant</strong></div>
          </div>
        </div>
      );

    case 'cctv_feeds':
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Feed Toolbar */}
          <div style={{
            height: '30px',
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--threat-l5)'
              }} />
              <strong style={{ color: 'var(--text-primary)' }}>CAM-NORTH-04 (OPTICAL + IR)</strong>
              <span style={{ color: 'var(--text-muted)' }}>| VisDrone Tactical Scan</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setShowAIOverlay(!showAIOverlay)}
                style={{
                  background: showAIOverlay ? 'var(--accent-cyan-dim)' : 'transparent',
                  border: showAIOverlay ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  color: showAIOverlay ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Layers size={11} />
                <span>AI YOLO Overlay</span>
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              </button>
            </div>
          </div>

          {/* Video / Stream Viewer with YOLO Bounding Boxes */}
          <div style={{
            flex: 1,
            background: '#040508',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Dark Tactical Camera Grid lines */}
            <div style={{
              width: '100%',
              height: '100%',
              background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
              position: 'relative'
            }}>
              {/* Camera Crosshair */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '30px',
                height: '30px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                pointerEvents: 'none'
              }} />

              {/* Simulated Detections from YOLO26n / VisDrone */}
              {showAIOverlay && (
                <>
                  {/* Detection 1: Person */}
                  <div style={{
                    position: 'absolute',
                    top: '32%',
                    left: '42%',
                    width: '60px',
                    height: '110px',
                    border: '1.5px solid var(--threat-l4)',
                    boxShadow: '0 0 8px rgba(249, 115, 22, 0.4)',
                    pointerEvents: 'none'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-18px',
                      left: '-1px',
                      background: 'var(--threat-l4)',
                      color: '#000',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '1px 4px',
                      borderRadius: '2px',
                      whiteSpace: 'nowrap'
                    }}>
                      PERSON #T-104 [91%]
                    </div>
                  </div>

                  {/* Detection 2: Heavy Vehicle / Truck */}
                  <div style={{
                    position: 'absolute',
                    top: '48%',
                    left: '60%',
                    width: '120px',
                    height: '80px',
                    border: '1.5px solid var(--accent-cyan)',
                    boxShadow: '0 0 8px rgba(0, 210, 255, 0.3)',
                    pointerEvents: 'none'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-18px',
                      left: '-1px',
                      background: 'var(--accent-cyan)',
                      color: '#000',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '1px 4px',
                      borderRadius: '2px',
                      whiteSpace: 'nowrap'
                    }}>
                      TRUCK #T-082 [94%]
                    </div>
                  </div>
                </>
              )}

              {/* Timestamp & Model OSD */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#34d399',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '2px 6px',
                borderRadius: '2px'
              }}>
                MODEL: YOLO26n-VisDrone • LATENCY: 14.2ms • FPS: 30.0
              </div>
            </div>
          </div>
        </div>
      );

    case 'alert_queue':
    case 'highest_threats':
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>LEVEL</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>INCIDENT ID</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>LOCATION</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>WORKFLOW</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>CONFIDENCE</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'INC-2026-9041', level: 'L4' as ThreatLevel, loc: 'Northern Sector 4', flow: 'HITL Review Pending', conf: 91, time: '2m ago' },
                  { id: 'INC-2026-9039', level: 'L3' as ThreatLevel, loc: 'Western Naval Gate', flow: 'Awaiting Auth', conf: 84, time: '14m ago' },
                  { id: 'INC-2026-9037', level: 'L2' as ThreatLevel, loc: 'East Depot Checkpoint', flow: 'AI-Led Dispatched', conf: 96, time: '28m ago' },
                  { id: 'INC-2026-9032', level: 'L1' as ThreatLevel, loc: 'Southern Radar Station', flow: 'Routine Auto-Logged', conf: 98, time: '41m ago' },
                  { id: 'INC-2026-9029', level: 'L5' as ThreatLevel, loc: 'High Security Vault A', flow: 'Dual Approval Req', conf: 93, time: '1h ago' }
                ].map((inc) => (
                  <tr 
                    key={inc.id}
                    onClick={() => {
                      if (onSelectIncident) onSelectIncident(inc.id);
                      onNavigate('incident_details');
                    }}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '6px 8px' }}>
                      <span className={`badge-threat badge-threat-${inc.level.toLowerCase()}`}>
                        {inc.level}
                      </span>
                    </td>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {inc.id}
                    </td>
                    <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>
                      {inc.loc}
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <span style={{
                        fontSize: '10px',
                        color: inc.level === 'L1' || inc.level === 'L2' ? 'var(--status-healthy)' : 'var(--threat-l3)'
                      }}>
                        {inc.flow}
                      </span>
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                      {inc.conf}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'fused_summary':
    case 'analytics_card':
      return (
        <div style={{ height: '100%', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            5-LEVEL THREAT POLICY DISTRIBUTION (LAST 24 HOURS)
          </div>

          {/* Distribution Bars L1 to L5 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { level: 'L1 Routine', count: 42, color: 'var(--threat-l1)', flow: 'AI Autonomous' },
              { level: 'L2 Guarded', count: 18, color: 'var(--threat-l2)', flow: 'AI Connected Dispatch' },
              { level: 'L3 Elevated', count: 7, color: 'var(--threat-l3)', flow: 'HITL Supervisor Review' },
              { level: 'L4 High Threat', count: 3, color: 'var(--threat-l4)', flow: 'HITL Commander Auth' },
              { level: 'L5 Critical', count: 1, color: 'var(--threat-l5)', flow: 'Strict Dual Sign-off' }
            ].map((d) => (
              <div key={d.level} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <span style={{ width: '85px', color: d.color, fontWeight: 600 }}>{d.level}</span>
                <div style={{ flex: 1, height: '8px', background: 'var(--bg-canvas)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${(d.count / 42) * 100}%`, height: '100%', background: d.color }} />
                </div>
                <span style={{ width: '24px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                  {d.count}
                </span>
                <span style={{ width: '130px', fontSize: '10px', color: 'var(--text-muted)' }}>
                  {d.flow}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 'auto',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px'
          }}>
            <div>Automated Handling: <strong style={{ color: 'var(--status-healthy)' }}>84.5%</strong></div>
            <div>Human Review Escalation: <strong style={{ color: 'var(--threat-l3)' }}>15.5%</strong></div>
            <div>Policy Version: <strong style={{ color: 'var(--accent-cyan)' }}>VIGILANCE-DEMO-2.4</strong></div>
          </div>
        </div>
      );

    case 'system_health_card':
      return (
        <div style={{ height: '100%', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '8px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Sensors Online</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--status-healthy)' }}>48 / 50</div>
              <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>2 Optical calibrating</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '8px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AI Inference Latency</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-cyan)' }}>14.8 ms</div>
              <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>NVIDIA Local CUDA</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '8px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Neon DB Latency</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--status-healthy)' }}>22 ms</div>
              <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Zero packet drop</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '8px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Audit Log Chain</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--status-healthy)' }}>VERIFIED</div>
              <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>SHA-256 Hash Chained</div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '11px' }}>
          Telemetry streaming for: {widget.title}
        </div>
      );
  }
};
