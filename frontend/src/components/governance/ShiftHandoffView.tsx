import React, { useState } from 'react';
import { 
  Repeat, 
  CheckCircle2 
} from 'lucide-react';
import type { PageId } from '../../types';

interface ShiftHandoffViewProps {
  onNavigate: (page: PageId) => void;
  currentUser?: { officer_name: string; role: string };
}

export const ShiftHandoffView: React.FC<ShiftHandoffViewProps> = ({
  currentUser = { officer_name: 'Meera Chaudhari', role: 'Chief Commander' }
}) => {
  const [incomingOfficer, setIncomingOfficer] = useState('Lt. Col. R. Verma');
  const [handoffNotes, setHandoffNotes] = useState('All sector perimeters nominal. INC-2026-9041 authorized and dispatched to Northern QRF. Keep high-altitude FLIR camera on stand-by during dusk.');
  const [isHandoffComplete, setIsHandoffComplete] = useState(false);

  const handleExecuteHandoff = (e: React.FormEvent) => {
    e.preventDefault();
    setIsHandoffComplete(true);
    setTimeout(() => setIsHandoffComplete(false), 5000);
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
          <Repeat size={18} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            COMMANDER WATCH SHIFT HANDOFF & CONTINUITY LEDGER
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
            CYCLE 03 (0600 - 1400)
          </span>
        </div>
      </div>

      {isHandoffComplete && (
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
          <span>OFFICIAL SHIFT HANDOFF SIGNED & COMMITTED TO CRYPTOGRAPHIC AUDIT LOG.</span>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        maxWidth: '900px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Officer Transfer Box */}
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px'
        }}>
          <div>
            <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 800 }}>OUTGOING WATCH COMMANDER</span>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
              {currentUser.officer_name}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--military-green-text, #84b699)' }}>
              {currentUser.role} • National Command HQ
            </div>
          </div>

          <div>
            <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 800 }}>INCOMING RELIEVING OFFICER</span>
            <select
              value={incomingOfficer}
              onChange={(e) => setIncomingOfficer(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-card, #131417)',
                border: '1px solid #23262e',
                color: '#f8fafc',
                padding: '6px 10px',
                borderRadius: '2px',
                fontSize: '11px',
                fontWeight: 700,
                marginTop: '4px',
                cursor: 'pointer'
              }}
            >
              <option value="Lt. Col. R. Verma">Lt. Col. R. Verma (Supervisor / Sector Ops)</option>
              <option value="Capt. A. Sen">Capt. A. Sen (Radar Watch Officer)</option>
              <option value="Dr. S. Bannerjee">Dr. S. Bannerjee (Senior Fusion Analyst)</option>
            </select>
          </div>
        </div>

        {/* Operational Theater Status at Handoff */}
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
            OPERATIONAL THEATER STATUS AT POINT OF HANDOVER
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '10px' }}>
            <div style={{ background: 'var(--bg-card, #131417)', padding: '10px', borderRadius: '2px' }}>
              <span style={{ color: '#64748b', display: 'block' }}>UNRESOLVED THREATS</span>
              <strong style={{ color: '#22c55e', fontSize: '13px' }}>0 UNATTENDED</strong>
            </div>
            <div style={{ background: 'var(--bg-card, #131417)', padding: '10px', borderRadius: '2px' }}>
              <span style={{ color: '#64748b', display: 'block' }}>ACTIVE SURVEILLANCE SENSORS</span>
              <strong style={{ color: 'var(--military-green-highlight, #a4cbb4)', fontSize: '13px' }}>4/4 OPERATIONAL</strong>
            </div>
            <div style={{ background: 'var(--bg-card, #131417)', padding: '10px', borderRadius: '2px' }}>
              <span style={{ color: '#64748b', display: 'block' }}>DISPATCHED C2 RECEIPT ACK</span>
              <strong style={{ color: '#38bdf8', fontSize: '13px' }}>100% CONFIRMED</strong>
            </div>
          </div>
        </div>

        {/* Mandatory Shift Notes & Submit */}
        <form onSubmit={handleExecuteHandoff} style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
            MANDATORY COMMANDER CONTINUITY NOTES
          </span>

          <textarea
            value={handoffNotes}
            onChange={(e) => setHandoffNotes(e.target.value)}
            style={{
              width: '100%',
              height: '80px',
              background: 'var(--bg-card, #131417)',
              border: '1px solid #23262e',
              borderRadius: '2px',
              color: '#f8fafc',
              padding: '10px',
              fontSize: '11px',
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'none'
            }}
          />

          <button
            type="submit"
            style={{
              alignSelf: 'flex-start',
              background: 'var(--military-green-surface, #182c20)',
              border: '1px solid var(--military-green-border-focus, #366147)',
              color: 'var(--military-green-highlight, #a4cbb4)',
              padding: '8px 18px',
              borderRadius: '2px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={13} />
            <span>SIGN & EXECUTE OFFICIAL SHIFT TRANSFER</span>
          </button>
        </form>
      </div>
    </div>
  );
};
