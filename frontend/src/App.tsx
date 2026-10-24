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
import { PrecisionIndiaMap } from './components/map/PrecisionIndiaMap';
import { TacticalVideoFeed, TACTICAL_FEEDS } from './components/feeds/TacticalVideoFeed';
import { AuthorizationQueueDesk } from './components/decision/AuthorizationQueueDesk';
import { ConnectedSystemsPanel } from './components/decision/ConnectedSystemsPanel';
import { 
  ShieldAlert, 
  Activity,
  AlertOctagon,
  X,
  Video,
  Grid,
  Maximize2
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

  // AI Recon Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationToast, setSimulationToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    threatLevel: ThreatLevel;
  } | null>(null);

  // Live Surveillance Feeds Wall State
  const [soloFeedId, setSoloFeedId] = useState<string | null>(null);
  const [feedsViewMode, setFeedsViewMode] = useState<'grid' | 'solo'>('grid');

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

  const handleStartSimulation = async () => {
    setIsSimulating(true);
    try {
      await apiClient.evaluateThreat({
        threat_level: 'L4',
        confidence: 91.8,
        location_id: 'LOC-NORTH-01',
        summary: 'AI RECON DETECTED: Armed Convoy Incursion in Northern Zone Beta',
        description: 'Ready-to-use Hugging Face YOLOv8 VisDrone model detected 1x Transport Truck, 4x Personnel crossing perimeter 34.1450°N, 74.7300°E. Correlated with GS-02 Radar velocity. Auto-evaluated as L4 High Threat.',
        sensors_contributing: ['CAM-NORTH-04', 'RAD-NORTH-02', 'THM-NORTH-03']
      });

      setAuthQueueCount(prev => prev + 1);
      setSimulationToast({
        show: true,
        title: 'L4 THREAT INGESTION SIMULATED',
        message: 'Hugging Face YOLOv8 detected breach. Incident committed to Neon DB & routed to Officer Meera Chaudhari review queue.',
        threatLevel: 'L4'
      });
    } catch (e) {
      console.warn('Simulation backend call failed, falling back to local simulation:', e);
      setAuthQueueCount(prev => prev + 1);
      setSimulationToast({
        show: true,
        title: 'L4 THREAT INGESTION SIMULATED',
        message: 'Multi-sensor perimeter breach registered. Incident routed to Officer Meera Chaudhari review queue.',
        threatLevel: 'L4'
      });
    } finally {
      setTimeout(() => {
        setIsSimulating(false);
      }, 1200);
      setTimeout(() => {
        setSimulationToast(null);
      }, 7000);
    }
  };

  const renderOtherPage = () => {
    switch (currentPage) {
      case 'map':
        return (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#090A0D', position: 'relative', overflow: 'hidden' }}>
            <PrecisionIndiaMap
              compact={false}
              onSelectIncident={(incId) => {
                setSelectedIncidentId(incId);
                setCurrentPage('incident_details');
              }}
              onStartSimulation={handleStartSimulation}
              isSimulating={isSimulating}
            />
          </div>
        );

      case 'live_feeds':
        return (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#090a0d', color: '#e2e8f0', overflow: 'hidden' }}>
            {/* Header Toolbar */}
            <div style={{
              height: '42px',
              background: '#0d1117',
              borderBottom: '1px solid #1e2633',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Video size={16} color="#38bdf8" />
                <h2 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', margin: 0, textTransform: 'uppercase' }}>
                  TACTICAL SURVEILLANCE & UAV RECONNAISSANCE WALL
                </h2>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#38bdf8',
                  fontSize: '9px',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  fontFamily: 'monospace'
                }}>
                  HF MODEL: keremberke/yolov8n-visdrone (CPU AVX-512)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', background: '#1e293b', borderRadius: '2px', border: '1px solid #334155' }}>
                  <button
                    onClick={() => {
                      setFeedsViewMode('grid');
                      setSoloFeedId(null);
                    }}
                    style={{
                      background: feedsViewMode === 'grid' ? '#0284c7' : 'transparent',
                      border: 'none',
                      color: feedsViewMode === 'grid' ? '#fff' : '#94a3b8',
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Grid size={12} />
                    <span>2x2 QUAD GRID</span>
                  </button>
                  <button
                    onClick={() => {
                      setFeedsViewMode('solo');
                      if (!soloFeedId) setSoloFeedId('CAM-NORTH-04');
                    }}
                    style={{
                      background: feedsViewMode === 'solo' ? '#0284c7' : 'transparent',
                      border: 'none',
                      color: feedsViewMode === 'solo' ? '#fff' : '#94a3b8',
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Maximize2 size={12} />
                    <span>SOLO FOCUS</span>
                  </button>
                </div>

                <button
                  onClick={handleStartSimulation}
                  disabled={isSimulating}
                  style={{
                    background: isSimulating ? '#7f1d1d' : '#dc2626',
                    border: '1px solid #ef4444',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '2px',
                    fontSize: '10px',
                    fontWeight: 800,
                    cursor: isSimulating ? 'wait' : 'pointer'
                  }}
                >
                  {isSimulating ? 'INFERENCE SIMULATING...' : 'SIMULATE BREACH (HF)'}
                </button>
              </div>
            </div>

            {/* Content Viewport */}
            {feedsViewMode === 'solo' ? (
              <div style={{ flex: 1, position: 'relative' }}>
                <TacticalVideoFeed
                  feedId={soloFeedId || 'CAM-NORTH-04'}
                  compact={false}
                  onFeedSelect={(id) => setSoloFeedId(id)}
                  onTriggerIncident={(id) => {
                    setSelectedIncidentId(id);
                    setAuthQueueCount(prev => prev + 1);
                  }}
                  onNavigate={(page) => setCurrentPage(page)}
                />
              </div>
            ) : (
              <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gridTemplateRows: 'repeat(2, 1fr)',
                gap: '4px',
                padding: '4px',
                background: '#04060a'
              }}>
                {TACTICAL_FEEDS.map((f) => (
                  <div 
                    key={f.id} 
                    style={{ 
                      position: 'relative', 
                      border: '1px solid #1e2633', 
                      borderRadius: '2px', 
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      zIndex: 10
                    }}>
                      <button
                        onClick={() => {
                          setSoloFeedId(f.id);
                          setFeedsViewMode('solo');
                        }}
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          color: '#38bdf8',
                          padding: '3px 6px',
                          borderRadius: '2px',
                          fontSize: '9px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Maximize2 size={10} />
                        <span>SOLO</span>
                      </button>
                    </div>
                    <TacticalVideoFeed
                      feedId={f.id}
                      compact={true}
                      onTriggerIncident={(id) => {
                        setSelectedIncidentId(id);
                        setAuthQueueCount(prev => prev + 1);
                      }}
                      onNavigate={(page) => setCurrentPage(page)}
                    />
                  </div>
                ))}
              </div>
            )}
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
          <AuthorizationQueueDesk
            currentUser={currentUser}
            onSelectIncident={(incId) => {
              setSelectedIncidentId(incId);
              setCurrentPage('incident_details');
            }}
          />
        );

      case 'connected_systems':
        return <ConnectedSystemsPanel />;

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
        onStartSimulation={handleStartSimulation}
        isSimulating={isSimulating}
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

      {/* 4. Tactical Threat Ingestion Toast Notification */}
      {simulationToast && simulationToast.show && (
        <div style={{
          position: 'fixed',
          top: '52px',
          right: '16px',
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1.5px solid var(--threat-l4)',
          borderRadius: '2px',
          padding: '12px 14px',
          width: '380px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
          display: 'flex',
          gap: '10px'
        }}>
          <AlertOctagon size={20} color="var(--threat-l4)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--threat-l4)', letterSpacing: '0.05em' }}>
                {simulationToast.title}
              </span>
              <button
                onClick={() => setSimulationToast(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={12} />
              </button>
            </div>
            <div style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '4px', lineHeight: '1.4' }}>
              {simulationToast.message}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  setCurrentPage('authorization_queue');
                  setSimulationToast(null);
                }}
                style={{
                  background: 'var(--threat-l4)',
                  color: '#000',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '2px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                REVIEW IN QUEUE
              </button>
              <button
                onClick={() => {
                  setCurrentPage('map');
                  setSimulationToast(null);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #475569',
                  color: '#cbd5e1',
                  padding: '3px 8px',
                  borderRadius: '2px',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                VIEW ON SOI MAP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
