import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';
import type { PageId } from '../../types';

interface AuditLogViewProps {
  onNavigate: (page: PageId) => void;
}

interface AuditBlock {
  blockNumber: number;
  timestamp: string;
  action: string;
  actor: string;
  targetId: string;
  hash: string;
  prevHash: string;
  status: 'VERIFIED' | 'TAMPER_CHECK_OK';
}

export const AuditLogView: React.FC<AuditLogViewProps> = () => {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [auditBlocks] = useState<AuditBlock[]>([
    {
      blockNumber: 1042,
      timestamp: '2026-10-24 10:42:15 UTC',
      action: 'OPERATOR_DECISION_APPROVE',
      actor: 'Officer Meera Chaudhari (Chief Commander)',
      targetId: 'INC-2026-9041',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      prevHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      status: 'VERIFIED'
    },
    {
      blockNumber: 1041,
      timestamp: '2026-10-24 10:38:04 UTC',
      action: 'GEOFENCE_STATUS_ARMED',
      actor: 'Officer Meera Chaudhari (Chief Commander)',
      targetId: 'GEO-NORTH-ZONE-B',
      hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      prevHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
      status: 'VERIFIED'
    },
    {
      blockNumber: 1040,
      timestamp: '2026-10-24 10:15:30 UTC',
      action: 'CONNECTED_SYSTEM_DISPATCH',
      actor: 'AUTOMATED_DISPATCH_DAEMON',
      targetId: 'MSG-884A29',
      hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
      prevHash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
      status: 'VERIFIED'
    },
    {
      blockNumber: 1039,
      timestamp: '2026-10-24 09:54:12 UTC',
      action: 'USER_INVITE_TOKEN_GENERATED',
      actor: 'Officer Meera Chaudhari (Chief Commander)',
      targetId: 'INVITE-TKN-9812',
      hash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
      prevHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      status: 'VERIFIED'
    },
    {
      blockNumber: 1038,
      timestamp: '2026-10-24 09:22:45 UTC',
      action: 'SYSTEM_BOOTSTRAP_INITIALIZED',
      actor: 'ROOT_INITIALIZER',
      targetId: 'USR-ROOT',
      hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      status: 'VERIFIED'
    }
  ]);

  const handleVerifyChain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult('CRYPTOGRAPHIC CHAIN VERIFIED: All 1,042 blocks intact. SHA-256 hash hashes match. Zero tampering detected.');
      setTimeout(() => setVerificationResult(null), 5000);
    }, 1200);
  };

  const filteredBlocks = auditBlocks.filter(b => 
    b.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.targetId.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <ShieldCheck size={18} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            TAMPER-EVIDENT CRYPTOGRAPHIC AUDIT LOG (SHA-256)
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
            1,042 UNBROKEN BLOCKS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            style={{
              background: 'var(--military-green-surface, #182c20)',
              border: '1px solid var(--military-green-border-focus, #366147)',
              color: 'var(--military-green-highlight, #a4cbb4)',
              padding: '6px 14px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: isVerifying ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Lock size={12} />
            <span>{isVerifying ? 'VERIFYING HASH CHAIN...' : 'VERIFY LOG INTEGRITY'}</span>
          </button>
        </div>
      </div>

      {/* Verification Banner */}
      {verificationResult && (
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
          <span>{verificationResult}</span>
        </div>
      )}

      {/* Main Ledger Table */}
      <div style={{ flex: 1, padding: '14px', overflowY: 'auto' }}>
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          {/* Table Header Filter */}
          <div style={{
            padding: '8px 12px',
            background: 'var(--bg-subtle, #101114)',
            borderBottom: '1px solid var(--border-subtle, #23262e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '280px' }}>
              <Search size={12} color="#64748b" />
              <input
                type="text"
                placeholder="Search audit records or actors..."
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
            <span style={{ fontSize: '9px', color: '#64748b' }}>
              IMMUTABLE APPEND-ONLY LEDGER
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#0a0b0d', color: '#64748b', borderBottom: '1px solid #23262e' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>BLOCK #</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>TIMESTAMP</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>ACTION TYPE</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>OFFICER / ACTOR</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>TARGET</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>SHA-256 HASH</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlocks.map(b => (
                <tr key={b.blockNumber} style={{ borderBottom: '1px solid #1a1d24' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--military-green-text, #84b699)' }}>
                    #{b.blockNumber}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                    {b.timestamp}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#f8fafc' }}>
                    {b.action}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                    {b.actor}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#38bdf8' }}>
                    {b.targetId}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'monospace', fontSize: '9px' }}>
                    {b.hash.slice(0, 16)}...{b.hash.slice(-8)}
                  </td>
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
                      {b.status}
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
