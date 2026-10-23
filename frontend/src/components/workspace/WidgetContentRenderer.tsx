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
          {/* Map Status Overlay */}
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            zIndex: 10,
            background: 'rgba(15, 17, 21, 0.92)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            padding: '3px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '10px'
          }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>SECTOR GRID 34.08° N, 74.79° E</span>
          </div>

          <button
            onClick={() => onNavigate('map')}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              zIndex: 10,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-focus)',
              color: 'var(--text-secondary)',
              borderRadius: '2px',
              padding: '3px 6px',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ExternalLink size={10} />
            <span>GIS Fullscreen</span>
          </button>

          {/* Minimalist Matte Vector Map Canvas */}
          <div style={{
            flex: 1,
            background: '#0a0c10',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="100%" height="100%" viewBox="0 0 500 350" preserveAspectRatio="none">
              {/* Subtle Hairline Grid */}
              <line x1="0" y1="175" x2="500" y2="175" stroke="#161a22" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="250" y1="0" x2="250" y2="350" stroke="#161a22" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="250" cy="175" r="90" fill="none" stroke="#181e28" strokeWidth="1" />
              <circle cx="250" cy="175" r="45" fill="none" stroke="#181e28" strokeWidth="1" />

              {/* Subdued Sector Perimeter Outline */}
              <path 
                d="M 120 70 Q 180 30 250 50 T 320 120 Q 380 180 340 260 T 250 320 Q 180 260 160 210 Z" 
                fill="#10141c" 
                stroke="#242c3b" 
                strokeWidth="1"
              />

              {/* Sensor Nodes (Muted Green) */}
              <circle cx="200" cy="90" r="3" fill="#10b981" />
              <circle cx="260" cy="110" r="3" fill="#10b981" />
              <circle cx="310" cy="170" r="3" fill="#10b981" />
              <circle cx="220" cy="180" r="3" fill="#10b981" />
              <circle cx="180" cy="230" r="3" fill="#10b981" />

              {/* Active Threat Node (Muted Rust Red L4) */}
              <circle cx="205" cy="88" r="8" fill="none" stroke="#ea580c" strokeWidth="1" />
              <circle cx="205" cy="88" r="3.5" fill="#ea580c" />
            </svg>

            {/* Tactical Marker Card */}
            <div 
              onClick={() => onNavigate('incident_details')}
              style={{
                position: 'absolute',
                top: '50px',
                left: '85px',
                background: 'rgba(20, 23, 29, 0.95)',
                border: '1px solid var(--border-active)',
                borderRadius: '2px',
                padding: '5px 8px',
                boxShadow: 'var(--shadow-panel)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="badge-threat badge-threat-l4">L4 HIGH</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#e2e8f0' }}>INC-2026-9041</span>
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                North Sector 4 • Movement Flagged
              </div>
            </div>
          </div>

          {/* Bottom telemetry */}
          <div style={{
            height: '24px',
            background: 'var(--bg-surface-elevated)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px',
            fontSize: '9px',
            color: 'var(--text-muted)'
          }}>
            <div>Sensors: <strong style={{ color: 'var(--status-healthy)' }}>48 Active</strong></div>
            <div>Geofences: <strong style={{ color: 'var(--text-secondary)' }}>6 Armed</strong></div>
            <div>Datum: <strong style={{ color: 'var(--text-secondary)' }}>WGS-84</strong></div>
          </div>
        </div>
      );

    case 'cctv_feeds':
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Feed Toolbar */}
          <div style={{
            height: '28px',
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--threat-l5)'
              }} />
              <strong style={{ color: 'var(--text-primary)' }}>CAM-NORTH-04</strong>
              <span style={{ color: 'var(--text-muted)' }}>| VisDrone Tactical Ingest</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setShowAIOverlay(!showAIOverlay)}
                style={{
                  background: showAIOverlay ? 'var(--bg-card-hover)' : 'transparent',
                  border: '1px solid var(--border-focus)',
                  color: showAIOverlay ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '9px',
                  padding: '2px 5px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Layers size={10} />
                <span>YOLO Overlay</span>
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
                {isPlaying ? <Pause size={11} /> : <Play size={11} />}
              </button>
            </div>
          </div>

          {/* Video / Stream Viewer - Clean Hairline Overlays, Zero Glowing Blur */}
          <div style={{
            flex: 1,
            background: '#040608',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: '#0a0d14',
              position: 'relative'
            }}>
              {/* Hairline Center Reticle */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                pointerEvents: 'none'
              }} />

              {/* Detections - Clean Crisp Hairline Boxes */}
              {showAIOverlay && (
                <>
                  {/* Person */}
                  <div style={{
                    position: 'absolute',
                    top: '32%',
                    left: '42%',
                    width: '54px',
                    height: '105px',
                    border: '1px solid var(--threat-l4)',
                    pointerEvents: 'none'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '-1px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--threat-l4)',
                      color: 'var(--threat-l4)',
                      fontSize: '8px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      padding: '0 3px',
                      borderRadius: '1px',
                      whiteSpace: 'nowrap'
                    }}>
                      PERSON 0.91
                    </div>
                  </div>

                  {/* Vehicle */}
                  <div style={{
                    position: 'absolute',
                    top: '48%',
                    left: '58%',
                    width: '110px',
                    height: '75px',
                    border: '1px solid var(--accent-tactical-active)',
                    pointerEvents: 'none'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '-1px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--accent-tactical-active)',
                      color: 'var(--text-primary)',
                      fontSize: '8px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      padding: '0 3px',
                      borderRadius: '1px',
                      whiteSpace: 'nowrap'
                    }}>
                      TRUCK 0.94
                    </div>
                  </div>
                </>
              )}

              {/* Timestamp & Model OSD */}
              <div style={{
                position: 'absolute',
                bottom: '6px',
                left: '6px',
                fontFamily: 'monospace',
                fontSize: '9px',
                color: 'var(--text-muted)',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '1px 5px',
                borderRadius: '1px'
              }}>
                YOLO26n-VisDrone • LAT: 14.2ms • FPS: 30
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '5px 7px', textAlign: 'left' }}>LEVEL</th>
                  <th style={{ padding: '5px 7px', textAlign: 'left' }}>INCIDENT</th>
                  <th style={{ padding: '5px 7px', textAlign: 'left' }}>LOCATION</th>
                  <th style={{ padding: '5px 7px', textAlign: 'left' }}>WORKFLOW</th>
                  <th style={{ padding: '5px 7px', textAlign: 'right' }}>CONF</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'INC-2026-9041', level: 'L4' as ThreatLevel, loc: 'North Sector 4', flow: 'HITL Pending', conf: 91 },
                  { id: 'INC-2026-9039', level: 'L3' as ThreatLevel, loc: 'West Naval Gate', flow: 'Awaiting Auth', conf: 84 },
                  { id: 'INC-2026-9037', level: 'L2' as ThreatLevel, loc: 'East Checkpoint', flow: 'AI Dispatched', conf: 96 },
                  { id: 'INC-2026-9032', level: 'L1' as ThreatLevel, loc: 'South Station', flow: 'Routine Logged', conf: 98 },
                  { id: 'INC-2026-9029', level: 'L5' as ThreatLevel, loc: 'High Vault A', flow: 'Dual Sign-off', conf: 93 }
                ].map((inc) => (
                  <tr 
                    key={inc.id}
                    onClick={() => {
                      if (onSelectIncident) onSelectIncident(inc.id);
                      onNavigate('incident_details');
                    }}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '5px 7px' }}>
                      <span className={`badge-threat badge-threat-${inc.level.toLowerCase()}`}>
                        {inc.level}
                      </span>
                    </td>
                    <td style={{ padding: '5px 7px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {inc.id}
                    </td>
                    <td style={{ padding: '5px 7px', color: 'var(--text-secondary)' }}>
                      {inc.loc}
                    </td>
                    <td style={{ padding: '5px 7px', color: 'var(--text-muted)' }}>
                      {inc.flow}
                    </td>
                    <td style={{ padding: '5px 7px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
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
        <div style={{ height: '100%', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            5-LEVEL POLICY DISTRIBUTION (24H)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[
              { level: 'L1 Routine', count: 42, color: 'var(--threat-l1)', flow: 'AI Autonomous' },
              { level: 'L2 Guarded', count: 18, color: 'var(--threat-l2)', flow: 'AI Connected Dispatch' },
              { level: 'L3 Elevated', count: 7, color: 'var(--threat-l3)', flow: 'HITL Review' },
              { level: 'L4 High', count: 3, color: 'var(--threat-l4)', flow: 'HITL Auth Req' },
              { level: 'L5 Critical', count: 1, color: 'var(--threat-l5)', flow: 'Strict Dual Sign-off' }
            ].map((d) => (
              <div key={d.level} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
                <span style={{ width: '75px', color: d.color, fontWeight: 600 }}>{d.level}</span>
                <div style={{ flex: 1, height: '6px', background: 'var(--bg-canvas)', borderRadius: '1px', overflow: 'hidden' }}>
                  <div style={{ width: `${(d.count / 42) * 100}%`, height: '100%', background: d.color }} />
                </div>
                <span style={{ width: '20px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                  {d.count}
                </span>
                <span style={{ width: '120px', fontSize: '9px', color: 'var(--text-muted)' }}>
                  {d.flow}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 'auto',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            padding: '6px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '9px',
            color: 'var(--text-muted)'
          }}>
            <div>Automated Handling: <strong style={{ color: 'var(--status-healthy)' }}>84.5%</strong></div>
            <div>Escalation: <strong style={{ color: 'var(--threat-l3)' }}>15.5%</strong></div>
            <div>Policy: <strong style={{ color: 'var(--text-secondary)' }}>V-1.0</strong></div>
          </div>
        </div>
      );

    case 'system_health_card':
      return (
        <div style={{ height: '100%', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '6px', borderRadius: '2px' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Sensors Online</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--status-healthy)' }}>48 / 50</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '6px', borderRadius: '2px' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Inference Latency</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>14.2 ms</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '6px', borderRadius: '2px' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Database Latency</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--status-healthy)' }}>18 ms</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '6px', borderRadius: '2px' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Audit Log</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--status-healthy)' }}>VERIFIED</div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '10px' }}>
          Streaming: {widget.title}
        </div>
      );
  }
};
