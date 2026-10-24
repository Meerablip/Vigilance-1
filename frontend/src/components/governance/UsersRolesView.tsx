import React, { useState } from 'react';
import { 
  Users, 
  UserPlus 
} from 'lucide-react';
import type { PageId } from '../../types';

interface UsersRolesViewProps {
  onNavigate?: (page: PageId) => void;
  onOpenInviteModal: () => void;
}

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({ 
  onNavigate: _onNavigate, 
  onOpenInviteModal 
}) => {
  const [users] = useState([
    {
      id: 'USR-ROOT',
      name: 'Meera Chaudhari',
      email: 'Meera@defence.com',
      role: 'Chief Commander',
      roleLevel: 'administrator',
      sector: 'National Command HQ',
      mfaStatus: 'TOTP ARMED',
      lastLogin: 'Live'
    },
    {
      id: 'USR-OP-01',
      name: 'Lt. Col. R. Verma',
      email: 'verma.ops@defence.com',
      role: 'Sector Commander',
      roleLevel: 'supervisor',
      sector: 'Northern Frontier Command (J&K)',
      mfaStatus: 'TOTP ARMED',
      lastLogin: '14m ago'
    },
    {
      id: 'USR-OP-02',
      name: 'Capt. A. Sen',
      email: 'sen.radar@defence.com',
      role: 'Radar Watch Officer',
      roleLevel: 'operator',
      sector: 'Western Naval Corridor (Mumbai)',
      mfaStatus: 'TOTP ARMED',
      lastLogin: '32m ago'
    },
    {
      id: 'USR-ANL-03',
      name: 'Dr. S. Bannerjee',
      email: 'bannerjee.fusion@defence.com',
      role: 'Senior Fusion Analyst',
      roleLevel: 'analyst',
      sector: 'Eastern Forward Perimeter (Siliguri)',
      mfaStatus: 'TOTP ARMED',
      lastLogin: '1h ago'
    },
    {
      id: 'USR-AUD-04',
      name: 'Maj. K. Nair',
      email: 'nair.audit@defence.com',
      role: 'Chief Security Auditor',
      roleLevel: 'auditor',
      sector: 'National Command HQ',
      mfaStatus: 'HARDWARE KEY',
      lastLogin: '2h ago'
    }
  ]);

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
          <Users size={18} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            PERSONNEL DIRECTORY & ROLE-BASED ACCESS CONTROL (RBAC)
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
            {users.length} CLEARED OFFICERS
          </span>
        </div>

        <button
          onClick={onOpenInviteModal}
          style={{
            background: 'var(--military-green-surface, #182c20)',
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
          <UserPlus size={12} />
          <span>INVITE OFFICER / GENERATE PRIVATE LINK</span>
        </button>
      </div>

      {/* Users Table */}
      <div style={{ flex: 1, padding: '14px', overflowY: 'auto' }}>
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#0a0b0d', color: '#64748b', borderBottom: '1px solid #23262e' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>OFFICER ID & NAME</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>ROLE & CLEARANCE</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>OPERATIONAL THEATER</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>MFA PROTOCOL</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>LAST ACTIVITY</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #1a1d24' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 800, color: '#f8fafc' }}>{u.name}</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>{u.email} ({u.id})</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      background: u.roleLevel === 'administrator' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      border: `1px solid ${u.roleLevel === 'administrator' ? '#ef4444' : '#22c55e'}`,
                      color: u.roleLevel === 'administrator' ? '#fca5a5' : '#86efac',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '2px'
                    }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                    {u.sector}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>
                      ● {u.mfaStatus}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#94a3b8' }}>
                    {u.lastLogin}
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
