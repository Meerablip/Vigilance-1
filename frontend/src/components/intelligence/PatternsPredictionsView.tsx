import React from 'react';
import { 
  TrendingUp 
} from 'lucide-react';
import type { PageId } from '../../types';

interface PatternsPredictionsViewProps {
  onNavigate: (page: PageId) => void;
}

export const PatternsPredictionsView: React.FC<PatternsPredictionsViewProps> = ({ onNavigate }) => {
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
          <TrendingUp size={18} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            PREDICTIVE INTELLIGENCE & PATTERN RECOGNITION ENGINE
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
            AI FORECAST ACTIVE
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
          VIEW PREDICTIVE HEATMAP ON MAP
        </button>
      </div>

      {/* Main Content Grid */}
      <div style={{
        flex: 1,
        padding: '14px',
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '12px'
      }}>
        {[
          {
            cluster: 'SECTOR 4 NORTHERN BETA CONVOY CORRIDOR',
            risk: 'HIGH RISK (84% PROBABILITY)',
            riskColor: '#ef4444',
            window: '02:00 - 05:00 UTC (NOCTURNAL)',
            summary: 'Recurrent mechanized movement patterns detected on 4 of the last 6 nights. Ground Doppler Radar GS-02 detected identical 38 km/h approach vectors.',
            recommendedResponse: 'Pre-position Northern Command Quick Reaction Force (QRF) & deploy high-altitude thermal UAV patrol.'
          },
          {
            cluster: 'WESTERN MARITIME TRAWLER APPROACH CONE',
            risk: 'MODERATE RISK (72% PROBABILITY)',
            riskColor: '#f97316',
            window: '18:00 - 21:00 UTC (DUSK)',
            summary: 'Unregistered surface contacts consistently decelerate 12 nautical miles off Mumbai corridor, mimicking commercial fishing vessels.',
            recommendedResponse: 'Synchronize Naval Coastal Radar with AIS transponder anomaly alert filter.'
          },
          {
            cluster: 'SILIGURI FORWARD TRIPWIRE FREQUENCY SPIKE',
            risk: 'ELEVATED RISK (68% PROBABILITY)',
            riskColor: '#eab308',
            window: '11:00 - 14:00 UTC',
            summary: 'Acoustic seismic sensor arrays reported repeated 142 Hz combustion resonance matching heavy transport trucks.',
            recommendedResponse: 'Arm secondary optical PTZ tripwires with automatic slew-to-cue triggers.'
          }
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--bg-surface, #141518)',
              border: '1px solid var(--border-subtle, #23262e)',
              borderRadius: '2px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc' }}>{item.cluster}</span>
              <span style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${item.riskColor}`,
                color: item.riskColor,
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '2px'
              }}>
                {item.risk}
              </span>
            </div>

            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              FORECAST WINDOW: <strong style={{ color: '#cbd5e1' }}>{item.window}</strong>
            </div>

            <p style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.4, margin: 0 }}>
              {item.summary}
            </p>

            <div style={{
              background: 'var(--bg-card, #131417)',
              borderLeft: '2px solid var(--military-green-border-focus, #366147)',
              padding: '8px 10px',
              fontSize: '10px',
              color: 'var(--military-green-highlight, #a4cbb4)',
              lineHeight: 1.3
            }}>
              RECOMMENDED DOCTRINE: {item.recommendedResponse}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
