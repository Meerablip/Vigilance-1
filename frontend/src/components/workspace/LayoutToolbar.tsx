import React, { useState } from 'react';
import { 
  Plus, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Save, 
  FolderOpen, 
  Grid, 
  Crosshair
} from 'lucide-react';

interface LayoutToolbarProps {
  isLocked: boolean;
  onToggleLock: () => void;
  onOpenWidgetLibrary: () => void;
  onResetLayout: () => void;
  onSaveLayout: () => void;
  onLoadPreset: (presetName: 'operator' | 'commander' | 'analyst') => void;
  onToggleIncidentMode: () => void;
  isIncidentMode: boolean;
}

export const LayoutToolbar: React.FC<LayoutToolbarProps> = ({
  isLocked,
  onToggleLock,
  onOpenWidgetLibrary,
  onResetLayout,
  onSaveLayout,
  onLoadPreset,
  onToggleIncidentMode,
  isIncidentMode
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  return (
    <div style={{
      height: '34px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 10px',
      userSelect: 'none',
      zIndex: 60
    }}>
      {/* Left: Add Widget & Presets */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Add Widget Button */}
        <button
          onClick={onOpenWidgetLibrary}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'var(--accent-cyan-dim)',
            border: '1px solid rgba(0, 210, 255, 0.4)',
            color: 'var(--accent-cyan)',
            padding: '3px 8px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title="Open Widget Repository to add cards"
        >
          <Plus size={13} />
          <span>ADD WIDGET</span>
        </button>

        <div style={{ height: '14px', width: '1px', background: 'var(--border-subtle)' }} />

        {/* Load Preset Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '3px 8px',
              borderRadius: '3px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <FolderOpen size={12} />
            <span>Presets</span>
          </button>

          {showPresetsMenu && (
            <div 
              style={{
                position: 'absolute',
                top: '28px',
                left: 0,
                width: '180px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-focus)',
                borderRadius: '4px',
                boxShadow: 'var(--shadow-panel)',
                padding: '4px',
                zIndex: 1000
              }}
              onMouseLeave={() => setShowPresetsMenu(false)}
            >
              <div 
                className="context-item"
                onClick={() => {
                  onLoadPreset('commander');
                  setShowPresetsMenu(false);
                }}
              >
                Commander C2 Overview
              </div>
              <div 
                className="context-item"
                onClick={() => {
                  onLoadPreset('operator');
                  setShowPresetsMenu(false);
                }}
              >
                Operator Tactical Feeds
              </div>
              <div 
                className="context-item"
                onClick={() => {
                  onLoadPreset('analyst');
                  setShowPresetsMenu(false);
                }}
              >
                Analyst Fusion & Trends
              </div>
            </div>
          )}
        </div>

        {/* Save Layout */}
        <button
          onClick={onSaveLayout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            padding: '3px 8px',
            borderRadius: '3px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
          title="Save current panel positions to persistent storage"
        >
          <Save size={12} />
          <span>Save Layout</span>
        </button>

        {/* Reset Layout */}
        <button
          onClick={() => {
            if (window.confirm('Reset workspace to default multi-sensor configuration?')) {
              onResetLayout();
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            padding: '3px 6px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
          title="Restore factory default layout"
        >
          <RotateCcw size={12} />
          <span>Reset Default</span>
        </button>
      </div>

      {/* Right: Snap-to-Grid, Lock & Incident Mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Incident Mode Action */}
        <button
          onClick={onToggleIncidentMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: isIncidentMode ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-card)',
            border: isIncidentMode ? '1px solid var(--threat-l5)' : '1px solid var(--border-subtle)',
            color: isIncidentMode ? 'var(--threat-l5)' : 'var(--text-secondary)',
            padding: '3px 8px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: isIncidentMode ? 700 : 500,
            cursor: 'pointer'
          }}
          title="Focus workspace on active critical alert, map, and supporting CCTV feeds"
        >
          <Crosshair size={13} />
          <span>{isIncidentMode ? 'EXIT INCIDENT FOCUS' : 'INCIDENT MODE'}</span>
        </button>

        {/* CAD Grid Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--text-muted)',
          fontSize: '11px'
        }}>
          <Grid size={12} />
          <span>Snap 24px</span>
        </div>

        {/* Lock Layout */}
        <button
          onClick={onToggleLock}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: isLocked ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
            border: isLocked ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
            color: isLocked ? 'var(--threat-l3)' : 'var(--text-secondary)',
            padding: '3px 8px',
            borderRadius: '3px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
          title={isLocked ? 'Unlock layout to reposition or resize panels' : 'Lock layout to prevent accidental moving or resizing'}
        >
          {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
          <span>{isLocked ? 'Locked' : 'Unlocked'}</span>
        </button>
      </div>
    </div>
  );
};
