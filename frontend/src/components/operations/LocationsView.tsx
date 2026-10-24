import React, { useState } from 'react';
import { 
  MapPin 
} from 'lucide-react';
import type { PageId } from '../../types';
import { DEFENSE_STATIONS, SENSORS, type TacticalSensorNode } from '../../data/indiaGeospatial';

interface LocationsViewProps {
  onNavigate: (page: PageId) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({ onNavigate }) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(DEFENSE_STATIONS[0].id);

  const selectedStation = DEFENSE_STATIONS.find(s => s.id === selectedStationId) || DEFENSE_STATIONS[0];
  const stationSensors = SENSORS.filter((s: TacticalSensorNode) => s.stationId === selectedStation.id);

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
          <MapPin size={18} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            STRATEGIC DEFENSE HUBS & SECTOR THEATERS
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
            {DEFENSE_STATIONS.length} THEATER COMMANDS
          </span>
        </div>

        <button
          onClick={() => onNavigate('map')}
          style={{
            background: 'var(--military-green-surface, #182c20)',
            border: '1px solid var(--military-green-border, #274734)',
            color: 'var(--military-green-highlight, #a4cbb4)',
            padding: '6px 12px',
            borderRadius: '2px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          VIEW THEATERS ON LIVE MAP
        </button>
      </div>

      {/* Main Split Grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '360px 1fr',
        gap: '12px',
        padding: '14px',
        overflowY: 'auto'
      }}>
        {/* Hubs List */}
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '10px 14px', background: 'var(--bg-subtle, #101114)', borderBottom: '1px solid #23262e', fontSize: '11px', fontWeight: 700 }}>
            PRIMARY COMMAND POSTS
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {DEFENSE_STATIONS.map(stn => {
              const isSelected = stn.id === selectedStationId;
              return (
                <div
                  key={stn.id}
                  onClick={() => setSelectedStationId(stn.id)}
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
                    <span style={{ fontWeight: 800, fontSize: '11px', color: '#f8fafc' }}>{stn.name}</span>
                    <span style={{
                      fontSize: '8px',
                      fontWeight: 800,
                      background: stn.readinessStatus.includes('1') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      border: `1px solid ${stn.readinessStatus.includes('1') ? '#ef4444' : '#22c55e'}`,
                      color: stn.readinessStatus.includes('1') ? '#fca5a5' : '#86efac',
                      padding: '1px 5px',
                      borderRadius: '2px'
                    }}>
                      {stn.readinessStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>{stn.sector}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Hub Details */}
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div>
            <span style={{ fontSize: '9px', color: 'var(--military-green-text, #84b699)', fontWeight: 800 }}>
              COMMAND SECTOR OVERVIEW
            </span>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0 4px 0' }}>{selectedStation.name}</h2>
            <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{selectedStation.sector}</div>
          </div>

          {/* Operational Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '11px' }}>
            <div style={{ background: 'var(--bg-card, #131417)', padding: '10px', borderRadius: '2px' }}>
              <span style={{ color: '#64748b', fontSize: '9px', display: 'block' }}>READINESS POSTURE</span>
              <strong style={{ color: '#22c55e', fontSize: '13px' }}>{selectedStation.readinessStatus}</strong>
            </div>
            <div style={{ background: 'var(--bg-card, #131417)', padding: '10px', borderRadius: '2px' }}>
              <span style={{ color: '#64748b', fontSize: '9px', display: 'block' }}>RADAR SWEEP RADIUS</span>
              <strong style={{ color: '#f8fafc', fontSize: '13px' }}>{selectedStation.radarSweepRadiusKm} KM</strong>
            </div>
            <div style={{ background: 'var(--bg-card, #131417)', padding: '10px', borderRadius: '2px' }}>
              <span style={{ color: '#64748b', fontSize: '9px', display: 'block' }}>SURFACE ELEVATION</span>
              <strong style={{ color: '#f8fafc', fontSize: '13px' }}>{selectedStation.elevationMeters} METERS</strong>
            </div>
            <div style={{ background: 'var(--bg-card, #131417)', padding: '10px', borderRadius: '2px' }}>
              <span style={{ color: '#64748b', fontSize: '9px', display: 'block' }}>COORDINATES</span>
              <strong style={{ color: '#38bdf8', fontSize: '12px' }}>{selectedStation.coordinates[0]}°N, {selectedStation.coordinates[1]}°E</strong>
            </div>
          </div>

          {/* Attached Sensors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
              SUBSIDIARY SENSOR ARRAYS & PERIMETER TRIPWIRES ({stationSensors.length})
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
              {stationSensors.map((s: TacticalSensorNode) => (
                <div key={s.id} style={{ background: 'var(--bg-card, #131417)', border: '1px solid #1e2229', padding: '10px', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 800, fontSize: '11px', color: '#f8fafc' }}>{s.id}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '4px' }}>{s.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b' }}>
                    <span>RANGE: {s.rangeKm} KM</span>
                    <span style={{ color: '#22c55e' }}>{s.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
