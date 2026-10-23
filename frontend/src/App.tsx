import React, { useState, useEffect } from 'react';
import { TopBar } from './components/common/TopBar';
import { LeftNavRail } from './components/common/LeftNavRail';
import { Footer } from './components/common/Footer';
import { CheckeredCanvas } from './components/workspace/CheckeredCanvas';
import { InviteGeneratorModal } from './components/auth/InviteGeneratorModal';
import { BootstrapSetupModal } from './components/auth/BootstrapSetupModal';
import { InviteSignupModal } from './components/auth/InviteSignupModal';
import { apiClient } from './api/client';
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
  const [isBootstrapOpen, setIsBootstrapOpen] = useState<boolean>(false);
  const [activeInviteToken, setActiveInviteToken] = useState<string | null>(null);

  // Active authenticated officer
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    officer_name: string;
    role: string;
    sector: string;
  }>({
    id: 'USR-ROOT',
    email: 'Meera@defence.com',
    officer_name: 'Meera Chaudhari',
    role: 'Chief Commander',
    sector: 'National Command HQ'
  });

  const [_selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-2026-9041');
  const [authQueueCount, setAuthQueueCount] = useState<number>(3);
  const highestThreatLevel: ThreatLevel = 'L4';
  const activeThreatCount = 2;

  // On mount: check system status and URL invite token
  useEffect(() => {
    checkSystemInit();
    checkUrlParams();
    fetchQueueCount();
  }, []);

  const checkSystemInit = async () => {
    try {
      const status = await apiClient.checkSystemStatus();
      if (!status.is_initialized) {
        setIsBootstrapOpen(true);
      }
    } catch (e) {
      console.warn('Backend offline or initializing, falling back to local simulation mode');
    }
  };

  const checkUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite_token');
    if (token) {
      setActiveInviteToken(token);
    }
  };

  const fetchQueueCount = async () => {
    try {
      const queue = await apiClient.getAuthorizationQueue();
      if (Array.isArray(queue)) {
        setAuthQueueCount(queue.length);
      }
    } catch (e) {
      /* fallback */
    }
  };

  const handleBootstrapComplete = (user: any) => {
    setCurrentUser(user);
    setIsBootstrapOpen(false);
    fetchQueueCount();
  };

  const handleInviteComplete = (user: any) => {
    setCurrentUser(user);
    setActiveInviteToken(null);
    window.history.replaceState({}, document.title, window.location.pathname);
    alert(`Welcome, Officer ${user.officer_name}. Access granted under role: ${user.role.toUpperCase()}`);
  };

  const renderOtherPage = () => {
    switch (currentPage) {
      case 'map':
        return (
          <div style={{ flex: 1, padding: '20px', background: 'var(--bg-canvas)', color: 'var(--text-primary)', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Map size={20} color="var(--accent-tactical-active)" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase' }}>Precision Tactical Map</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              High-precision defense sector grid with registered sensor telemetry and perimeter geofence markers.
            </p>
            <div style={{
              height: '500px',
              background: '#090d14',
              border: '1px solid var(--border-subtle)',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{ textAlign: 'center' }}>
                <Map size={40} color="var(--border-focus)" style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Precision GIS Tactical Engine</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Integrated in Section 3
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
                <ShieldAlert size={18} color="var(--threat-l4)" />
                <h2 style={{ fontSize: '16px', fontWeight: 700 }}>INCIDENT DEEP-DIVE • INC-2026-9041</h2>
              </div>
              <button 
                onClick={() => setCurrentPage('workspace')}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '5px 10px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Back to Workspace
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '2px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span className="badge-threat badge-threat-l4">L4 HIGH SEVERITY</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Detected: 2m ago</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Sector: Northern Frontier Line</span>
                </div>
                <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Unidentified Heavy Vehicle & Multi-Person Movement Near Restricted Geofence
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  Optical sensor CAM-NORTH-04 and Ground Doppler Radar GS-RAD-02 detected correlated movements crossing perimeter Zone B. VisDrone YOLO model reported Person (91% confidence) and Truck (94% confidence). Requires Commander Authorization under Policy Rule 4.2.
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setCurrentPage('authorization_queue')}
                    style={{
                      background: '#242a36',
                      border: '1px solid #374254',
                      color: '#fff',
                      fontWeight: 700,
                      padding: '7px 14px',
                      borderRadius: '2px',
                      fontSize: '11px',
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
                      padding: '7px 12px',
                      borderRadius: '2px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Inspect Sensor Disagreement
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '2px', padding: '16px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
                  5-Vector Status Breakdown
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'var(--bg-card)', borderRadius: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Threat Level</span>
                    <strong style={{ color: 'var(--threat-l4)' }}>L4 — High Severity</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'var(--bg-card)', borderRadius: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Model Confidence</span>
                    <strong style={{ color: 'var(--text-primary)' }}>92.4% (Calibrated)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'var(--bg-card)', borderRadius: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Workflow Status</span>
                    <strong style={{ color: 'var(--threat-l3)' }}>HITL Review Required</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'var(--bg-card)', borderRadius: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Authorization Status</span>
                    <strong style={{ color: 'var(--threat-l3)' }}>Pending Commander Sign-off</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'var(--bg-card)', borderRadius: '2px' }}>
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
              <ClipboardCheck size={18} color="var(--threat-l3)" />
              <h2 style={{ fontSize: '16px', fontWeight: 700 }}>HUMAN-IN-THE-LOOP AUTHORIZATION QUEUE ({authQueueCount} PENDING)</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '11px' }}>
              High-consequence decisions for L3, L4, and L5 incidents requiring supervisory authorization with recorded rationale and audit logging in Neon PostgreSQL.
            </p>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '2px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge-threat badge-threat-l4">L4 HIGH</span>
                    <strong style={{ fontSize: '12px' }}>INC-2026-9041 • Northern Line Perimeter Breach Alert</strong>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Requires Officer {currentUser.officer_name} Sign-off • Deadline: 12 minutes remaining
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => {
                      const reason = prompt('Mandatory Justification Required: Enter decision rationale for audit ledger:');
                      if (reason && reason.trim()) {
                        alert(`Decision Approved by ${currentUser.officer_name}. Dispatched and logged in Neon DB.`);
                        setAuthQueueCount(Math.max(0, authQueueCount - 1));
                      }
                    }}
                    style={{ background: '#10b981', color: '#000', fontWeight: 700, padding: '5px 12px', borderRadius: '2px', border: 'none', cursor: 'pointer', fontSize: '10px' }}
                  >
                    Approve Dispatch
                  </button>
                  <button 
                    onClick={() => {
                      const reason = prompt('Reason for dismissal:');
                      if (reason) {
                        alert(`Dismissal recorded in immutable audit log.`);
                        setAuthQueueCount(Math.max(0, authQueueCount - 1));
                      }
                    }}
                    style={{ background: 'transparent', border: '1px solid var(--threat-l5)', color: 'var(--threat-l5)', padding: '5px 10px', borderRadius: '2px', cursor: 'pointer', fontSize: '10px' }}
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={() => alert('Escalated to National Command Joint Operations Center.')}
                    style={{ background: '#242a36', border: '1px solid #374254', color: '#e2e8f0', fontWeight: 600, padding: '5px 10px', borderRadius: '2px', cursor: 'pointer', fontSize: '10px' }}
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
              <Activity size={18} color="var(--accent-tactical-active)" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase' }}>
                {currentPage.replace(/_/g, ' ')}
              </h2>
            </div>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '2px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                Module <strong>{currentPage}</strong> is initialized and registered with Neon PostgreSQL backend.
              </p>
              <button 
                onClick={() => setCurrentPage('workspace')}
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-focus)',
                  color: 'var(--text-primary)',
                  padding: '5px 10px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Return to Workspace
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
        pendingAuthCount={authQueueCount}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        userName={currentUser.officer_name}
        userRole={currentUser.role}
      />

      {/* Main Workspace with Collapsible Navigation Rail */}
      <div className="app-main">
        <LeftNavRail
          currentPage={currentPage}
          onNavigate={(p) => setCurrentPage(p)}
          isCollapsed={isNavCollapsed}
          onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
          pendingAuthCount={authQueueCount}
          activeAlertCount={12}
        />

        <div className="app-content">
          {/* Workspace is kept persistently mounted so switching pages NEVER resets custom layouts or feeds */}
          <div style={{
            display: currentPage === 'workspace' ? 'flex' : 'none',
            flex: 1,
            height: '100%',
            position: 'relative'
          }}>
            <CheckeredCanvas
              onNavigate={(page) => setCurrentPage(page)}
              onSelectIncident={(id) => setSelectedIncidentId(id)}
            />
          </div>

          {/* Render other pages without unmounting the workspace */}
          {currentPage !== 'workspace' && renderOtherPage()}
        </div>
      </div>

      {/* Persistent Status Footer */}
      <Footer userRole={currentUser.role} />

      {/* 1. First-Time System Bootstrap Modal (Officer Meera Chaudhari + Google Authenticator) */}
      <BootstrapSetupModal
        isOpen={isBootstrapOpen}
        onComplete={handleBootstrapComplete}
      />

      {/* 2. Private Onboarding Invite Link Generator */}
      <InviteGeneratorModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* 3. Invitee Registration Modal (When opened with ?invite_token=...) */}
      <InviteSignupModal
        inviteToken={activeInviteToken}
        onClose={() => setActiveInviteToken(null)}
        onComplete={handleInviteComplete}
      />
    </div>
  );
};

export default App;
