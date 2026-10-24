import React, { useState } from 'react';
import { 
  GitMerge, 
  GitFork, 
  AlertTriangle, 
  Zap, 
  ArrowLeft, 
  Layers, 
  Clock 
} from 'lucide-react';
import type { PageId } from '../../types';
import { ACTIVE_INCIDENTS } from '../../data/indiaGeospatial';

interface SensorFusionViewProps {
  incidentId?: string;
  onNavigate: (page: PageId) => void;
}

interface SensorCorrelationRow {
  id: string;
  name: string;
  type: 'cctv' | 'radar' | 'thermal' | 'acoustic' | 'drone';
  classification: string;
  confidence: number;
  agreementStatus: 'CORRELATED' | 'PARTIAL' | 'DISAGREEMENT';
  weight: number;
  latencyMs: number;
}

export const SensorFusionView: React.FC<SensorFusionViewProps> = ({
  incidentId = 'INC-2026-9041',
  onNavigate
}) => {
  const [selectedIncidentId] = useState<string>(incidentId);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [sensorRows] = useState<SensorCorrelationRow[]>([
    {
      id: 'CAM-NORTH-04',
      name: 'Optical PTZ Cam #04 (YOLOv8)',
      type: 'cctv',
      classification: 'Heavy Transport Truck + Dismounts',
      confidence: 94.2,
      agreementStatus: 'CORRELATED',
      weight: 35,
      latencyMs: 18
    },
    {
      id: 'GS-RAD-NORTH-02',
      name: 'Ground Doppler Radar GS-02',
      type: 'radar',
      classification: 'Mechanized Surface Track (38 km/h)',
      confidence: 91.8,
      agreementStatus: 'CORRELATED',
      weight: 30,
      latencyMs: 12
    },
    {
      id: 'THM-NORTH-03',
      name: 'FLIR Long-Range Thermal Sensor',
      type: 'thermal',
      classification: 'Dual Heat Signatures (+14.8°C)',
      confidence: 88.5,
      agreementStatus: 'CORRELATED',
      weight: 20,
      latencyMs: 24
    },
    {
      id: 'ACS-EAST-01',
      name: 'Acoustic Seismic Tripwire',
      type: 'acoustic',
      classification: 'Engine Combustion Peak (142 Hz)',
      confidence: 82.0,
      agreementStatus: 'PARTIAL',
      weight: 15,
      latencyMs: 8
    }
  ]);

  const incident = ACTIVE_INCIDENTS.find(i => i.id === selectedIncidentId) || ACTIVE_INCIDENTS[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleMergeTracks = () => {
    setIsMerging(true);
    setTimeout(() => {
      setIsMerging(false);
      showToast('Successfully merged secondary radar plot into unified Track #104 (Continuity 100%)');
    }, 1000);
  };

  const handleSplitTrack = () => {
    showToast('Split verified: Track #104 divided into Primary Transport (TRK-104A) and Lead Dismount (TRK-104B)');
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-canvas, #0a0b0d)',
      color: '#f8fafc',
      overflow: 'hidden',
      height: '100%',
      fontFamily: 'var(--font-mono, monospace)'
    }}>
      {/* Top Bar Header */}
      <div style={{
        height: '52px',
        background: 'var(--bg-surface-elevated, #181a1f)',
        borderBottom: '1px solid var(--border-subtle, #23262e)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => onNavigate('incident_details')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            <ArrowLeft size={14} />
            <span>DETAILS</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--military-green-surface, #182c20)',
            border: '1px solid var(--military-green-border, #274734)',
            padding: '4px 10px',
            borderRadius: '2px'
          }}>
            <GitMerge size={14} color="var(--military-green-highlight, #a4cbb4)" />
            <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em' }}>
              CROSS-SENSOR FUSION & DISAGREEMENT MATRIX
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
            TARGET FILE: <strong style={{ color: '#f8fafc' }}>{incident.id}</strong>
          </div>
        </div>

        {/* Quick Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onNavigate('playback')}
            style={{
              background: 'var(--bg-card, #131417)',
              border: '1px solid var(--border-subtle, #23262e)',
              color: '#cbd5e1',
              padding: '5px 12px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Clock size={12} />
            <span>PLAYBACK SCRUBBER</span>
          </button>

          <button
            onClick={() => onNavigate('authorization_queue')}
            style={{
              background: 'var(--military-green-surface, #182c20)',
              border: '1px solid var(--military-green-border-focus, #366147)',
              color: 'var(--military-green-highlight, #a4cbb4)',
              padding: '5px 12px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Zap size={12} />
            <span>AUTHORIZATION QUEUE</span>
          </button>
        </div>
      </div>

      {/* Floating Status Toast */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(20, 23, 29, 0.95)',
          border: '1px solid var(--military-green-border-focus, #366147)',
          color: 'var(--military-green-highlight, #a4cbb4)',
          padding: '6px 14px',
          borderRadius: '2px',
          fontSize: '11px',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
          zIndex: 1000
        }}>
          {toastMessage}
        </div>
      )}

      {/* Main Content Workspace */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1.35fr 0.85fr',
        gap: '12px',
        padding: '14px',
        overflowY: 'auto'
      }}>
        {/* LEFT COLUMN: Sensor Correlation Matrix Table & Conflict Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Correlation Matrix Table Card */}
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '10px 14px',
              background: 'var(--bg-subtle, #101114)',
              borderBottom: '1px solid var(--border-subtle, #23262e)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
                SOURCE AGREEMENT & CONTRIBUTION MATRIX
              </span>
              <span style={{ fontSize: '9px', color: 'var(--military-green-text, #84b699)' }}>
                4 SENSORS CORRELATED • 0 ANOMALOUS GAPS
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ background: '#0a0b0d', color: '#64748b', borderBottom: '1px solid #23262e' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>SENSOR NODE</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>REPORTED CLASSIFICATION</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>CONFIDENCE</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>AGREEMENT</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>WEIGHT</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>LATENCY</th>
                </tr>
              </thead>
              <tbody>
                {sensorRows.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #1a1d24' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{row.id}</div>
                      <div style={{ fontSize: '9px', color: '#64748b' }}>{row.name}</div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                      {row.classification}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#f8fafc' }}>
                      {row.confidence}%
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        background: row.agreementStatus === 'CORRELATED' 
                          ? 'rgba(34, 197, 94, 0.15)' 
                          : 'rgba(234, 179, 8, 0.15)',
                        border: `1px solid ${row.agreementStatus === 'CORRELATED' ? '#22c55e' : '#eab308'}`,
                        color: row.agreementStatus === 'CORRELATED' ? '#86efac' : '#fde047',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        fontSize: '9px',
                        fontWeight: 800
                      }}>
                        {row.agreementStatus}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--military-green-text, #84b699)', fontWeight: 700 }}>
                      {row.weight}%
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#94a3b8' }}>
                      {row.latencyMs} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sensor Discrepancy & Automated Conflict Resolution */}
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={13} color="#f59e0b" />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
                SPATIOTEMPORAL DISCREPANCY & CONFLICT RESOLUTION
              </span>
            </div>

            <div style={{
              background: 'var(--bg-card, #131417)',
              borderLeft: '3px solid #f59e0b',
              padding: '10px 12px',
              fontSize: '10px',
              color: '#cbd5e1',
              lineHeight: 1.5
            }}>
              <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '2px' }}>
                EVENT NOTE: TEMPORARY OPTICAL-RADAR DISCREPANCY DETECTED
              </strong>
              At timestamp T+14s, Optical Feed CAM-04 experienced temporary occlusion behind tree line, dropping detection confidence from 94% to 68%. The Data Fusion Engine automatically dynamically upweighted Doppler Radar GS-02 from 30% to 65% and FLIR Thermal from 20% to 35%, ensuring uninterrupted target continuity across the security perimeter.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Track Fusion Tools & State */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Kalman Filter State Summary */}
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            padding: '14px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px', letterSpacing: '0.04em' }}>
              KALMAN FILTER STATE (SPATIAL POSITIONING)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Position Covariance Error</span>
                <strong style={{ color: '#22c55e' }}>± 1.4 METERS (HIGH ACCURACY)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Heading & Bearing</span>
                <strong style={{ color: '#f8fafc' }}>342° (NORTH-NORTHWEST)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Estimated Kinetic Energy</span>
                <strong style={{ color: '#f8fafc' }}>HEAVY VEHICLE (APPROX 8-12 TONS)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Overall Fusion Quality</span>
                <strong style={{ color: 'var(--military-green-highlight, #a4cbb4)' }}>97.8% (CERTIFIED)</strong>
              </div>
            </div>
          </div>

          {/* Interactive Track Manipulation Tools */}
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={13} color="var(--military-green-text, #84b699)" />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
                COMMANDER TRACK MANIPULATION TOOLS
              </span>
            </div>

            <p style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.4, margin: '2px 0' }}>
              Manually merge fragmented sensor plots or split clustered targets if sensor ambiguity occurs:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleMergeTracks}
                disabled={isMerging}
                style={{
                  background: isMerging ? 'var(--bg-card, #131417)' : 'var(--military-green-surface, #182c20)',
                  border: '1px solid var(--military-green-border, #274734)',
                  color: 'var(--military-green-highlight, #a4cbb4)',
                  padding: '8px 12px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: isMerging ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <GitMerge size={13} />
                <span>{isMerging ? 'MERGING SENSOR TRACKS...' : 'MERGE SECONDARY RADAR PLOT'}</span>
              </button>

              <button
                onClick={handleSplitTrack}
                style={{
                  background: 'var(--bg-card, #131417)',
                  border: '1px solid var(--border-subtle, #23262e)',
                  color: '#cbd5e1',
                  padding: '8px 12px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <GitFork size={13} />
                <span>SPLIT CLUSTERED DISMOUNTS</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
