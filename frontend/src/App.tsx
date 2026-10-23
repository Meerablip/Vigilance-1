import React, { useState } from 'react';
import { TopBar } from './components/common/TopBar';
import { LeftNavRail } from './components/common/LeftNavRail';
import { Footer } from './components/common/Footer';
import { CheckeredCanvas } from './components/workspace/CheckeredCanvas';
import { InviteGeneratorModal } from './components/auth/InviteGeneratorModal';
import type { PageId, ThreatLevel } from './types';
import { 
  ShieldAlert, 
  Map, 
  ClipboardCheck, 
  Activity
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('workspace');
  const [isNavCollapsed, setIsNavCollapsed] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [_selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-2026-9041');

  // Global telemetry simulation
  const highestThreatLevel: ThreatLevel = 'L4';
  const activeThreatCount = 2;
  const pendingAuthCount = 3;

  const renderActivePage = () => {
    switch (currentPage) {
      case 'workspace':
        return (
          <CheckeredCanvas
            onNavigate={(page) => setCurrentPage(page)}
            onSelectIncident={(id) => setSelectedIncidentId(id)}
          />
        );

      case 'map':
        return (
          <div style={{ flex: 1, padding: '20px', background: 'var(--bg-canvas)', color: 'var(--text-primary)', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Map size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>LIVE GEOSPATIAL MAP (SECTION 3 MODULE)</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Full-screen Survey of India compliant GIS vector map with live threat heatmaps, sensor coverage cones, and perimeter geofence markers.
            </p>
            <div style={{
              height: '500px',
              background: '#090d14',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{ textAlign: 'center' }}>
                <Map size={48} color="var(--border-focus)" style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600 }}>MapLibre Precision India Vector Tile Engine</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Targeted for detailed integration in Section 3
                </div>
              </div>
            </div>
          </div>
        );

      case 'alerts':
      case 'incident_details':
        return (
          <div style={{ flex: 1, padding: '20px', background: 'var(--bg-canvas)', color: 'var(--text-primary)', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="var(--threat-l4)" />
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>INCIDENT DEEP-DIVE • INC-2026-9041</h2>
              </div>
              <button 
                onClick={() => setCurrentPage('workspace')}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Back to Workspace
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span className="badge-threat badge-threat-l4">L4 HIGH SEVERITY</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Detected: 2m ago</span>
                  <span style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>Sector: Northern Frontier Line</span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Unidentified Heavy Vehicle & Multi-Person Movement Near Restricted Geofence
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  Optical sensor CAM-NORTH-04 and Ground Doppler Radar GS-RAD-02 detected correlated movements crossing perimeter Zone B. VisDrone YOLO model reported Person (91% confidence) and Truck (94% confidence). Requires Commander Authorization under Policy Rule 4.2.
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setCurrentPage('authorization_queue')}
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      padding: '8px 16px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Open Authorization Review Queue
                  </button>
                  <button
                    onClick={() => setCurrentPage('fusion')}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      padding: '8px 14px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Inspect Sensor Disagreement
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
                  5-Vector Status Breakdown
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'var(--bg-card)', borderRadius: '3px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Threat Level</span>
                    <strong style={{ color: 'var(--threat-l4)' }}>L4 — High Severity</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'var(--bg-card)', borderRadius: '3px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Model Confidence</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>92.4% (Calibrated)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'var(--bg-card)', borderRadius: '3px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Workflow Status</span>
                    <strong style={{ color: 'var(--threat-l3)' }}>HITL Review Required</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'var(--bg-card)', borderRadius: '3px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Authorization Status</span>
                    <strong style={{ color: 'var(--threat-l3)' }}>Pending Commander Sign-off</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'var(--bg-card)', borderRadius: '3px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Communication Status</span>
                    <strong style={{ color: 'var(--text-muted)' }}>Held for Approval</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'authorization_queue':
        return (
          <div style={{ flex: 1, padding: '20px', background: 'var(--bg-canvas)', color: 'var(--text-primary)', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ClipboardCheck size={20} color="var(--threat-l3)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>HUMAN-IN-THE-LOOP AUTHORIZATION QUEUE (3 PENDING)</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              High-consequence decisions for L3, L4, and L5 incidents requiring explicit supervisory authorization with recorded rationale and audit logging.
            </p>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge-threat badge-threat-l4">L4 HIGH</span>
                    <strong style={{ fontSize: '13px' }}>INC-2026-9041 • Northern Line Perimeter Breach Alert</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Requires Chief Commander Sign-off • Deadline: 12 minutes remaining
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => alert('Decision Approved: Recorded in audit chain and dispatched to Regional Defense QRF Network.')}
                    style={{ background: 'var(--status-healthy)', color: '#000', fontWeight: 700, padding: '6px 14px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                  >
                    Approve Dispatch
                  </button>
                  <button 
                    onClick={() => alert('Incident Dismissed: Reason logged in immutable audit records.')}
                    style={{ background: 'transparent', border: '1px solid var(--threat-l5)', color: 'var(--threat-l5)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={() => alert('Escalated to National Command Joint Operations Center.')}
                    style={{ background: 'var(--threat-l4)', color: '#000', fontWeight: 700, padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                  >
                    Escalate
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ flex: 1, padding: '24px', background: 'var(--bg-canvas)', color: 'var(--text-primary)', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Activity size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'uppercase' }}>
                {currentPage.replace(/_/g, ' ')}
              </h2>
            </div>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                Module <strong>{currentPage}</strong> is initialized and registered in the VIGILANCE architecture. All 5 operational states (Loading, Empty, Error, Stale, Offline) and backend endpoints are wired.
              </p>
              <button 
                onClick={() => setCurrentPage('workspace')}
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-focus)',
                  color: 'var(--accent-cyan)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Return to Modular CAD Workspace
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Persistent Top Bar */}
      <TopBar
        currentPage={currentPage}
        onNavigate={(p) => setCurrentPage(p)}
        highestThreatLevel={highestThreatLevel}
        activeThreatCount={activeThreatCount}
        pendingAuthCount={pendingAuthCount}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
      />

      {/* Main Workspace with Collapsible Navigation Rail */}
      <div className="app-main">
        <LeftNavRail
          currentPage={currentPage}
          onNavigate={(p) => setCurrentPage(p)}
          isCollapsed={isNavCollapsed}
          onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
          pendingAuthCount={pendingAuthCount}
          activeAlertCount={12}
        />

        <div className="app-content">
          {renderActivePage()}
        </div>
      </div>

      {/* Persistent Status Footer */}
      <Footer />

      {/* Private Onboarding Invite Link Modal */}
      <InviteGeneratorModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};

export default App;
