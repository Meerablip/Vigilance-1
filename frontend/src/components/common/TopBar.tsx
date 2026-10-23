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
  Shield
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
}

export const TopBar: React.FC<TopBarProps> = ({
  currentPage: _currentPage,
  onNavigate,
  highestThreatLevel = 'L4',
  activeThreatCount = 2,
  pendingAuthCount = 3,
  onOpenInviteModal,
  userRole = 'Chief Commander',
  userName = 'Cmdr. R. Sharma'
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [selectedSector, setSelectedSector] = useState<string>('All Sectors (National)');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('Last 24 Hours');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      background: 'var(--bg-surface-elevated)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      gap: '12px',
      userSelect: 'none',
      zIndex: 100
    }}>
      {/* Left: Brand & Return to Workspace */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => onNavigate('workspace')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: '4px'
          }}
          title="Return to Main Workspace"
        >
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #00d2ff 0%, #0055ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: 900
          }}>
            <Shield size={16} strokeWidth={2.5} color="#05070a" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ 
              fontWeight: 800, 
              fontSize: '13px', 
              letterSpacing: '1px', 
              color: 'var(--text-primary)',
              lineHeight: 1.1
            }}>
              VIGILANCE
            </span>
            <span style={{ fontSize: '9px', color: 'var(--accent-cyan)', letterSpacing: '0.8px', fontWeight: 600 }}>
              C2 DEFENSE FUSION
            </span>
          </div>
        </button>

        {/* Active Highest Threat Indicator */}
        <div 
          onClick={() => onNavigate('alerts')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            borderRadius: '3px',
            background: 'var(--threat-l4-bg)',
            border: '1px solid rgba(249, 115, 22, 0.4)',
            cursor: 'pointer'
          }}
          title="Highest active threat level across monitored sectors"
        >
          <ShieldAlert size={14} color="var(--threat-l4)" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--threat-l4)', letterSpacing: '0.5px' }}>
            {highestThreatLevel} HIGH ({activeThreatCount})
          </span>
        </div>
      </div>

      {/* Center: Global Search & Quick Scope Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '640px' }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          padding: '0 8px',
          height: '30px',
          flex: 1
        }}>
          <Search size={13} color="var(--text-muted)" />
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
              fontSize: '12px',
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
          borderRadius: '4px',
          padding: '0 8px',
          height: '30px',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <MapPin size={12} color="var(--accent-cyan)" />
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
            <option value="All Sectors (National)">All Sectors (National)</option>
            <option value="Northern Frontier Command">Northern Frontier Command</option>
            <option value="Western Maritime Corridor">Western Maritime Corridor</option>
            <option value="Eastern Line Perimeter">Eastern Line Perimeter</option>
          </select>
        </div>

        {/* Time Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          padding: '0 8px',
          height: '30px',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <Clock size={12} color="var(--text-muted)" />
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
            <option value="Live Stream">Live Stream</option>
            <option value="Last 1 Hour">Last 1 Hour</option>
            <option value="Last 24 Hours">Last 24 Hours</option>
            <option value="Last 7 Days">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Right: Authorization Queue, Telemetry, Clock & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Authorization Queue quick button */}
        <button
          onClick={() => onNavigate('authorization_queue')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: pendingAuthCount > 0 ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
            border: pendingAuthCount > 0 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
            color: pendingAuthCount > 0 ? 'var(--threat-l3)' : 'var(--text-secondary)',
            borderRadius: '4px',
            padding: '4px 8px',
            height: '30px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title="Decisions awaiting human commander authorization"
        >
          <ClipboardCheck size={14} />
          <span>AUTHORIZATION</span>
          {pendingAuthCount > 0 && (
            <span style={{
              background: 'var(--threat-l3)',
              color: '#000',
              borderRadius: '9px',
              padding: '1px 5px',
              fontSize: '10px',
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
            gap: '5px',
            padding: '0 6px',
            height: '30px',
            cursor: 'pointer',
            fontSize: '11px',
            color: 'var(--status-healthy)'
          }}
          title="All 7 core services operational. GPU inference: 18ms latency."
        >
          <Activity size={13} color="var(--status-healthy)" />
          <span style={{ fontWeight: 600 }}>SYSTEM 100%</span>
        </div>

        {/* Live Network Sync */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: 'var(--accent-cyan)'
          }}
          title="Synchronized to defense high-bandwidth satellite uplink"
        >
          <Wifi size={13} />
          <span style={{ fontWeight: 600 }}>LIVE</span>
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
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Recent notifications"
        >
          <Bell size={16} />
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent-cyan)'
          }} />
        </button>

        {/* Server Clock */}
        <div style={{
          fontFamily: 'monospace',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          background: 'var(--bg-canvas)',
          padding: '4px 7px',
          borderRadius: '3px',
          border: '1px solid var(--border-subtle)',
          letterSpacing: '0.5px'
        }}>
          {currentTime || '00:00:00 IST'}
        </div>

        {/* User Profile & Private Invite Generation Trigger */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '4px 8px',
              height: '30px',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'var(--accent-blue-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-blue)'
            }}>
              <User size={12} />
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 600 }}>{userName}</div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{userRole}</div>
            </div>
            <ChevronDown size={12} color="var(--text-muted)" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div 
              style={{
                position: 'absolute',
                top: '36px',
                right: 0,
                width: '230px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-focus)',
                borderRadius: '4px',
                boxShadow: 'var(--shadow-panel)',
                padding: '6px',
                zIndex: 1000
              }}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{userName}</div>
                <div style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>Role: {userRole}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Shift: Alpha (08:00 - 16:00)</div>
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
                  gap: '8px',
                  background: 'rgba(0, 210, 255, 0.08)',
                  border: '1px solid rgba(0, 210, 255, 0.25)',
                  color: 'var(--accent-cyan)',
                  padding: '7px 10px',
                  borderRadius: '3px',
                  margin: '6px 0',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <UserPlus size={13} />
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
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  padding: '6px 8px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
                className="context-item"
              >
                <User size={13} />
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
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  padding: '6px 8px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
                className="context-item"
              >
                <Sliders size={13} />
                <span>Security & Settings</span>
              </button>

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  alert('Session secured and signed out.');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--threat-l5)',
                  padding: '6px 8px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
                className="context-item"
              >
                <LogOut size={13} />
                <span>Secure Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
