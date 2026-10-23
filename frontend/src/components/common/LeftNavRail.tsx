import React from 'react';
import {
  LayoutDashboard,
  Map,
  MapPin,
  Radio,
  Video,
  AlertTriangle,
  FileSearch,
  ClipboardCheck,
  GitMerge,
  History,
  TrendingUp,
  BarChart3,
  FileText,
  Cpu,
  Boxes,
  Users,
  ShieldCheck,
  Activity,
  Settings,
  Gamepad2,
  Repeat,
  Workflow,
  Network,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { PageId } from '../../types';

interface LeftNavRailProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingAuthCount: number;
  activeAlertCount: number;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ size: number; color?: string; className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  category: 'Surveillance' | 'Intelligence' | 'Decisions' | 'Analysis' | 'System' | 'Admin';
}

const navItems: NavItem[] = [
  // Surveillance
  { id: 'workspace', label: 'Workspace', icon: LayoutDashboard, category: 'Surveillance' },
  { id: 'map', label: 'Live Map', icon: Map, category: 'Surveillance' },
  { id: 'locations', label: 'Locations', icon: MapPin, category: 'Surveillance' },
  { id: 'sensors', label: 'Sensors', icon: Radio, category: 'Surveillance' },
  { id: 'live_feeds', label: 'Live Feeds', icon: Video, category: 'Surveillance' },

  // Intelligence & Alerts
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: 12, badgeColor: 'var(--threat-l4)', category: 'Intelligence' },
  { id: 'incident_details', label: 'Incident Details', icon: FileSearch, category: 'Intelligence' },
  { id: 'fusion', label: 'Data Fusion', icon: GitMerge, category: 'Intelligence' },
  { id: 'playback', label: 'Incident Playback', icon: History, category: 'Intelligence' },
  { id: 'patterns', label: 'Patterns & Predictions', icon: TrendingUp, category: 'Intelligence' },

  // Decisions & Response
  { id: 'authorization_queue', label: 'Authorization Queue', icon: ClipboardCheck, badge: 3, badgeColor: 'var(--threat-l3)', category: 'Decisions' },
  { id: 'decision_workflow', label: 'Decision Workflow', icon: Workflow, category: 'Decisions' },
  { id: 'connected_systems', label: 'Connected Systems', icon: Network, category: 'Decisions' },

  // Analysis
  { id: 'analytics', label: 'Analytics', icon: BarChart3, category: 'Analysis' },
  { id: 'reports', label: 'Reports', icon: FileText, category: 'Analysis' },
  { id: 'models', label: 'Agents & Models', icon: Cpu, category: 'Analysis' },
  { id: 'zones', label: 'Zones & Geofences', icon: Boxes, category: 'Analysis' },

  // System & Governance
  { id: 'users', label: 'Users & Roles', icon: Users, category: 'Admin' },
  { id: 'audit_log', label: 'Audit Log', icon: ShieldCheck, category: 'Admin' },
  { id: 'system_health', label: 'System Health', icon: Activity, category: 'System' },
  { id: 'settings', label: 'Settings', icon: Settings, category: 'System' },
  { id: 'simulation', label: 'Simulation & Training', icon: Gamepad2, category: 'System' },
  { id: 'shift_handoff', label: 'Shift Handoff', icon: Repeat, category: 'System' },
];

export const LeftNavRail: React.FC<LeftNavRailProps> = ({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  pendingAuthCount,
  activeAlertCount
}) => {
  return (
    <aside
      style={{
        width: isCollapsed ? 'var(--navrail-collapsed)' : 'var(--navrail-expanded)',
        height: '100%',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        userSelect: 'none',
        zIndex: 90
      }}
    >
      {/* Collapse/Expand Toggle Header */}
      <div style={{
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        padding: isCollapsed ? '0' : '0 10px',
        borderBottom: '1px solid var(--border-dim)'
      }}>
        {!isCollapsed && (
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            COMMAND NAVIGATION
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={isCollapsed ? 'Expand Navigation Rail' : 'Collapse Navigation Rail'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav List with smooth scroll */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 4px' }}>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          const badgeValue = item.id === 'authorization_queue' 
            ? pendingAuthCount 
            : item.id === 'alerts' 
            ? activeAlertCount 
            : item.badge;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: isCollapsed ? '9px 0' : '8px 10px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                background: isActive ? 'var(--bg-card-hover)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                borderRadius: '3px',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                marginBottom: '2px',
                transition: 'all 0.15s',
                textAlign: 'left'
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <div style={{
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '20px'
              }}>
                <Icon size={16} />
              </div>

              {!isCollapsed && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.label}
                  </span>

                  {badgeValue !== undefined && Number(badgeValue) > 0 && (
                    <span style={{
                      background: item.badgeColor || 'var(--bg-canvas)',
                      color: item.badgeColor ? '#000' : 'var(--text-muted)',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: '8px'
                    }}>
                      {badgeValue}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
