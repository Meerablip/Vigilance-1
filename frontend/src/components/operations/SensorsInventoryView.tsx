import React, { useState } from 'react';
import { 
  Radio, 
  Video, 
  Flame, 
  Activity, 
  Search 
} from 'lucide-react';
import type { PageId } from '../../types';
import { SENSORS, type TacticalSensorNode } from '../../data/indiaGeospatial';

interface SensorsInventoryViewProps {
  onNavigate: (page: PageId) => void;
}

export const SensorsInventoryView: React.FC<SensorsInventoryViewProps> = ({ onNavigate }) => {
  const [sensors] = useState<TacticalSensorNode[]>(SENSORS);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSensors = sensors.filter((s: TacticalSensorNode) => {
    const matchesType = filterType === 'ALL' || s.sensorType === filterType;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'cctv': return <Video size={13} color="#38bdf8" />;
      case 'radar': return <Radio size={13} color="#22c55e" />;
      case 'thermal': return <Flame size={13} color="#f97316" />;
      case 'acoustic': return <Activity size={13} color="#a855f7" />;
      default: return <Radio size={13} color="#94a3b8" />;
    }
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
          <Radio size={18} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            TACTICAL SENSOR INVENTORY & HEALTH TELEMETRY
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
            {sensors.length} HARDWARE NODES
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            VIEW SENSOR CONES ON MAP
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div style={{
        padding: '10px 20px',
        background: 'var(--bg-subtle, #101114)',
        borderBottom: '1px solid var(--border-subtle, #23262e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'cctv', 'radar', 'thermal', 'acoustic'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                background: filterType === t ? 'var(--military-green-surface, #182c20)' : 'var(--bg-card, #131417)',
                border: `1px solid ${filterType === t ? 'var(--military-green-border-focus, #366147)' : '#23262e'}`,
                color: filterType === t ? 'var(--military-green-highlight, #a4cbb4)' : '#94a3b8',
                padding: '4px 10px',
                borderRadius: '2px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '240px' }}>
          <Search size={12} color="#64748b" />
          <input
            type="text"
            placeholder="Filter sensor ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '10px',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Sensor Grid */}
      <div style={{
        flex: 1,
        padding: '14px',
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px'
      }}>
        {filteredSensors.map((s: TacticalSensorNode) => (
          <div
            key={s.id}
            style={{
              background: 'var(--bg-surface, #141518)',
              border: '1px solid var(--border-subtle, #23262e)',
              borderRadius: '2px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getSensorIcon(s.sensorType)}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc' }}>{s.id}</div>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>{s.name}</div>
                </div>
              </div>
              <span style={{
                background: s.status === 'online' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                border: `1px solid ${s.status === 'online' ? '#22c55e' : '#eab308'}`,
                color: s.status === 'online' ? '#86efac' : '#fde047',
                fontSize: '8px',
                fontWeight: 800,
                padding: '2px 5px',
                borderRadius: '2px'
              }}>
                {s.status.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px', background: 'var(--bg-card, #131417)', padding: '8px', borderRadius: '2px' }}>
              <div><span style={{ color: '#64748b' }}>RANGE:</span> <strong>{s.rangeKm} KM</strong></div>
              <div><span style={{ color: '#64748b' }}>QUALITY:</span> <strong style={{ color: '#22c55e' }}>{s.dataQuality}%</strong></div>
              <div><span style={{ color: '#64748b' }}>LAT:</span> {s.coordinates[0].toFixed(2)}°N</div>
              <div><span style={{ color: '#64748b' }}>LNG:</span> {s.coordinates[1].toFixed(2)}°E</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#64748b' }}>
              <span>LAST PING: {s.lastPing}</span>
              <button
                onClick={() => onNavigate('live_feeds')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--military-green-text, #84b699)',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                OPEN FEED →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
