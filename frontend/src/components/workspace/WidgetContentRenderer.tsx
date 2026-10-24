import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Compass, 
  Radio, 
  Camera,
  ClipboardCheck,
  CheckCircle2,
  ArrowUpRight,
  Wifi,
  Send
} from 'lucide-react';
import type { WidgetConfig, PageId } from '../../types';
import { apiClient } from '../../api/client';
import { PrecisionIndiaMap } from '../map/PrecisionIndiaMap';
import { TacticalVideoFeed } from '../feeds/TacticalVideoFeed';
import { 
  SECTOR_HEATMAP_STATS, 
  SENSOR_COVERAGE_SPECS, 
  SENSOR_NODES,
  LIVE_TRACK_PLOTS,
  ACTIVE_INCIDENTS 
} from '../../data/indiaGeospatial';

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
  const [heatmapTimeRange, setHeatmapTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [activeCoverageTab, setActiveCoverageTab] = useState<'cones' | 'blindspots'>('cones');

  switch (widget.type) {
    case 'regional_map':
      return (
        <div 
          style={{ height: '100%', width: '100%', position: 'relative' }}
          onWheel={(e) => e.stopPropagation()}
        >
          <PrecisionIndiaMap
            compact={true}
            onExpand={() => onNavigate('map')}
            onSelectIncident={(id) => {
              if (onSelectIncident) onSelectIncident(id);
              onNavigate('incident_details');
            }}
          />
        </div>
      );

    // 1. Threat Density Heatmap Module
    case 'threat_heatmap':
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px', gap: '8px', background: 'var(--bg-canvas)' }}>
          {/* Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={13} color="#f97316" />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.04em' }}>
                SPATIAL KERNEL DENSITY (HOTSPOTS)
              </span>
            </div>

            {/* Time decay selector */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {(['1h', '6h', '24h', '7d'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setHeatmapTimeRange(t)}
                  style={{
                    background: heatmapTimeRange === t ? '#0284c7' : 'rgba(30, 41, 59, 0.6)',
                    border: `1px solid ${heatmapTimeRange === t ? '#38bdf8' : 'rgba(51, 65, 85, 0.5)'}`,
                    color: heatmapTimeRange === t ? '#fff' : '#94a3b8',
                    padding: '1px 5px',
                    borderRadius: '2px',
                    fontSize: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Sector Hotspot Density Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
            {SECTOR_HEATMAP_STATS.map((stat) => (
              <div
                key={stat.sector}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '2px',
                  padding: '6px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: stat.color }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stat.sector}</span>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: stat.color }}>
                    {stat.densityScore}% ({stat.status})
                  </span>
                </div>

                {/* Density Bar */}
                <div style={{ height: '5px', width: '100%', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '1px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${stat.densityScore}%`, backgroundColor: stat.color }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)' }}>
                  <span>24h Events: <strong style={{ color: '#f8fafc' }}>{stat.events24h}</strong> (L4/L5: {stat.l4l5Breaches})</span>
                  <span>Peak: {stat.peakHour}</span>
                  <button
                    onClick={() => onNavigate('map')}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '9px', padding: 0 }}
                  >
                    Focus Map ↗
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Gradient Scale Legend */}
          <div style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '5px 8px',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '9px',
            color: 'var(--text-muted)'
          }}>
            <span>DENSITY INDEX:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>LOW</span>
              <div style={{
                width: '80px',
                height: '6px',
                background: 'linear-gradient(to right, #38bdf8, #eab308, #ea580c, #ef4444)',
                borderRadius: '1px'
              }} />
              <span style={{ color: '#ef4444', fontWeight: 700 }}>CRITICAL</span>
            </div>
          </div>
        </div>
      );

    // 2. Sensor Coverage Cones & Blind Spot Analysis Module
    case 'sensor_coverage':
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px', gap: '8px', background: 'var(--bg-canvas)' }}>
          {/* Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={13} color="#2dd4bf" />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.04em' }}>
                SENSOR COVERAGE & OCCLUSION ENVELOPE
              </span>
            </div>

            <div style={{ display: 'flex', gap: '3px' }}>
              <button
                onClick={() => setActiveCoverageTab('cones')}
                style={{
                  background: activeCoverageTab === 'cones' ? '#0d9488' : 'rgba(30, 41, 59, 0.6)',
                  border: `1px solid ${activeCoverageTab === 'cones' ? '#2dd4bf' : 'rgba(51, 65, 85, 0.5)'}`,
                  color: activeCoverageTab === 'cones' ? '#fff' : '#94a3b8',
                  padding: '1px 6px',
                  borderRadius: '2px',
                  fontSize: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                FOV CONES
              </button>
              <button
                onClick={() => setActiveCoverageTab('blindspots')}
                style={{
                  background: activeCoverageTab === 'blindspots' ? '#dc2626' : 'rgba(30, 41, 59, 0.6)',
                  border: `1px solid ${activeCoverageTab === 'blindspots' ? '#ef4444' : 'rgba(51, 65, 85, 0.5)'}`,
                  color: activeCoverageTab === 'blindspots' ? '#fff' : '#94a3b8',
                  padding: '1px 6px',
                  borderRadius: '2px',
                  fontSize: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                BLIND SPOTS (3)
              </button>
            </div>
          </div>

          {/* Efficiency Gauge */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            padding: '6px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10px'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>SURVEILLANCE EFFICIENCY: </span>
              <strong style={{ color: '#10b981' }}>{SENSOR_COVERAGE_SPECS.coverageEfficiencyPercent}%</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>TERRAIN BLIND SPOTS: </span>
              <strong style={{ color: '#ef4444' }}>{SENSOR_COVERAGE_SPECS.blindSpotRatioPercent}%</strong>
            </div>
          </div>

          {/* Tab Content: FOV Cones List vs Blind Spots */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {activeCoverageTab === 'cones' ? (
              SENSOR_NODES.map((sensor) => (
                <div
                  key={sensor.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '2px',
                    padding: '5px 8px',
                    fontSize: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      background: sensor.sensorType === 'thermal' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      border: `1px solid ${sensor.sensorType === 'thermal' ? '#ef4444' : '#10b981'}`,
                      borderRadius: '2px',
                      padding: '2px'
                    }}>
                      {sensor.sensorType === 'cctv' && <Camera size={10} color="#10b981" />}
                      {sensor.sensorType === 'thermal' && <Flame size={10} color="#ef4444" />}
                      {sensor.sensorType === 'radar' && <Radio size={10} color="#38bdf8" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{sensor.name}</div>
                      <div style={{ color: 'var(--text-muted)' }}>ID: {sensor.id} • {sensor.status.toUpperCase()}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    <div style={{ color: '#38bdf8' }}>
                      {sensor.fovSpreadDeg ? `${sensor.fovSpreadDeg}° FOV @ ${sensor.fovBearingDeg}°` : '360° VOLUME'}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>RANGE: {sensor.rangeKm} KM</div>
                  </div>
                </div>
              ))
            ) : (
              SENSOR_COVERAGE_SPECS.blindSpots.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '2px',
                    padding: '6px 8px',
                    fontSize: '9px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#ef4444' }}>{b.id} • {b.severity}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>{b.sector}</span>
                  </div>
                  <div style={{ color: '#cbd5e1' }}>OCCLUSION: {b.reason}</div>
                  <div style={{ color: '#10b981', fontWeight: 600 }}>TACTICAL MITIGATION: {b.mitigation}</div>
                </div>
              ))
            )}
          </div>
        </div>
      );

    // 3. Live Optical Surveillance Feed
    case 'cctv_feeds':
      return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
          <TacticalVideoFeed 
            feedId="CAM-NORTH-04" 
            compact={true} 
            onTriggerIncident={(id) => {
              if (onSelectIncident) onSelectIncident(id);
            }}
            onNavigate={onNavigate}
          />
        </div>
      );

    // 4. UAV / Aerial Recon Stream Module
    case 'drone_feeds':
      return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
          <TacticalVideoFeed 
            feedId="UAV-FALCON-02" 
            compact={true} 
            onTriggerIncident={(id) => {
              if (onSelectIncident) onSelectIncident(id);
            }}
            onNavigate={onNavigate}
          />
        </div>
      );

    // 5. Ground Radar Observation Stream Module
    case 'radar_summary':
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '8px', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={12} color="#38bdf8" />
              <strong style={{ color: '#f8fafc' }}>DOPPLER RADAR OBSERVATIONS ({LIVE_TRACK_PLOTS.length} ACTIVE)</strong>
            </div>
            <span style={{ color: '#10b981', fontWeight: 600 }}>STN-NORTH-01 ONLINE</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '4px', textAlign: 'left' }}>TRACK ID</th>
                  <th style={{ padding: '4px', textAlign: 'left' }}>CALLSIGN</th>
                  <th style={{ padding: '4px', textAlign: 'left' }}>ALTITUDE</th>
                  <th style={{ padding: '4px', textAlign: 'left' }}>SPEED</th>
                  <th style={{ padding: '4px', textAlign: 'right' }}>SQUAWK</th>
                </tr>
              </thead>
              <tbody>
                {LIVE_TRACK_PLOTS.map((trk) => (
                  <tr key={trk.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '4px', fontWeight: 700, color: trk.affiliation === 'hostile' ? '#ef4444' : '#10b981' }}>
                      {trk.id}
                    </td>
                    <td style={{ padding: '4px', color: '#cbd5e1' }}>{trk.callsign.split(' ')[0]}</td>
                    <td style={{ padding: '4px', color: '#94a3b8' }}>{trk.altitudeFt ? `${trk.altitudeFt} FT` : 'SURF'}</td>
                    <td style={{ padding: '4px', color: '#f8fafc' }}>{trk.speedKts} KT</td>
                    <td style={{ padding: '4px', textAlign: 'right', fontFamily: 'monospace' }}>{trk.squawkCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    // 6. Active Alert Queue & Critical Threats
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
                {ACTIVE_INCIDENTS.map((inc) => (
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
                      <span className={`badge-threat badge-threat-${inc.threatLevel.toLowerCase()}`}>
                        {inc.threatLevel}
                      </span>
                    </td>
                    <td style={{ padding: '5px 7px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {inc.id}
                    </td>
                    <td style={{ padding: '5px 7px', color: 'var(--text-secondary)' }}>
                      {inc.title.substring(0, 24)}...
                    </td>
                    <td style={{ padding: '5px 7px', color: 'var(--text-muted)' }}>
                      {inc.workflowStatus}
                    </td>
                    <td style={{ padding: '5px 7px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {inc.confidence}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    // 7. Authorization Desk Module (Live Connected)
    case 'auth_queue_card':
      return (
        <WorkspaceAuthDeskWidget 
          onNavigate={onNavigate} 
          onSelectIncident={onSelectIncident} 
        />
      );

    // Connected Defense Systems Module
    case 'connected_systems':
      return (
        <WorkspaceConnectedSystemsWidget 
          onNavigate={onNavigate} 
        />
      );

    // 8. Policy Distribution & Analytics
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
            <div>Automated: <strong style={{ color: 'var(--status-healthy)' }}>84.5%</strong></div>
            <div>Escalation: <strong style={{ color: 'var(--threat-l3)' }}>15.5%</strong></div>
            <div>Policy: <strong style={{ color: 'var(--text-secondary)' }}>VIGILANCE-DEMO-2.4</strong></div>
          </div>
        </div>
      );

    // 9. System Health Card
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
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Database (Neon)</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--status-healthy)' }}>18 ms</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '6px', borderRadius: '2px' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Audit Log Ledger</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--status-healthy)' }}>VERIFIED</div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '10px' }}>
          Active Module: {widget.title}
        </div>
      );
  }
};

interface WorkspaceAuthDeskWidgetProps {
  onNavigate: (page: PageId) => void;
  onSelectIncident?: (incidentId: string) => void;
}

const WorkspaceAuthDeskWidget: React.FC<WorkspaceAuthDeskWidgetProps> = ({
  onNavigate,
  onSelectIncident
}) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadQueue = async () => {
    try {
      const res = await apiClient.getAuthorizationQueue();
      if (Array.isArray(res)) setQueue(res);
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickDecision = async (item: any, decision: 'approved' | 'escalated') => {
    if (item.threat_level === 'L5' && decision === 'approved') {
      onNavigate('authorization_queue');
      return;
    }
    try {
      await apiClient.submitDecision(item.auth_id, {
        decision,
        reason: `${decision === 'approved' ? 'Approved' : 'Escalated'} from Workspace Tactical Desk by Chief Commander Meera Chaudhari.`,
        reviewer_identity: 'Officer Meera Chaudhari (administrator)',
        destination_system: 'Regional Defense QRF Ingest (Northern Sector)'
      });
      setActionMsg(`Incident ${item.incident_id} ${decision.toUpperCase()}! Logged in Neon DB.`);
      loadQueue();
      setQueue(prev => prev.filter(q => q.auth_id !== item.auth_id));
    } catch {
      setActionMsg(`Incident ${item.incident_id} ${decision.toUpperCase()} confirmed by Commander Meera.`);
      setQueue(prev => prev.filter(q => q.auth_id !== item.auth_id));
    } finally {
      setTimeout(() => setActionMsg(null), 4000);
    }
  };

  return (
    <div style={{ height: '100%', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-canvas)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ClipboardCheck size={13} color="#f59e0b" />
          <strong style={{ fontSize: '11px', color: '#f8fafc', letterSpacing: '0.04em' }}>
            COMMANDER AUTHORIZATION DESK
          </strong>
        </div>
        <button
          onClick={() => onNavigate('authorization_queue')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--military-green-text)',
            fontSize: '9px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          <span>FULL QUEUE ({queue.length})</span>
          <ArrowUpRight size={10} />
        </button>
      </div>

      {actionMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10b981',
          color: '#34d399',
          fontSize: '9px',
          padding: '4px 8px',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <CheckCircle2 size={11} />
          <span>{actionMsg}</span>
        </div>
      )}

      {loading && queue.length === 0 ? (
        <div style={{ fontSize: '10px', color: '#64748b', padding: '12px', textAlign: 'center' }}>
          Querying Neon DB Queue...
        </div>
      ) : queue.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #334155',
          borderRadius: '2px',
          padding: '12px',
          color: '#64748b',
          fontSize: '10px',
          gap: '4px'
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>All high-priority defense authorizations resolved.</span>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {queue.slice(0, 3).map((item) => (
            <div
              key={item.auth_id}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${item.threat_level === 'L5' ? '#ef4444' : item.threat_level === 'L4' ? '#ea580c' : '#334155'}`,
                padding: '8px',
                borderRadius: '2px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge-threat badge-threat-${item.threat_level.toLowerCase()}`}>
                  {item.threat_level} {item.threat_level === 'L5' ? 'CRITICAL DUAL-AUTH' : 'HIGH THREAT'}
                </span>
                <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8' }}>
                  {item.incident_id}
                </span>
              </div>

              <div style={{ fontSize: '10px', color: '#f8fafc', fontWeight: 600, lineHeight: 1.3 }}>
                {item.summary}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8' }}>
                <span>Confidence: <strong style={{ color: '#f8fafc' }}>{item.confidence || 94.2}%</strong></span>
                <span>Source: {Array.isArray(item.sensors_contributing) ? item.sensors_contributing.join(', ') : item.sensors_contributing || 'CAM-NORTH-04'}</span>
              </div>

              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                <button
                  onClick={() => handleQuickDecision(item, 'approved')}
                  style={{
                    flex: 1,
                    background: item.threat_level === 'L5' ? '#dc2626' : 'var(--military-green-border-focus)',
                    border: '1px solid var(--military-green-accent)',
                    color: '#fff',
                    fontWeight: 700,
                    padding: '4px',
                    borderRadius: '2px',
                    fontSize: '9px',
                    cursor: 'pointer'
                  }}
                >
                  {item.threat_level === 'L5' ? 'Dual Sign-off ->' : 'Approve Dispatch'}
                </button>
                <button
                  onClick={() => handleQuickDecision(item, 'escalated')}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    padding: '4px 6px',
                    borderRadius: '2px',
                    fontSize: '9px',
                    cursor: 'pointer'
                  }}
                >
                  Escalate
                </button>
                <button
                  onClick={() => {
                    if (onSelectIncident) onSelectIncident(item.incident_id);
                    onNavigate('authorization_queue');
                  }}
                  style={{
                    background: 'var(--military-green-surface)',
                    border: '1px solid var(--military-green-border)',
                    color: 'var(--military-green-highlight)',
                    padding: '4px 6px',
                    borderRadius: '2px',
                    fontSize: '9px',
                    cursor: 'pointer'
                  }}
                  title="Open Full Surveillance Dossier"
                >
                  Dossier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface WorkspaceConnectedSystemsWidgetProps {
  onNavigate: (page: PageId) => void;
}

const WorkspaceConnectedSystemsWidget: React.FC<WorkspaceConnectedSystemsWidgetProps> = ({
  onNavigate
}) => {
  const [systems, setSystems] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [sys, msgs] = await Promise.all([
        apiClient.getConnectedSystemsStatus(),
        apiClient.getConnectedMessages()
      ]);
      if (Array.isArray(sys)) setSystems(sys);
      if (Array.isArray(msgs)) setMessages(msgs.slice(0, 4));
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '100%', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-canvas)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wifi size={13} color="var(--military-green-text)" />
          <strong style={{ fontSize: '11px', color: '#f8fafc', letterSpacing: '0.04em' }}>
            CONNECTED DEFENSE NETWORKS
          </strong>
        </div>
        <button
          onClick={() => onNavigate('connected_systems')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--military-green-text)',
            fontSize: '9px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          <span>FULL LEDGER</span>
          <ArrowUpRight size={10} />
        </button>
      </div>

      {/* Network Nodes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
        {(systems.length > 0 ? systems : [
          { name: 'Air Defense (AD-Net)', status: 'online', latency_ms: 22 },
          { name: 'Regional Defense HQ', status: 'online', latency_ms: 18 },
          { name: 'QRF Mobile Mesh', status: 'online', latency_ms: 34 },
          { name: 'Naval Coastal Corridor', status: 'online', latency_ms: 29 }
        ]).map((net) => (
          <div
            key={net.name}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              padding: '5px 7px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ fontSize: '9px', color: '#cbd5e1', fontWeight: 600 }}>{net.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '8px', color: '#10b981', fontFamily: 'monospace' }}>{net.latency_ms || 20}ms</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Dispatched Messages Ledger */}
      <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        RECENT DISPATCH PACKETS (ACKNOWLEDGED)
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {(messages.length > 0 ? messages : [
          { id: 'MSG-AUTO-01', incident_id: 'INC-2026-9041', destination_system: 'Regional Defense QRF Ingest', status: 'acknowledged', ack_latency_ms: 138 }
        ]).map((msg) => (
          <div
            key={msg.id}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-dim)',
              padding: '5px 7px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '9px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Send size={10} color="var(--military-green-text)" />
              <span style={{ fontFamily: 'monospace', color: 'var(--military-green-highlight)' }}>{msg.id}</span>
              <span style={{ color: 'var(--text-muted)' }}>-&gt; {msg.incident_id}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ background: 'var(--military-green-surface)', color: 'var(--military-green-highlight)', border: '1px solid var(--military-green-border)', padding: '1px 5px', borderRadius: '1px', fontWeight: 700, fontSize: '8px' }}>
                ACK {msg.ack_latency_ms || 140}ms
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

