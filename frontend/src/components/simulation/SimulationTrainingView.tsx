import React, { useState } from 'react';
import { 
  Gamepad2, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Trophy 
} from 'lucide-react';
import type { PageId } from '../../types';

interface SimulationTrainingViewProps {
  onNavigate: (page: PageId) => void;
  onStartSimulation?: () => void;
  isSimulating?: boolean;
}

export const SimulationTrainingView: React.FC<SimulationTrainingViewProps> = ({ 
  onNavigate, 
  onStartSimulation, 
  isSimulating = false 
}) => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const scenarios = [
    {
      id: 'SCEN-L4-CONVOY',
      title: 'Mechanized Convoy Northern Perimeter Incursion',
      threatLevel: 'L4',
      description: 'Simulates 1x heavy transport vehicle and 4 personnel crossing Northern Zone Beta boundary at 38 km/h. Triggers optical YOLOv8 and Doppler radar correlation.',
      expectedAction: 'Commander Authorization & Fast Response Unit Dispatch'
    },
    {
      id: 'SCEN-L5-VAULT',
      title: 'Strategic Defense Vault Sovereign Boundary Breach',
      threatLevel: 'L5',
      description: 'Simulates high-altitude perimeter breach with explosive acoustic signature. Intercepts dual-officer command authorization protocol.',
      expectedAction: 'Two-Person Joint Operations Protocol Sign-off'
    },
    {
      id: 'SCEN-L3-JAMMING',
      title: 'Electronic Warfare & Radar Blind Spot Jamming',
      threatLevel: 'L3',
      description: 'Simulates intentional RF noise burst on Doppler Radar GS-02. Tests automatic fallback engine upweighting thermal and acoustic sensors.',
      expectedAction: 'Verify Sensor Disagreement Matrix & Fallback Route'
    },
    {
      id: 'SCEN-L4-MARITIME',
      title: 'Western Coast Unscheduled Naval Infiltration',
      threatLevel: 'L4',
      description: 'Simulates fast-attack craft moving at 32 knots toward restricted territorial waters. Optical camera and AIS transponder mismatch.',
      expectedAction: 'Coast Guard Intercept Vector Authorization'
    }
  ];

  const handleInjectScenario = (scen: typeof scenarios[0]) => {
    setActiveScenario(scen.id);
    if (onStartSimulation) {
      onStartSimulation();
    }
    setToastMessage(`SCENARIO INJECTED: ${scen.title}. Telemetry live across all 23 views.`);
    setTimeout(() => setToastMessage(null), 5000);
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
      {/* High-Visibility Military Simulation Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #78350f 0%, #b45309 50%, #78350f 100%)',
        color: '#fef3c7',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '0.06em',
        borderBottom: '1px solid #d97706',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={15} color="#fef3c7" />
          <span>TACTICAL WAR-GAMING & AI SANDBOX TRAINING ENVIRONMENT</span>
        </div>
        <span>SAFE ISOLATED SANDBOX • NO LIVE KINETIC DISPATCH</span>
      </div>

      {/* Header */}
      <div style={{
        height: '46px',
        background: 'var(--bg-surface-elevated, #181a1f)',
        borderBottom: '1px solid var(--border-subtle, #23262e)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gamepad2 size={16} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            SANDBOX SCENARIO INJECTOR & OPERATOR BENCHMARK
          </h2>
        </div>

        <button
          onClick={() => onNavigate('authorization_queue')}
          style={{
            background: 'var(--military-green-surface, #182c20)',
            border: '1px solid var(--military-green-border, #274734)',
            color: 'var(--military-green-highlight, #a4cbb4)',
            padding: '5px 12px',
            borderRadius: '2px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          OPEN AUTHORIZATION QUEUE →
        </button>
      </div>

      {toastMessage && (
        <div style={{
          background: 'rgba(24, 44, 32, 0.95)',
          borderBottom: '1px solid #22c55e',
          color: '#86efac',
          padding: '8px 20px',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700
        }}>
          <CheckCircle2 size={14} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Split Grid */}
      <div style={{
        flex: 1,
        padding: '14px',
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: '1.25fr 0.75fr',
        gap: '12px'
      }}>
        {/* Left: Scenarios Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
            AVAILABLE ADVERSARIAL INJECTION SCENARIOS
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scenarios.map(scen => (
              <div
                key={scen.id}
                style={{
                  background: 'var(--bg-surface, #141518)',
                  border: `1px solid ${activeScenario === scen.id ? 'var(--military-green-border-focus, #366147)' : 'var(--border-subtle, #23262e)'}`,
                  borderRadius: '2px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: scen.threatLevel === 'L5' ? '#7f1d1d' : scen.threatLevel === 'L4' ? '#c2410c' : '#854d0e',
                      color: '#fff',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '2px'
                    }}>
                      {scen.threatLevel}
                    </span>
                    <strong style={{ fontSize: '12px', color: '#f8fafc' }}>{scen.title}</strong>
                  </div>

                  <button
                    onClick={() => handleInjectScenario(scen)}
                    disabled={isSimulating}
                    style={{
                      background: isSimulating && activeScenario === scen.id ? '#7f1d1d' : 'var(--military-green-surface, #182c20)',
                      border: '1px solid var(--military-green-border, #274734)',
                      color: 'var(--military-green-highlight, #a4cbb4)',
                      padding: '5px 12px',
                      borderRadius: '2px',
                      fontSize: '10px',
                      fontWeight: 800,
                      cursor: isSimulating ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Play size={10} />
                    <span>{isSimulating && activeScenario === scen.id ? 'INJECTING...' : 'INJECT SCENARIO'}</span>
                  </button>
                </div>

                <p style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.4, margin: 0 }}>
                  {scen.description}
                </p>

                <div style={{ fontSize: '9px', color: '#64748b' }}>
                  EXPECTED OPERATOR WORKFLOW: <strong style={{ color: '#94a3b8' }}>{scen.expectedAction}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Trainee Benchmark & Scoreboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
            OPERATOR READINESS BENCHMARK
          </span>

          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={16} color="#eab308" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc' }}>OFFICER MEERA CHAUDHARI</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>CHIEF COMMANDER • NATIONAL C2 HQ</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px' }}>
              <div style={{ background: 'var(--bg-card, #131417)', padding: '8px', borderRadius: '2px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>READINESS SCORE</span>
                <strong style={{ color: '#22c55e', fontSize: '14px' }}>98.4%</strong>
              </div>
              <div style={{ background: 'var(--bg-card, #131417)', padding: '8px', borderRadius: '2px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>AVG DISPATCH LATENCY</span>
                <strong style={{ color: '#38bdf8', fontSize: '14px' }}>18 SECONDS</strong>
              </div>
            </div>

            <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.4 }}>
              Zero false authorization errors across 32 consecutive simulations. High-altitude UAV sweep deployment accuracy rated Top 1% Command Tier.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
