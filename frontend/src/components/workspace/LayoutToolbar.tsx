import React, { useState } from 'react';
import { 
  FolderOpen, 
  RotateCcw, 
  Save, 
  Lock, 
  Unlock, 
  Crosshair, 
  Layers
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
      height: '32px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 8px',
      userSelect: 'none',
      zIndex: 60
    }}>
      {/* Left: Module Library Drawer & Presets */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={onOpenWidgetLibrary}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-focus)',
            color: 'var(--text-primary)',
            padding: '3px 7px',
            borderRadius: '2px',
            fontSize: '10px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title="Open Library to drag modules onto the workspace"
        >
          <Layers size={11} />
          <span>MODULES</span>
        </button>

        <div style={{ height: '12px', width: '1px', background: 'var(--border-subtle)' }} />

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
              padding: '3px 7px',
              borderRadius: '2px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            <FolderOpen size={11} />
            <span>Presets</span>
          </button>

          {showPresetsMenu && (
            <div 
              style={{
                position: 'absolute',
                top: '26px',
                left: 0,
                width: '170px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-focus)',
                borderRadius: '2px',
                boxShadow: 'var(--shadow-panel)',
                padding: '3px',
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
                Commander Overview
              </div>
              <div 
                className="context-item"
                onClick={() => {
                  onLoadPreset('operator');
                  setShowPresetsMenu(false);
                }}
              >
                Operator Feeds
              </div>
              <div 
                className="context-item"
                onClick={() => {
                  onLoadPreset('analyst');
                  setShowPresetsMenu(false);
                }}
              >
                Analyst Fusion
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
            padding: '3px 7px',
            borderRadius: '2px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
          title="Save current layout"
        >
          <Save size={11} />
          <span>Save</span>
        </button>

        {/* Reset Layout */}
        <button
          onClick={() => {
            if (window.confirm('Reset workspace to default layout?')) {
              onResetLayout();
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            padding: '3px 5px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
          title="Restore default layout"
        >
          <RotateCcw size={11} />
          <span>Reset</span>
        </button>
      </div>

      {/* Right: Lock & Incident Mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Incident Mode Action */}
        <button
          onClick={onToggleIncidentMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: isIncidentMode ? 'rgba(220, 38, 38, 0.12)' : 'var(--bg-card)',
            border: isIncidentMode ? '1px solid var(--threat-l5)' : '1px solid var(--border-subtle)',
            color: isIncidentMode ? 'var(--threat-l5)' : 'var(--text-secondary)',
            padding: '3px 7px',
            borderRadius: '2px',
            fontSize: '10px',
            fontWeight: isIncidentMode ? 700 : 500,
            cursor: 'pointer'
          }}
          title="Focus workspace on active incident"
        >
          <Crosshair size={11} />
          <span>{isIncidentMode ? 'EXIT INCIDENT FOCUS' : 'INCIDENT FOCUS'}</span>
        </button>

        {/* Lock Layout */}
        <button
          onClick={onToggleLock}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: isLocked ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
            border: isLocked ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
            color: isLocked ? 'var(--threat-l3)' : 'var(--text-secondary)',
            padding: '3px 7px',
            borderRadius: '2px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
          title={isLocked ? 'Unlock layout' : 'Lock layout'}
        >
          {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
          <span>{isLocked ? 'Locked' : 'Unlocked'}</span>
        </button>
      </div>
    </div>
  );
};
