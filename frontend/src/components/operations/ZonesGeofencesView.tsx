import React, { useState } from 'react';
import { 
  Boxes, 
  Save 
} from 'lucide-react';
import type { PageId } from '../../types';
import { GEOFENCES } from '../../data/indiaGeospatial';

interface ZonesGeofencesViewProps {
  onNavigate: (page: PageId) => void;
}

export const ZonesGeofencesView: React.FC<ZonesGeofencesViewProps> = ({ onNavigate }) => {
  const [geofences, setGeofences] = useState(GEOFENCES);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(GEOFENCES[0]?.id || 'GEO-NORTH-ZONE-B');
  const [isSaved, setIsSaved] = useState(false);

  const activeZone = geofences.find(g => g.id === selectedZoneId) || geofences[0];

  const handleToggleArmed = (id: string) => {
    setGeofences(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, status: g.status === 'ARMED' ? 'STANDBY' : 'ARMED' };
      }
      return g;
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-canvas, #0a0b0d)',
      color: '#f8fafc',
      height: '100%',
      overflow: 'hidden',
      fontFamily: 'var(--font-mono, monospace)'
    }}>
      {/* Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Boxes size={18} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            DEFENSE GEOFENCE & RESTRICTED SECTOR MANAGER
          </h2>
          <span style={{
            background: 'var(--military-green-surface, #182c20)',
            border: '1px solid var(--military-green-border, #274734)',
            color: 'var(--military-green-highlight, #a4cbb4)',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '2px'
          }}>
            {geofences.length} ACTIVE ZONES
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onNavigate('map')}
            style={{
              background: 'var(--bg-card, #131417)',
              border: '1px solid var(--border-subtle, #23262e)',
              color: '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            VIEW ON LIVE MAP
          </button>
          <button
            onClick={handleSave}
            style={{
              background: isSaved ? 'var(--military-green-border, #274734)' : 'var(--military-green-surface, #182c20)',
              border: '1px solid var(--military-green-border-focus, #366147)',
              color: 'var(--military-green-highlight, #a4cbb4)',
              padding: '6px 14px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Save size={12} />
            <span>{isSaved ? 'SAVED TO DB' : 'COMMIT ZONES'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '380px 1fr',
        gap: '12px',
        padding: '14px',
        overflowY: 'auto'
      }}>
        {/* Left: Zone Inventory List */}
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '10px 14px',
            background: 'var(--bg-subtle, #101114)',
            borderBottom: '1px solid var(--border-subtle, #23262e)',
            fontSize: '11px',
            fontWeight: 700
          }}>
            RESTRICTED GEOFENCE BOUNDARIES
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {geofences.map(g => {
              const isSelected = g.id === selectedZoneId;
              const isArmed = g.status === 'ARMED';
              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedZoneId(g.id)}
                  style={{
                    background: isSelected ? 'var(--military-green-surface, #182c20)' : 'var(--bg-card, #131417)',
                    border: `1px solid ${isSelected ? 'var(--military-green-border-focus, #366147)' : '#1e2229'}`,
                    padding: '10px 12px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '11px', color: '#f8fafc' }}>{g.name}</span>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      background: isArmed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      border: `1px solid ${isArmed ? '#ef4444' : '#64748b'}`,
                      color: isArmed ? '#fca5a5' : '#94a3b8',
                      padding: '1px 5px',
                      borderRadius: '2px'
                    }}>
                      {g.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8' }}>
                    <span>SEVERITY ON BREACH: <strong style={{ color: '#ef4444' }}>{g.severityOnBreach}</strong></span>
                    <span>{g.polygon.length} VERTICES</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Zone Config & Polygon Inspector */}
        {activeZone && (
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800 }}>{activeZone.name}</h3>
                <span style={{ fontSize: '10px', color: '#64748b' }}>IDENTIFIER: {activeZone.id}</span>
              </div>

              <button
                onClick={() => handleToggleArmed(activeZone.id)}
                style={{
                  background: activeZone.status === 'ARMED' ? '#7f1d1d' : 'var(--military-green-surface, #182c20)',
                  border: `1px solid ${activeZone.status === 'ARMED' ? '#dc2626' : 'var(--military-green-border, #274734)'}`,
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '2px',
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {activeZone.status === 'ARMED' ? 'STANDBY GEOFENCE' : 'ARM GEOFENCE SENSORS'}
              </button>
            </div>

            {/* Tactical Parameters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '11px' }}>
              <div style={{ background: 'var(--bg-card, #131417)', padding: '10px', borderRadius: '2px' }}>
                <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Breach Severity Rating</span>
                <strong style={{ color: '#ef4444', fontSize: '13px' }}>LEVEL {activeZone.severityOnBreach} HIGH PRIORITY</strong>
              </div>
              <div style={{ background: 'var(--bg-card, #131417)', padding: '10px', borderRadius: '2px' }}>
                <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Tripwire Perimeter Buffer</span>
                <strong style={{ color: '#f8fafc', fontSize: '13px' }}>100 METERS</strong>
              </div>
              <div style={{ background: 'var(--bg-card, #131417)', padding: '10px', borderRadius: '2px' }}>
                <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Auto-Trigger Action</span>
                <strong style={{ color: 'var(--military-green-highlight, #a4cbb4)', fontSize: '13px' }}>PTZ CAM SLEW-TO-CUE</strong>
              </div>
            </div>

            {/* Polygon Coordinates Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
                POLYGON BOUNDARY VERTICES (SURVEY OF INDIA DATUM)
              </span>
              <div style={{ background: 'var(--bg-card, #131417)', border: '1px solid #1e2229', borderRadius: '2px', padding: '8px' }}>
                <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: '#64748b', borderBottom: '1px solid #23262e' }}>
                      <th style={{ textAlign: 'left', padding: '4px' }}>VERTEX</th>
                      <th style={{ textAlign: 'left', padding: '4px' }}>LATITUDE</th>
                      <th style={{ textAlign: 'left', padding: '4px' }}>LONGITUDE</th>
                      <th style={{ textAlign: 'right', padding: '4px' }}>SECURITY STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeZone.polygon.map(([lat, lng], idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #14171d' }}>
                        <td style={{ padding: '6px 4px', fontWeight: 700, color: 'var(--military-green-text, #84b699)' }}>
                          #0{idx + 1}
                        </td>
                        <td style={{ padding: '6px 4px', color: '#cbd5e1' }}>{lat.toFixed(4)}° N</td>
                        <td style={{ padding: '6px 4px', color: '#cbd5e1' }}>{lng.toFixed(4)}° E</td>
                        <td style={{ padding: '6px 4px', textAlign: 'right', color: '#22c55e' }}>CALIBRATED</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
