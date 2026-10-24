import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Clock, 
  MapPin, 
  ClipboardCheck, 
  Activity, 
  Wifi, 
  Bell, 
  User, 
  ChevronDown,
  UserPlus,
  LogOut,
  Sliders,
  Download
} from 'lucide-react';
import type { ThreatLevel, PageId } from '../../types';

interface TopBarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  highestThreatLevel: ThreatLevel;
  activeThreatCount: number;
  pendingAuthCount: number;
  onOpenInviteModal: () => void;
  userRole?: string;
  userName?: string;
  onStartSimulation?: () => void;
  isSimulating?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentPage: _currentPage,
  onNavigate,
  highestThreatLevel = 'L4',
  activeThreatCount = 2,
  pendingAuthCount = 3,
  onOpenInviteModal,
  userRole = 'Chief Commander',
  userName = 'Cmdr. R. Sharma',
  onStartSimulation,
  isSimulating = false
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [selectedSector, setSelectedSector] = useState<string>('All Sectors');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('Last 24 Hours');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('Vigilance PWA installed by operator');
      }
      setDeferredPrompt(null);
    } else {
      alert('To install Vigilance as a PWA on your system:\n\n• In Chrome/Edge: Click the Install icon in the address bar (or Menu > "Install Vigilance")\n• On iOS/Safari: Tap Share > "Add to Home Screen"');
    }
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      gap: '12px',
      userSelect: 'none',
      zIndex: 100
    }}>
      {/* Left: Bold Huge V Logo (No text as requested) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button 
          onClick={() => onNavigate('workspace')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '2px'
          }}
          title="Return to Workspace"
        >
          {/* Bold Huge V Logo */}
          <div style={{
            width: '32px',
            height: '32px',
            background: 'var(--bg-card)',
            border: '1px solid var(--military-green-border)',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              fontFamily: "'Impact', 'Arial Black', -apple-system, sans-serif",
              fontSize: '22px',
              fontWeight: 900,
              color: 'var(--military-green-highlight)',
              lineHeight: 1,
              letterSpacing: '-1px'
            }}>
              V
            </span>
          </div>
        </button>

        {/* Active Highest Threat Indicator (Minimalist & Subdued) */}
        <div 
          onClick={() => onNavigate('alerts')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 7px',
            borderRadius: '2px',
            background: 'var(--threat-l4-bg)',
            border: '1px solid rgba(234, 88, 12, 0.3)',
            cursor: 'pointer'
          }}
          title="Highest active threat level across monitored sectors"
        >
          <ShieldAlert size={13} color="var(--threat-l4)" />
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--threat-l4)', letterSpacing: '0.4px' }}>
            {highestThreatLevel} HIGH ({activeThreatCount})
          </span>
        </div>
      </div>

      {/* Center: Global Search & Quick Scope Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '600px' }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '0 8px',
          height: '28px',
          flex: 1
        }}>
          <Search size={12} color="var(--text-muted)" />
          <input 
            type="text"
            placeholder="Search incident ID, sector, sensor or officer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '11px',
              width: '100%'
            }}
          />
        </div>

        {/* Location / Sector Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '0 6px',
          height: '28px',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <MapPin size={11} color="var(--text-muted)" />
          <select 
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <option style={{ background: '#121418', color: '#f1f5f9' }} value="All Sectors">All Sectors</option>
            <option style={{ background: '#121418', color: '#f1f5f9' }} value="Northern Frontier">Northern Frontier</option>
            <option style={{ background: '#121418', color: '#f1f5f9' }} value="Western Maritime">Western Maritime</option>
            <option style={{ background: '#121418', color: '#f1f5f9' }} value="Eastern Perimeter">Eastern Perimeter</option>
          </select>
        </div>

        {/* Time Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '0 6px',
          height: '28px',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <Clock size={11} color="var(--text-muted)" />
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <option style={{ background: '#121418', color: '#f1f5f9' }} value="Live">Live</option>
            <option style={{ background: '#121418', color: '#f1f5f9' }} value="Last 1 Hour">Last 1h</option>
            <option style={{ background: '#121418', color: '#f1f5f9' }} value="Last 24 Hours">Last 24h</option>
            <option style={{ background: '#121418', color: '#f1f5f9' }} value="Last 7 Days">Last 7d</option>
          </select>
        </div>
      </div>

      {/* Right: Authorization Queue, Telemetry, Clock & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Tactical AI Sensor Simulation Trigger */}
        {onStartSimulation && (
          <button
            onClick={onStartSimulation}
            disabled={isSimulating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isSimulating ? 'var(--bg-card)' : 'var(--military-green-surface)',
              border: isSimulating ? '1px solid var(--border-subtle)' : '1px solid var(--military-green-border)',
              color: isSimulating ? 'var(--text-muted)' : 'var(--military-green-highlight)',
              borderRadius: '2px',
              padding: '0 10px',
              height: '28px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              letterSpacing: '0.04em'
            }}
            title="Trigger real-time Hugging Face YOLO multi-sensor threat simulation"
          >
            <Activity size={12} className={isSimulating ? 'animate-spin' : ''} />
            <span>{isSimulating ? 'SIMULATING...' : '▶ START SIMULATION'}</span>
          </button>
        )}

        {/* Authorization Queue */}
        <button
          onClick={() => onNavigate('authorization_queue')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: pendingAuthCount > 0 ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
            border: pendingAuthCount > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
            color: pendingAuthCount > 0 ? 'var(--threat-l3)' : 'var(--text-secondary)',
            borderRadius: '2px',
            padding: '3px 7px',
            height: '28px',
            fontSize: '10px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title="Decisions awaiting human commander authorization"
        >
          <ClipboardCheck size={12} />
          <span>AUTHORIZATION</span>
          {pendingAuthCount > 0 && (
            <span style={{
              background: 'var(--threat-l3)',
              color: '#000',
              borderRadius: '2px',
              padding: '0 4px',
              fontSize: '9px',
              fontWeight: 800
            }}>
              {pendingAuthCount}
            </span>
          )}
        </button>

        {/* System Health */}
        <div 
          onClick={() => onNavigate('system_health')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '0 5px',
            height: '28px',
            cursor: 'pointer',
            fontSize: '10px',
            color: 'var(--status-healthy)'
          }}
          title="All core services operational"
        >
          <Activity size={12} color="var(--status-healthy)" />
          <span style={{ fontWeight: 600 }}>100%</span>
        </div>

        {/* Live Network Sync */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '10px',
            color: 'var(--text-secondary)'
          }}
          title="Synchronized to defense high-bandwidth satellite uplink"
        >
          <Wifi size={11} />
          <span style={{ fontWeight: 600 }}>SYNC</span>
        </div>

        {/* Notifications */}
        <button 
          onClick={() => onNavigate('alerts')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Recent notifications"
        >
          <Bell size={14} />
        </button>

        {/* PWA Install Button */}
        <button
          onClick={handleInstallClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 7px',
            background: 'var(--military-green-surface)',
            border: '1px solid var(--military-green-border)',
            borderRadius: '2px',
            color: 'var(--military-green-highlight)',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
          title="Install Vigilance as standalone Desktop/Mobile PWA"
        >
          <Download size={11} />
          <span>INSTALL APP</span>
        </button>

        {/* Server Clock */}
        <div style={{
          fontFamily: 'monospace',
          fontSize: '10px',
          color: 'var(--text-secondary)',
          background: 'var(--bg-canvas)',
          padding: '3px 6px',
          borderRadius: '2px',
          border: '1px solid var(--border-subtle)',
          letterSpacing: '0.4px'
        }}>
          {currentTime || '00:00:00 IST'}
        </div>

        {/* User Profile */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '2px',
              padding: '3px 7px',
              height: '28px',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '2px',
              background: '#242a36',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8'
            }}>
              <User size={10} />
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1 }}>
              <div style={{ fontSize: '10px', fontWeight: 600 }}>{userName}</div>
              <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{userRole}</div>
            </div>
            <ChevronDown size={10} color="var(--text-muted)" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div 
              style={{
                position: 'absolute',
                top: '32px',
                right: 0,
                width: '210px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-focus)',
                borderRadius: '2px',
                boxShadow: 'var(--shadow-panel)',
                padding: '4px',
                zIndex: 1000
              }}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div style={{ padding: '5px 7px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{userName}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Role: {userRole}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Shift: Alpha</div>
              </div>

              {/* Private Invite Link Action */}
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenInviteModal();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-focus)',
                  color: 'var(--text-primary)',
                  padding: '6px 8px',
                  borderRadius: '2px',
                  margin: '4px 0',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <UserPlus size={12} />
                <span>Generate Private Invite Link</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('users');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '6px 8px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover, #1f232b)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <User size={12} />
                <span>Users & Permissions</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('settings');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '6px 8px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover, #1f232b)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Sliders size={12} />
                <span>System Settings</span>
              </button>

              <div className="context-divider" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  alert('Session secured and signed out.');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--threat-l5)',
                  padding: '5px 8px',
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={12} />
                <span>Secure Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
