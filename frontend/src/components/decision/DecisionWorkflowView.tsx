import React from 'react';
import { 
  Workflow 
} from 'lucide-react';
import type { PageId } from '../../types';

interface DecisionWorkflowViewProps {
  onNavigate: (page: PageId) => void;
}

export const DecisionWorkflowView: React.FC<DecisionWorkflowViewProps> = ({ onNavigate }) => {
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
          <Workflow size={18} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            5-TIER DECISION POLICY WORKFLOW & ESCALATION ARCHITECTURE
          </h2>
        </div>

        <button
          onClick={() => onNavigate('authorization_queue')}
          style={{
            background: 'var(--military-green-surface, #182c20)',
            border: '1px solid var(--military-green-border, #274734)',
            color: 'var(--military-green-highlight, #a4cbb4)',
            padding: '6px 14px',
            borderRadius: '2px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          OPEN AUTHORIZATION QUEUE →
        </button>
      </div>

      {/* Workflow Visual Flow */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Tier Card 1: L1 & L2 Autonomous Path */}
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid #22c55e',
              color: '#86efac',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '2px'
            }}>
              PATH A: AUTONOMOUS POLICY DISPATCH (LEVEL 1 & LEVEL 2)
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>EXECUTION LATENCY: &lt; 500MS</span>
          </div>

          <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4, margin: '4px 0' }}>
            Routine calibration pings, minor boundary sensor noise, and scheduled checkpoint verifications are automatically cross-checked against authorized transponder databases. Packets are dispatched immediately to simulated military networks with automatic ACK receipt tracking.
          </p>

          <div style={{
            background: 'var(--bg-card, #131417)',
            padding: '8px 12px',
            borderRadius: '2px',
            fontSize: '10px',
            color: '#94a3b8'
          }}>
            AUTOMATIC FALLBACK TRIGGER: If sensor data quality drops &lt; 85% or primary optical/radar disagree, event is automatically escalated to HITL Queue.
          </div>
        </div>

        {/* Tier Card 2: L3 & L4 Human-In-The-Loop Path */}
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'rgba(249, 115, 22, 0.2)',
              border: '1px solid #f97316',
              color: '#fdba74',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '2px'
            }}>
              PATH B: HUMAN-IN-THE-LOOP (HITL) QUEUE (LEVEL 3 & LEVEL 4)
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>COMMANDER SIGN-OFF MANDATORY</span>
          </div>

          <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4, margin: '4px 0' }}>
            Moderate to high priority incursions (e.g. armed transport convoys, unscheduled vessels in naval corridors). Held in priority-ranked queue. Requires written commander rationale before action dispatch (Approve Dispatch, Escalate to Joint Ops, Request UAV Sweep, Dismiss).
          </p>
        </div>

        {/* Tier Card 3: L5 Two-Person Authorization Protocol */}
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '2px'
            }}>
              PATH C: TWO-PERSON DUAL-COMMAND AUTHORIZATION (LEVEL 5 CRITICAL)
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>NATIONAL COMMAND DISPATCH</span>
          </div>

          <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4, margin: '4px 0' }}>
            Highest-severity threats (e.g., Strategic Vault breach, multi-vector sovereign boundary assault). Enforces mandatory concurrent authorization from two independent senior officers (Authorizing Officer + Second Watch Officer / Joint Ops Commander) with dual cryptographic token validation.
          </p>
        </div>
      </div>
    </div>
  );
};
