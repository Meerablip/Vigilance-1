import React, { useState } from 'react';
import { 
  FileText, 
  Printer 
} from 'lucide-react';
import type { PageId } from '../../types';

interface ReportsViewProps {
  onNavigate: (page: PageId) => void;
  currentUser?: { officer_name: string; role: string };
}

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  currentUser = { officer_name: 'Meera Chaudhari', role: 'Chief Commander' } 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'daily' | 'aar' | 'sensors' | 'audit'>('daily');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExport = (format: 'PDF' | 'CSV') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setToastMessage(`${format} Intelligence Report compiled and downloaded successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
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
          <FileText size={18} color="var(--military-green-text, #84b699)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
            INTELLIGENCE REPORTS & AFTER-ACTION REVIEW (AAR) DOSSIERS
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleExport('CSV')}
            disabled={isExporting}
            style={{
              background: 'var(--bg-card, #131417)',
              border: '1px solid var(--border-subtle, #23262e)',
              color: '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: isExporting ? 'wait' : 'pointer'
            }}
          >
            EXPORT RAW CSV
          </button>
          <button
            onClick={() => handleExport('PDF')}
            disabled={isExporting}
            style={{
              background: 'var(--military-green-surface, #182c20)',
              border: '1px solid var(--military-green-border-focus, #366147)',
              color: 'var(--military-green-highlight, #a4cbb4)',
              padding: '6px 14px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: isExporting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={12} />
            <span>{isExporting ? 'COMPILING PDF...' : 'GENERATE PDF DOSSIER'}</span>
          </button>
        </div>
      </div>

      {/* Floating Status Toast */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(20, 23, 29, 0.95)',
          border: '1px solid var(--military-green-border-focus, #366147)',
          color: 'var(--military-green-highlight, #a4cbb4)',
          padding: '6px 14px',
          borderRadius: '2px',
          fontSize: '11px',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
          zIndex: 1000
        }}>
          {toastMessage}
        </div>
      )}

      {/* Main Split Grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '12px',
        padding: '14px',
        overflowY: 'auto'
      }}>
        {/* Template List */}
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>REPORT TEMPLATES</span>

          {[
            { id: 'daily' as const, title: 'Daily 24h Operational Threat Digest', desc: 'Full summary of all L1-L5 incidents and dispatched countermeasures.' },
            { id: 'aar' as const, title: 'L4/L5 Incursion After-Action Review', desc: 'Forensic deep-dive into high severity breaches and response latency.' },
            { id: 'sensors' as const, title: 'Multi-Sensor Health & Uptime Audit', desc: 'Optical, Doppler radar, and acoustic telemetry packet integrity.' },
            { id: 'audit' as const, title: 'Cryptographic Chain Audit Verification', desc: 'SHA-256 hash log of all operator authorizations and system overrides.' }
          ].map(t => (
            <div
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              style={{
                background: selectedTemplate === t.id ? 'var(--military-green-surface, #182c20)' : 'var(--bg-card, #131417)',
                border: `1px solid ${selectedTemplate === t.id ? 'var(--military-green-border-focus, #366147)' : '#1e2229'}`,
                padding: '10px',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', marginBottom: '3px' }}>{t.title}</div>
              <div style={{ fontSize: '9px', color: '#94a3b8', lineHeight: 1.3 }}>{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Report Preview Dossier */}
        <div style={{
          background: 'var(--bg-surface, #141518)',
          border: '1px solid var(--border-subtle, #23262e)',
          borderRadius: '2px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          overflowY: 'auto'
        }}>
          {/* Official Document Header */}
          <div style={{ borderBottom: '2px solid var(--military-green-border, #274734)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '9px', color: 'var(--military-green-text, #84b699)', fontWeight: 800, letterSpacing: '0.08em' }}>
                  CONFIDENTIAL • NATIONAL DEFENSE C2 TELEMETRY
                </span>
                <h1 style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0' }}>
                  VIGILANCE PLATFORM • SITUATION INTELLIGENCE REPORT
                </h1>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                  DOCUMENT REF: VIG-RPT-2026-OCT-24 | CLASSIFICATION: RESTRICTED
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '10px', color: '#94a3b8' }}>
                <div>DATE: 2026-10-24 10:45 UTC</div>
                <div>AUTHOR: <strong style={{ color: '#f8fafc' }}>{currentUser.officer_name}</strong></div>
              </div>
            </div>
          </div>

          {/* Report Executive Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--military-green-highlight, #a4cbb4)' }}>
              1. EXECUTIVE SUMMARY & SECTOR STATUS
            </span>
            <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
              Over the preceding 24-hour cycle, the VIGILANCE multimodal surveillance system processed 48 total sensor incursion events across Northern, Western, and Eastern command zones. 32 routine events (L1 & L2) were resolved via automated policy dispatch, while 16 events required Human-In-The-Loop review. All 8 high-severity incidents (L4 & L5) received commander authorization and dispatch confirmation to regional military networks.
            </p>
          </div>

          {/* Key Incident Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--military-green-highlight, #a4cbb4)' }}>
              2. KEY INCIDENT DISPATCH CHRONOLOGY
            </span>
            <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', background: 'var(--bg-card, #131417)' }}>
              <thead>
                <tr style={{ color: '#64748b', borderBottom: '1px solid #23262e' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>INCIDENT ID</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>SEVERITY</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>TARGET SUMMARY</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px' }}>CONFIDENCE</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #1a1d24' }}>
                  <td style={{ padding: '8px', fontWeight: 700 }}>INC-2026-9041</td>
                  <td style={{ padding: '8px', color: '#f97316', fontWeight: 800 }}>L4 HIGH</td>
                  <td style={{ padding: '8px', color: '#cbd5e1' }}>Armed Transport Convoy Breach in Northern Zone Beta</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>94.2%</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#22c55e' }}>DISPATCH CONFIRMED</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #1a1d24' }}>
                  <td style={{ padding: '8px', fontWeight: 700 }}>INC-2026-9039</td>
                  <td style={{ padding: '8px', color: '#eab308', fontWeight: 800 }}>L3 MODERATE</td>
                  <td style={{ padding: '8px', color: '#cbd5e1' }}>Naval Proximity Thermal Signature in Arabian Sea</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>88.5%</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#22c55e' }}>DISPATCH CONFIRMED</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #1a1d24' }}>
                  <td style={{ padding: '8px', fontWeight: 700 }}>INC-2026-9029</td>
                  <td style={{ padding: '8px', color: '#ef4444', fontWeight: 800 }}>L5 CRITICAL</td>
                  <td style={{ padding: '8px', color: '#cbd5e1' }}>High Security Strategic Vault Geofence Disruption</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>97.8%</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#38bdf8' }}>DUAL AUTH COMPLETE</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Digital Signature & Chain of Custody */}
          <div style={{ marginTop: '12px', borderTop: '1px solid #23262e', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
            <div>
              DIGITALLY CERTIFIED BY: <strong style={{ color: '#f8fafc' }}>{currentUser.officer_name}</strong>
              <div style={{ fontSize: '9px', color: '#64748b' }}>HASH: SHA256:7f4a2b9c81e3d09a24bb18ce679a</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              STATION: NATIONAL DEFENSE COMMAND HQ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
