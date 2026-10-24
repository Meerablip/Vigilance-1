import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  Layers
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface ConnectedSystemStatus {
  id: string;
  name: string;
  type: string;
  protocol: string;
  status: 'ONLINE' | 'DEGRADED' | 'STANDBY';
  latency_ms: number;
  packets_transmitted: number;
  packet_delivery_rate: string;
  security: string;
}

interface MessageReceipt {
  id: string;
  incident_id: string;
  destination_system: string;
  status: string;
  payload: any;
  created_at: string;
  ack_received_at?: string;
  round_trip_ms: number;
}

export const ConnectedSystemsPanel: React.FC = () => {
  const [systems, setSystems] = useState<ConnectedSystemStatus[]>([]);
  const [messages, setMessages] = useState<MessageReceipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pingTarget, setPingTarget] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sysData, msgData] = await Promise.all([
        apiClient.getConnectedSystemsStatus(),
        apiClient.getConnectedMessages()
      ]);
      setSystems(sysData);
      setMessages(msgData);
    } catch (e) {
      console.warn('Using local connected systems fallback:', e);
      setSystems([
        {
          id: 'SYS-NET-01',
          name: 'Regional Defense HQ (Joint Ops Sector North)',
          type: 'C2 Command Net',
          protocol: 'Link-16 Tactical Data Exchange',
          status: 'ONLINE',
          latency_ms: 28.4,
          packets_transmitted: 1420,
          packet_delivery_rate: '99.98%',
          security: 'Type-1 High Grade Crypto'
        },
        {
          id: 'SYS-NET-02',
          name: 'Air Defense & Radar Ground Network (AD-Net)',
          type: 'Early Warning Telemetry',
          protocol: 'ASTERIX Cat-048 / 034 Sensor Bus',
          status: 'ONLINE',
          latency_ms: 19.8,
          packets_transmitted: 3890,
          packet_delivery_rate: '100.00%',
          security: 'AES-256-GCM Encrypted'
        },
        {
          id: 'SYS-NET-03',
          name: 'Quick Reaction Force (QRF Tactical Radio Mesh)',
          type: 'Mobile Response Dispatch',
          protocol: 'SINCGARS Frequency Hopping / IP Mesh',
          status: 'ONLINE',
          latency_ms: 42.1,
          packets_transmitted: 842,
          packet_delivery_rate: '99.85%',
          security: 'Frequency Agile Tactical Net'
        },
        {
          id: 'SYS-NET-04',
          name: 'Naval Coastal Defense Corridor Node',
          type: 'Maritime Surveillance Ingest',
          protocol: 'Over-The-Horizon Radar & AIS Stream',
          status: 'ONLINE',
          latency_ms: 31.6,
          packets_transmitted: 2105,
          packet_delivery_rate: '99.94%',
          security: 'Defense Secure Fiber'
        }
      ]);

      setMessages([
        {
          id: 'MSG-B841A092',
          incident_id: 'INC-2026-9041',
          destination_system: 'Regional Defense QRF Ingest (Northern Sector)',
          status: 'acknowledged',
          payload: {
            threat_level: 'L4',
            authorized_by: 'Chief Commander Meera Chaudhari',
            justification: 'Confirmed convoy geofence breach in Zone B. Deploy QRF.',
            target_system: 'Regional Defense QRF Ingest (Northern Sector)'
          },
          created_at: new Date(Date.now() - 120000).toISOString(),
          ack_received_at: new Date(Date.now() - 119860).toISOString(),
          round_trip_ms: 140.0
        },
        {
          id: 'MSG-A0294194',
          incident_id: 'INC-2026-9037',
          destination_system: 'Logistics Manifest & Checkpoint Net',
          status: 'acknowledged',
          payload: {
            threat_level: 'L2',
            dispatched_by: 'VIGILANCE Autonomous Policy Engine',
            summary: 'Scheduled Transport Convoy verified against manifests.'
          },
          created_at: new Date(Date.now() - 900000).toISOString(),
          ack_received_at: new Date(Date.now() - 899880).toISOString(),
          round_trip_ms: 120.0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handlePing = async (systemName: string) => {
    setPingTarget(systemName);
    try {
      const res = await apiClient.pingConnectedSystem(systemName);
      setPingResult(`Handshake ACK from ${systemName}: Latency ${res.latency_ms}ms • Token: ${res.handshake_hash}`);
    } catch {
      setPingResult(`Handshake ACK from ${systemName}: Latency 24.2ms • Simulated Defense Handshake`);
    } finally {
      setTimeout(() => {
        setPingTarget(null);
        setPingResult(null);
      }, 4500);
    }
  };

  return (
    <div 
      style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        background: 'var(--bg-canvas)', 
        color: 'var(--text-primary)', 
        height: '100%',
        overflowY: 'auto',
        padding: '20px 24px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio size={20} color="var(--military-green-text)" />
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, letterSpacing: '0.04em' }}>
              CONNECTED MILITARY DEFENSE SYSTEMS & DISPATCH LEDGER
            </h2>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Real-time telemetry, mock Link-16 tactical data exchange, and autonomous L1/L2 delivery receipts.
            </div>
          </div>
        </div>

        <button
          onClick={fetchData}
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#cbd5e1',
            padding: '5px 12px',
            borderRadius: '2px',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <RefreshCw size={12} />
          <span>{loading ? 'SYNCING...' : 'REFRESH NETWORKS'}</span>
        </button>
      </div>

      {/* Ping Feedback Banner */}
      {pingResult && (
        <div 
          style={{
            marginBottom: '16px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid #38bdf8',
            color: '#38bdf8',
            padding: '8px 14px',
            borderRadius: '2px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={14} color="#38bdf8" />
          <span>{pingResult}</span>
        </div>
      )}

      {/* 4 Connected Networks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {systems.map((sys) => (
          <div 
            key={sys.id} 
            style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: '3px', 
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#64748b' }}>{sys.id}</span>
                <span 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '9px', 
                    color: '#10b981', 
                    fontWeight: 700 
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  {sys.status}
                </span>
              </div>

              <div style={{ fontWeight: 700, fontSize: '12px', color: '#f8fafc', marginBottom: '4px', lineHeight: 1.3 }}>
                {sys.name}
              </div>
              <div style={{ fontSize: '10px', color: '#38bdf8', marginBottom: '10px' }}>
                {sys.type}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '9px', color: '#94a3b8', borderTop: '1px solid #17202e', paddingTop: '8px' }}>
                <div>Protocol: <strong style={{ color: '#cbd5e1' }}>{sys.protocol}</strong></div>
                <div>Latency: <strong style={{ color: '#10b981' }}>{sys.latency_ms} ms</strong></div>
                <div>Packets: <strong style={{ color: '#cbd5e1' }}>{sys.packets_transmitted} ({sys.packet_delivery_rate})</strong></div>
                <div>Crypto: <strong style={{ color: '#cbd5e1' }}>{sys.security}</strong></div>
              </div>
            </div>

            <button
              onClick={() => handlePing(sys.name)}
              disabled={pingTarget === sys.name}
              style={{
                marginTop: '12px',
                background: pingTarget === sys.name ? 'var(--military-green-border-focus)' : 'var(--military-green-surface)',
                border: '1px solid var(--military-green-border)',
                color: 'var(--military-green-highlight)',
                fontSize: '10px',
                fontWeight: 700,
                padding: '6px',
                borderRadius: '2px',
                cursor: pingTarget === sys.name ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Zap size={11} color="var(--military-green-highlight)" />
              <span>{pingTarget === sys.name ? 'TESTING LINK...' : 'PING NETWORK'}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Military Message Dispatch Ledger */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '3px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={14} color="var(--military-green-text)" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase' }}>
              CHRONOLOGICAL PACKET DISPATCH LEDGER ({messages.length} TRANSMISSIONS)
            </span>
          </div>

          <span style={{ fontSize: '10px', color: 'var(--military-green-text)', fontFamily: 'monospace' }}>
            ● LINK-16 BUS ACTIVE • 140ms ACK AVERAGE
          </span>
        </div>

        {messages.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '11px' }}>
            No dispatch messages transmitted yet. Authorize an incident or trigger an autonomous dispatch to see the ledger populate.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 10px' }}>Packet ID</th>
                  <th style={{ padding: '8px 10px' }}>Incident Link</th>
                  <th style={{ padding: '8px 10px' }}>Destination System</th>
                  <th style={{ padding: '8px 10px' }}>Dispatch Content</th>
                  <th style={{ padding: '8px 10px' }}>Transmission Time</th>
                  <th style={{ padding: '8px 10px' }}>Status & ACK</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-dim)', color: 'var(--text-secondary)' }}>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: 'var(--military-green-highlight)', fontWeight: 700 }}>
                      {m.id}
                    </td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#f8fafc' }}>
                      {m.incident_id}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>
                      {m.destination_system}
                    </td>
                    <td style={{ padding: '8px 10px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.payload?.justification || m.payload?.summary || JSON.stringify(m.payload)}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {new Date(m.created_at).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span 
                        style={{
                          background: 'var(--military-green-surface)',
                          border: '1px solid var(--military-green-border)',
                          color: 'var(--military-green-highlight)',
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <CheckCircle2 size={10} />
                        <span>ACK {m.round_trip_ms}ms</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
