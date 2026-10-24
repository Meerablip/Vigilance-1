import React, { useState } from 'react';
import { 
  BarChart3, 
  Download 
} from 'lucide-react';
import type { PageId } from '../../types';

interface AnalyticsDashboardViewProps {
  onNavigate: (page: PageId) => void;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({ onNavigate }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

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
          <BarChart3 size={18} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            TACTICAL DEFENSE ANALYTICS & THREAT VELOCITY
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-card, #131417)', border: '1px solid var(--border-subtle, #23262e)', borderRadius: '2px', padding: '2px' }}>
            {(['24h', '7d', '30d'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                style={{
                  background: timeRange === t ? 'var(--military-green-surface, #182c20)' : 'transparent',
                  border: `1px solid ${timeRange === t ? 'var(--military-green-border, #274734)' : 'transparent'}`,
                  color: timeRange === t ? 'var(--military-green-highlight, #a4cbb4)' : '#94a3b8',
                  padding: '3px 8px',
                  borderRadius: '2px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate('reports')}
            style={{
              background: 'var(--military-green-surface, #182c20)',
              border: '1px solid var(--military-green-border, #274734)',
              color: 'var(--military-green-highlight, #a4cbb4)',
              padding: '6px 12px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={12} />
            <span>EXPORT METRICS DOSSIER</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        flex: 1,
        padding: '14px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[
            { label: 'TOTAL INCURSIONS RECORDED', value: '48', change: '+12% vs last cycle', color: '#f8fafc' },
            { label: 'HIGH-SEVERITY L4/L5 THREATS', value: '8', change: '100% HITL Authorized', color: '#ef4444' },
            { label: 'MEAN TIME TO RESOLUTION (MTTR)', value: '1.8 MIN', change: '-24s operational gain', color: '#22c55e' },
            { label: 'FALSE ALARM SUPPRESSION RATE', value: '97.6%', change: 'Calibrated AI threshold', color: 'var(--military-green-highlight, #a4cbb4)' }
          ].map((kpi, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-surface, #141518)',
                border: '1px solid var(--border-subtle, #23262e)',
                padding: '14px',
                borderRadius: '2px'
              }}
            >
              <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px' }}>{kpi.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: kpi.color, marginBottom: '4px' }}>{kpi.value}</div>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>{kpi.change}</div>
            </div>
          ))}
        </div>

        {/* 2-Column Analytics Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
          {/* Chart 1: Hourly Incursion Distribution */}
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
                HOURLY INCURSION TIMELINE & THREAT LEVEL BREAKDOWN
              </span>
              <div style={{ display: 'flex', gap: '8px', fontSize: '9px' }}>
                <span style={{ color: '#ef4444' }}>■ L5</span>
                <span style={{ color: '#f97316' }}>■ L4</span>
                <span style={{ color: '#eab308' }}>■ L3</span>
                <span style={{ color: '#06b6d4' }}>■ L2</span>
                <span style={{ color: '#10b981' }}>■ L1</span>
              </div>
            </div>

            {/* Simulated Histogram Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '6px', paddingTop: '10px' }}>
              {[
                { time: '00:00', l1: 2, l2: 1, l3: 0, l4: 0, l5: 0 },
                { time: '03:00', l1: 3, l2: 2, l3: 1, l4: 0, l5: 0 },
                { time: '06:00', l1: 4, l2: 3, l3: 2, l4: 1, l5: 0 },
                { time: '09:00', l1: 5, l2: 4, l3: 3, l4: 2, l5: 1 },
                { time: '12:00', l1: 6, l2: 3, l3: 2, l4: 1, l5: 0 },
                { time: '15:00', l1: 4, l2: 2, l3: 1, l4: 0, l5: 0 },
                { time: '18:00', l1: 7, l2: 5, l3: 4, l4: 3, l5: 1 },
                { time: '21:00', l1: 5, l2: 3, l3: 2, l4: 1, l5: 0 }
              ].map((slot, i) => {
                const total = slot.l1 + slot.l2 + slot.l3 + slot.l4 + slot.l5;
                return (
                  <div key={i} title={`Total incidents: ${total}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ width: '80%', display: 'flex', flexDirection: 'column-reverse', borderRadius: '1px', overflow: 'hidden' }}>
                      <div style={{ height: `${slot.l1 * 8}px`, background: '#10b981' }} />
                      <div style={{ height: `${slot.l2 * 8}px`, background: '#06b6d4' }} />
                      <div style={{ height: `${slot.l3 * 8}px`, background: '#eab308' }} />
                      <div style={{ height: `${slot.l4 * 8}px`, background: '#f97316' }} />
                      <div style={{ height: `${slot.l5 * 10}px`, background: '#ef4444' }} />
                    </div>
                    <span style={{ fontSize: '8px', color: '#64748b', marginTop: '6px' }}>{slot.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Sector Breakdown */}
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
              SECTOR INCURSION PROPORTIONS
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px' }}>
              {[
                { sector: 'Northern Frontier (J&K / Ladakh)', pct: 42, color: '#ef4444' },
                { sector: 'Western Naval Corridor (Mumbai)', pct: 26, color: '#f97316' },
                { sector: 'Eastern Forward Hub (Siliguri/Tawang)', pct: 18, color: '#eab308' },
                { sector: 'Central Strategic Depot (Capital)', pct: 14, color: '#06b6d4' }
              ].map((s, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ color: '#cbd5e1' }}>{s.sector}</span>
                    <strong style={{ color: s.color }}>{s.pct}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#1c1e23', borderRadius: '1px', overflow: 'hidden' }}>
                    <div style={{ width: `${s.pct}%`, height: '100%', background: s.color }} />
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
