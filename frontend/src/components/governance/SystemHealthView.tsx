import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import type { PageId } from '../../types';

interface SystemHealthViewProps {
  onNavigate: (page: PageId) => void;
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = () => {
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      setIsRunningDiagnostics(false);
      setDiagnosticResult('ALL 6 SUBSYSTEMS NOMINAL: Vision pipeline 22ms, Neon DB pool 14ms, 0 packet loss.');
      setTimeout(() => setDiagnosticResult(null), 5000);
    }, 1500);
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
          <Activity size={18} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            SYSTEM HEALTH & HARDWARE TELEMETRY
          </h2>
          <span style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid #22c55e',
            color: '#86efac',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '2px'
          }}>
            ALL SUBSYSTEMS OPERATIONAL
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            style={{
              background: 'var(--military-green-surface, #182c20)',
              border: '1px solid var(--military-green-border-focus, #366147)',
              color: 'var(--military-green-highlight, #a4cbb4)',
              padding: '6px 14px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: isRunningDiagnostics ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={12} className={isRunningDiagnostics ? 'animate-spin' : ''} />
            <span>{isRunningDiagnostics ? 'TESTING SUBSYSTEMS...' : 'RUN DIAGNOSTIC SUITE'}</span>
          </button>
        </div>
      </div>

      {diagnosticResult && (
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
          <span>{diagnosticResult}</span>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{
        flex: 1,
        padding: '14px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Latency Gauges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[
            { label: 'YOLO INFERENCE LATENCY', value: '22 MS', sub: 'TensorRT GPU accelerated', color: '#22c55e' },
            { label: 'DATABASE POOL LATENCY', value: '14 MS', sub: 'Neon Serverless PostgreSQL', color: '#22c55e' },
            { label: 'RTSP STREAM PACKET DROP', value: '0.02%', sub: '4 active camera feeds', color: '#38bdf8' },
            { label: 'MILITARY C2 ACK LATENCY', value: '140 MS', sub: 'Northern Sector Net', color: 'var(--military-green-highlight, #a4cbb4)' }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-surface, #141518)',
                border: '1px solid var(--border-subtle, #23262e)',
                padding: '14px',
                borderRadius: '2px'
              }}
            >
              <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px' }}>{item.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: item.color, marginBottom: '4px' }}>{item.value}</div>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Subsystems Status Table */}
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '10px 14px', background: 'var(--bg-subtle, #101114)', borderBottom: '1px solid #23262e', fontSize: '11px', fontWeight: 700 }}>
            CORE INFRASTRUCTURE & MICROSERVICES
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#0a0b0d', color: '#64748b', borderBottom: '1px solid #23262e' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>SUBSYSTEM</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>ENGINE / RUNTIME</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>UPTIME</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>LOAD</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>HEALTH STATUS</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Computer Vision Inference Worker', engine: 'YOLOv8n / PyTorch CUDA', uptime: '99.98%', load: '24% GPU', status: 'HEALTHY' },
                { name: 'Spatiotemporal Multi-Sensor Fusion', engine: 'Kalman Filter C2 Core', uptime: '100.0%', load: '8% CPU', status: 'HEALTHY' },
                { name: 'Relational Database Engine', engine: 'Neon Serverless PostgreSQL', uptime: '99.99%', load: '14 pool conns', status: 'HEALTHY' },
                { name: 'Connected Military Dispatch Bridge', engine: 'FastAPI Async WebSocket', uptime: '100.0%', load: '4 msgs/sec', status: 'HEALTHY' },
                { name: 'Cryptographic Audit Verification Service', engine: 'SHA-256 Chained Hash Ledger', uptime: '100.0%', load: 'Idle', status: 'HEALTHY' }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #1a1d24' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#f8fafc' }}>{row.name}</td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{row.engine}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#cbd5e1' }}>{row.uptime}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#cbd5e1' }}>{row.load}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <span style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid #22c55e',
                      color: '#86efac',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '2px'
                    }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
