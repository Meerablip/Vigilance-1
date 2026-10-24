import React, { useState, useRef, useEffect } from 'react';
import { 
  FolderOpen, 
  RotateCcw, 
  Save, 
  Lock, 
  Unlock, 
  Crosshair, 
  Layers,
  Check
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
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(false);
  const presetsRef = useRef<HTMLDivElement>(null);

  // Close presets menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setShowPresetsMenu(false);
      }
    };
    if (showPresetsMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showPresetsMenu]);

  const handleSaveClick = () => {
    onSaveLayout();
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleResetClick = () => {
    onResetLayout();
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 1500);
  };

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
            border: '1px solid var(--military-green-border)',
            color: 'var(--text-primary)',
            padding: '3px 8px',
            borderRadius: '2px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.04em'
          }}
          title="Open Library to drag modules onto the workspace"
        >
          <Layers size={11} color="var(--military-green-text)" />
          <span>MODULES</span>
        </button>

        <div style={{ height: '12px', width: '1px', background: 'var(--border-subtle)' }} />

        {/* Load Preset Menu */}
        <div ref={presetsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: showPresetsMenu ? 'var(--bg-card-hover)' : 'var(--bg-card)',
              border: showPresetsMenu ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
              color: showPresetsMenu ? '#f1f5f9' : 'var(--text-secondary)',
              padding: '3px 7px',
              borderRadius: '2px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
            title="Load Predefined Workspace Configurations"
          >
            <FolderOpen size={11} />
            <span>Presets</span>
          </button>

          {showPresetsMenu && (
            <div 
              style={{
                position: 'absolute',
                top: '28px',
                left: 0,
                width: '190px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-active)',
                borderRadius: '2px',
                boxShadow: 'var(--shadow-panel)',
                padding: '4px',
                zIndex: 1000
              }}
            >
              <div 
                className="context-item"
                onClick={() => {
                  onLoadPreset('commander');
                  setShowPresetsMenu(false);
                }}
                style={{ padding: '6px 8px' }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '11px' }}>Commander Overview</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Map, Feeds, Triage & Policy</div>
                </div>
              </div>

              <div 
                className="context-item"
                onClick={() => {
                  onLoadPreset('operator');
                  setShowPresetsMenu(false);
                }}
                style={{ padding: '6px 8px' }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '11px' }}>Operator Feeds</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Large Optical Recon & Triage</div>
                </div>
              </div>

              <div 
                className="context-item"
                onClick={() => {
                  onLoadPreset('analyst');
                  setShowPresetsMenu(false);
                }}
                style={{ padding: '6px 8px' }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '11px' }}>Analyst Fusion</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Cross-Sensor Fusion & Health</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Layout Button */}
        <button
          onClick={handleSaveClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: saveFeedback ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
            border: saveFeedback ? '1px solid var(--status-healthy)' : '1px solid var(--border-subtle)',
            color: saveFeedback ? 'var(--status-healthy)' : 'var(--text-secondary)',
            padding: '3px 7px',
            borderRadius: '2px',
            fontSize: '10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Save layout configuration to persistent memory"
        >
          {saveFeedback ? <Check size={11} color="var(--status-healthy)" /> : <Save size={11} />}
          <span>{saveFeedback ? 'Saved ✓' : 'Save'}</span>
        </button>

        {/* Reset Layout Button */}
        <button
          onClick={handleResetClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            background: resetFeedback ? 'rgba(234, 88, 12, 0.1)' : 'transparent',
            border: resetFeedback ? '1px solid var(--threat-l4)' : '1px solid transparent',
            color: resetFeedback ? 'var(--threat-l4)' : 'var(--text-muted)',
            padding: '3px 6px',
            borderRadius: '2px',
            fontSize: '10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Reset to default multi-module layout"
        >
          <RotateCcw size={11} />
          <span>{resetFeedback ? 'Reset ✓' : 'Reset'}</span>
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
