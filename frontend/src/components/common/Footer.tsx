import React from 'react';
import { ShieldCheck, HardDrive, Keyboard } from 'lucide-react';

interface FooterProps {
  userRole?: string;
  shiftName?: string;
  isLive?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  userRole = 'Chief Commander',
  shiftName = 'Shift Alpha (08:00 - 16:00)',
  isLive = true
}) => {
  return (
    <footer style={{
      height: 'var(--footer-height)',
      background: 'var(--bg-canvas)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      fontSize: '11px',
      color: 'var(--text-muted)',
      userSelect: 'none',
      zIndex: 100
    }}>
      {/* Left: Role & Shift */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ShieldCheck size={12} color="var(--text-muted)" />
          <span>Active Role: <strong style={{ color: 'var(--text-secondary)' }}>{userRole}</strong></span>
        </div>
        <span>•</span>
        <div>{shiftName}</div>
        <span>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <HardDrive size={11} color="var(--status-healthy)" />
          <span>DB: <strong style={{ color: 'var(--text-secondary)' }}>SQLite (Local Sync Ready)</strong></span>
        </div>
      </div>

      {/* Center: Strict Prototype Disclaimer */}
      <div style={{ 
        color: 'var(--text-muted)', 
        fontSize: '10px', 
        letterSpacing: '0.4px',
        fontWeight: 500
      }}>
        VIGILANCE PROTOTYPE · FOR INTERNAL EVALUATION ONLY
      </div>

      {/* Right: State & Hotkeys */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isLive ? 'var(--status-healthy)' : 'var(--threat-l5)'
          }} />
          <span style={{ color: isLive ? 'var(--status-healthy)' : 'var(--threat-l5)' }}>
            {isLive ? 'SYSTEM SYNCHRONIZED' : 'OFFLINE'}
          </span>
        </div>
        <span>•</span>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          title="Press '?' for keyboard shortcuts"
        >
          <Keyboard size={12} />
          <span>Hotkeys [?]</span>
        </div>
      </div>
    </footer>
  );
};
