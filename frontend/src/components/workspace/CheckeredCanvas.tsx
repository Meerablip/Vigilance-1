import React, { useState, useEffect, useRef } from 'react';
import { ModularWidget } from './ModularWidget';
import { WidgetLibrary } from './WidgetLibrary';
import { LayoutToolbar } from './LayoutToolbar';
import { WidgetContentRenderer } from './WidgetContentRenderer';
import type { WidgetConfig, PageId } from '../../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Compass, 
  ChevronUp, 
  ChevronDown,
  Layers
} from 'lucide-react';

interface CheckeredCanvasProps {
  onNavigate: (page: PageId) => void;
  onSelectIncident?: (incidentId: string) => void;
}

const DEFAULT_COMMANDER_LAYOUT: WidgetConfig[] = [
  {
    id: 'widget-map-1',
    type: 'regional_map',
    title: 'Regional Sector Map',
    category: 'situational_awareness',
    x: 0,
    y: 0,
    w: 22,
    h: 17,
    minW: 14,
    minH: 10
  },
  {
    id: 'widget-cctv-1',
    type: 'cctv_feeds',
    title: 'Optical Feed CAM-04 (YOLO Stream)',
    category: 'live_monitoring',
    x: 22,
    y: 0,
    w: 19,
    h: 17,
    minW: 14,
    minH: 10
  },
  {
    id: 'widget-alerts-1',
    type: 'alert_queue',
    title: 'Alert Triage Queue',
    category: 'alerts_decisions',
    x: 0,
    y: 17,
    w: 22,
    h: 13,
    minW: 14,
    minH: 8
  },
  {
    id: 'widget-fused-1',
    type: 'fused_summary',
    title: '5-Level Policy Distribution',
    category: 'data_fusion',
    x: 22,
    y: 17,
    w: 19,
    h: 13,
    minW: 14,
    minH: 8
  }
];

const OPERATOR_TACTICAL_LAYOUT: WidgetConfig[] = [
  {
    id: 'widget-cctv-op',
    type: 'cctv_feeds',
    title: 'Perimeter Optical Feed #04',
    category: 'live_monitoring',
    x: 0,
    y: 0,
    w: 22,
    h: 28,
    minW: 14,
    minH: 12
  },
  {
    id: 'widget-map-op',
    type: 'regional_map',
    title: 'Sector Map',
    category: 'situational_awareness',
    x: 22,
    y: 0,
    w: 19,
    h: 15,
    minW: 12,
    minH: 10
  },
  {
    id: 'widget-alerts-op',
    type: 'alert_queue',
    title: 'Triage Queue',
    category: 'alerts_decisions',
    x: 22,
    y: 15,
    w: 19,
    h: 13,
    minW: 12,
    minH: 8
  }
];

const ANALYST_FUSION_LAYOUT: WidgetConfig[] = [
  {
    id: 'w-heatmap',
    type: 'threat_heatmap',
    title: 'Threat Density Heatmap',
    category: 'situational_awareness',
    x: 0,
    y: 0,
    w: 21,
    h: 15,
    minW: 14,
    minH: 10
  },
  {
    id: 'w-coverage',
    type: 'sensor_coverage',
    title: 'Sensor Coverage Cones & Blind Spots',
    category: 'situational_awareness',
    x: 21,
    y: 0,
    w: 20,
    h: 15,
    minW: 14,
    minH: 10
  },
  {
    id: 'w-fused',
    type: 'fused_summary',
    title: '5-Level Decision Protocol Breakdown',
    category: 'data_fusion',
    x: 0,
    y: 15,
    w: 21,
    h: 13,
    minW: 14,
    minH: 8
  },
  {
    id: 'w-disagreement',
    type: 'sensor_disagreement',
    title: 'Cross-Sensor Correlation Matrix',
    category: 'data_fusion',
    x: 21,
    y: 15,
    w: 20,
    h: 13,
    minW: 14,
    minH: 8
  }
];

const GRID_SIZE = 24; // 24px grid cells

export const CheckeredCanvas: React.FC<CheckeredCanvasProps> = ({
  onNavigate,
  onSelectIncident
}) => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('vigilance_workspace_layout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed to parse saved layout, using default:', e);
      }
    }
    return DEFAULT_COMMANDER_LAYOUT;
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isZoomLocked, setIsZoomLocked] = useState<boolean>(() => {
    return localStorage.getItem('vigilance_workspace_zoom_locked') === 'true';
  });
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [focusedWidgetId, setFocusedWidgetId] = useState<string | null>(null);
  const [isIncidentMode, setIsIncidentMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleToggleZoomLock = () => {
    setIsZoomLocked(prev => {
      const next = !prev;
      localStorage.setItem('vigilance_workspace_zoom_locked', String(next));
      showToast(next ? 'Modular board zoom LOCKED (frozen)' : 'Modular board zoom UNLOCKED');
      return next;
    });
  };

  // Endless Virtual Canvas Panning & Zoom State
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>(() => {
    const savedPan = localStorage.getItem('vigilance_workspace_pan');
    if (savedPan) {
      try { return JSON.parse(savedPan); } catch {}
    }
    return { x: 20, y: 20 };
  });

  const [zoom, setZoom] = useState<number>(1.0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [isMiniMapExpanded, setIsMiniMapExpanded] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Save layout state to localStorage
  useEffect(() => {
    localStorage.setItem('vigilance_workspace_layout', JSON.stringify(widgets));
  }, [widgets]);

  // Save pan offset to localStorage
  useEffect(() => {
    localStorage.setItem('vigilance_workspace_pan', JSON.stringify(panOffset));
  }, [panOffset]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Spacebar panning listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Dedicated Wheel Listener: ONLY zoom or pan when the event occurs on blank canvas space.
  // When interacting with ANY module, the canvas stays completely stationary.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Strict isolation: if wheel occurs over any modular panel, widget pill,
      // radar minimap, library drawer, or toolbar, do NOT affect the modular canvas!
      const isOverModule = Boolean(
        target.closest('.modular-panel') ||
        target.closest('.modular-widget-pill') ||
        target.closest('.canvas-radar-minimap') ||
        target.closest('.layout-toolbar') ||
        target.closest('.widget-library-drawer') ||
        target.closest('.widget-action-btn')
      );

      if (isOverModule) {
        // Module receives 100% independent scroll/zoom without canvas movement
        return;
      }

      // Wheel occurred on blank canvas space:
      if (e.ctrlKey) {
        // Zoom centered on cursor on blank space
        e.preventDefault();
        if (isZoomLocked) return;
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        setZoom(prevZoom => Math.max(0.4, Math.min(1.6, prevZoom * zoomFactor)));
      } else {
        // Smooth panning across virtual canvas on blank space
        e.preventDefault();
        const deltaY = e.deltaY;
        const deltaX = e.deltaX;
        setPanOffset(prev => ({
          x: prev.x - (e.shiftKey ? deltaY : deltaX),
          y: prev.y - (e.shiftKey ? 0 : deltaY)
        }));
      }
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, [isZoomLocked]);

  // Panning handlers (middle click, spacebar + left click, or drag on empty canvas background)
  const handleMouseDown = (e: React.MouseEvent) => {
    const isMiddleClick = e.button === 1;
    const isLeftClick = e.button === 0;
    const isRightClick = e.button === 2;
    const target = e.target as HTMLElement;
    const isOnBackground = target === containerRef.current || target.classList.contains('canvas-panning-surface');

    if (isMiddleClick || isRightClick || (isSpacePressed && isLeftClick) || (isOnBackground && isLeftClick)) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      initialPanRef.current = { ...panOffset };

      const handleMouseMove = (moveEvt: MouseEvent) => {
        const dx = moveEvt.clientX - panStartRef.current.x;
        const dy = moveEvt.clientY - panStartRef.current.y;
        setPanOffset({
          x: initialPanRef.current.x + dx,
          y: initialPanRef.current.y + dy
        });
      };

      const handleMouseUp = () => {
        setIsPanning(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleUpdateWidget = (id: string, updatedProps: Partial<WidgetConfig>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updatedProps } : w));
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const handleDuplicateWidget = (widget: WidgetConfig) => {
    const newWidget: WidgetConfig = {
      ...widget,
      id: `widget-${Date.now()}`,
      title: `${widget.title} (Copy)`,
      x: widget.x + 2,
      y: widget.y + 2
    };
    setWidgets(prev => [...prev, newWidget]);
    showToast(`Duplicated ${widget.title}`);
  };

  // Drag and Drop from Widget Library onto Endless Virtual Canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const dataStr = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const def = JSON.parse(dataStr);

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate coordinate in virtual space taking panOffset and zoom into account
        const dropX = (e.clientX - rect.left - panOffset.x) / zoom;
        const dropY = (e.clientY - rect.top - panOffset.y) / zoom;

        // Snap to grid in virtual space
        const gridX = Math.max(0, Math.floor(dropX / GRID_SIZE));
        const gridY = Math.max(0, Math.floor(dropY / GRID_SIZE));

        const newWidget: WidgetConfig = {
          ...def,
          id: `widget-${Date.now()}`,
          x: gridX,
          y: gridY,
          w: def.w || def.defaultW || 20,
          h: def.h || def.defaultH || 14,
          minW: 10,
          minH: 8
        };

        setWidgets(prev => [...prev, newWidget]);
        setFocusedWidgetId(newWidget.id);
        showToast(`Deployed ${newWidget.title} to endless canvas`);
      }
    } catch (err) {
      console.error('Failed to parse dropped widget', err);
    }
  };

  const handleDeployFromLibrary = (def: any) => {
    // Deploy into visible screen center
    const centerX = (-panOffset.x + (window.innerWidth / 2) - 150) / zoom;
    const centerY = (-panOffset.y + (window.innerHeight / 2) - 150) / zoom;
    const gridX = Math.max(0, Math.floor(centerX / GRID_SIZE));
    const gridY = Math.max(0, Math.floor(centerY / GRID_SIZE));

    const newWidget: WidgetConfig = {
      type: def.type,
      title: def.title,
      category: def.category,
      w: def.defaultW || def.w || 20,
      h: def.defaultH || def.h || 14,
      id: `widget-${Date.now()}`,
      x: gridX,
      y: gridY,
      minW: 10,
      minH: 8
    };

    setWidgets(prev => [...prev, newWidget]);
    setFocusedWidgetId(newWidget.id);
    showToast(`Deployed ${newWidget.title} to workspace`);
  };

  const handleSaveLayout = () => {
    localStorage.setItem('vigilance_workspace_layout', JSON.stringify(widgets));
    localStorage.setItem('vigilance_workspace_pan', JSON.stringify(panOffset));
    showToast('Workspace layout and camera view saved to profile');
  };

  const handleResetLayout = () => {
    setWidgets(DEFAULT_COMMANDER_LAYOUT);
    setPanOffset({ x: 20, y: 20 });
    setZoom(1.0);
    localStorage.setItem('vigilance_workspace_layout', JSON.stringify(DEFAULT_COMMANDER_LAYOUT));
    showToast('Layout & canvas position reset to default');
  };

  const handleLoadPreset = (preset: 'operator' | 'commander' | 'analyst') => {
    setPanOffset({ x: 20, y: 20 });
    setZoom(1.0);
    if (preset === 'operator') {
      setWidgets(OPERATOR_TACTICAL_LAYOUT);
      showToast('Loaded: Operator Feeds Preset');
    } else if (preset === 'commander') {
      setWidgets(DEFAULT_COMMANDER_LAYOUT);
      showToast('Loaded: Commander Overview Preset');
    } else {
      setWidgets(ANALYST_FUSION_LAYOUT);
      showToast('Loaded: Analyst Fusion Preset');
    }
  };

  const handleToggleIncidentMode = () => {
    if (!isIncidentMode) {
      setIsIncidentMode(true);
      setWidgets([
        { id: 'w-inc-map', type: 'regional_map', title: 'INCIDENT FOCUS • NORTH SECTOR', category: 'situational_awareness', x: 0, y: 0, w: 22, h: 28 },
        { id: 'w-inc-cctv', type: 'cctv_feeds', title: 'PRIMARY SENSOR CAM-NORTH-04', category: 'live_monitoring', x: 22, y: 0, w: 19, h: 16 },
        { id: 'w-inc-alerts', type: 'alert_queue', title: 'CORRELATED EVIDENCE', category: 'alerts_decisions', x: 22, y: 16, w: 19, h: 12 }
      ]);
      setPanOffset({ x: 20, y: 20 });
      showToast('Activated Incident Focus Layout');
    } else {
      setIsIncidentMode(false);
      const saved = localStorage.getItem('vigilance_workspace_layout');
      if (saved) {
        try { setWidgets(JSON.parse(saved)); } catch { setWidgets(DEFAULT_COMMANDER_LAYOUT); }
      } else {
        setWidgets(DEFAULT_COMMANDER_LAYOUT);
      }
      showToast('Exited Incident Focus');
    }
  };

  // Center / Recenter View
  const handleRecenter = () => {
    setPanOffset({ x: 20, y: 20 });
    setZoom(1.0);
    showToast('Camera recentered to Home coordinates');
  };

  // Minimized widgets list
  const minimizedWidgets = widgets.filter(w => w.isMinimized);

  return (
    <div 
      style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden' 
      }}
    >
      <LayoutToolbar
        isLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
        isZoomLocked={isZoomLocked}
        onToggleZoomLock={handleToggleZoomLock}
        onOpenWidgetLibrary={() => setIsLibraryOpen(!isLibraryOpen)}
        onResetLayout={handleResetLayout}
        onSaveLayout={handleSaveLayout}
        onLoadPreset={handleLoadPreset}
        onToggleIncidentMode={handleToggleIncidentMode}
        isIncidentMode={isIncidentMode}
      />

      {/* Floating Military Status Toast */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '38px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(20, 23, 29, 0.95)',
          border: '1px solid var(--border-active)',
          color: '#f1f5f9',
          padding: '4px 12px',
          borderRadius: '2px',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.3px',
          boxShadow: 'var(--shadow-panel)',
          zIndex: 800,
          pointerEvents: 'none'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Main Endless Checkered Canvas Container */}
      <div 
        ref={containerRef}
        className="checkered-canvas canvas-panning-surface"
        style={{
          flex: 1,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          cursor: isSpacePressed || isPanning ? 'grabbing' : 'default',
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
          backgroundSize: `${GRID_SIZE * 5 * zoom}px ${GRID_SIZE * 5 * zoom}px, ${GRID_SIZE * 5 * zoom}px ${GRID_SIZE * 5 * zoom}px, ${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px, ${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
          outline: isDragOver ? '2px dashed var(--military-green-border-focus)' : 'none'
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={(e) => {
          // If right-clicked on empty background, prevent default context menu to allow panning
          if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('canvas-panning-surface')) {
            e.preventDefault();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Infinite Virtual Layer: moves with panOffset and scales with zoom */}
        <div
          className="canvas-virtual-layer canvas-panning-surface"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '20000px',
            height: '20000px',
            pointerEvents: 'none'
          }}
        >
          {widgets.map((widget) => (
            <div key={widget.id} style={{ display: 'contents', pointerEvents: 'auto' }}>
              <ModularWidget
                widget={widget}
                gridSize={GRID_SIZE}
                zoom={zoom}
                isLocked={isLocked}
                onUpdate={(updated) => handleUpdateWidget(widget.id, updated)}
                onRemove={handleRemoveWidget}
                onDuplicate={handleDuplicateWidget}
                onFocus={(id) => setFocusedWidgetId(id)}
                isFocused={focusedWidgetId === widget.id}
              >
                <WidgetContentRenderer 
                  widget={widget} 
                  onNavigate={onNavigate}
                  onSelectIncident={onSelectIncident}
                />
              </ModularWidget>
            </div>
          ))}
        </div>

        {/* Empty Canvas Quick Deploy Overlay */}
        {widgets.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(15, 17, 21, 0.96)',
            border: '1px solid var(--military-green-border, #274734)',
            borderRadius: '4px',
            padding: '24px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            zIndex: 100,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
          }}>
            <Layers size={28} color="var(--military-green-text, #86efac)" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '0.05em' }}>
              WORKSPACE CANVAS IS EMPTY
            </h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, maxWidth: '340px', lineHeight: 1.4 }}>
              Restore a tactical layout preset or open the module library to deploy radar, optical feeds, or threat maps.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                onClick={() => handleLoadPreset('commander')}
                style={{
                  background: 'var(--military-green-surface, #14231b)',
                  border: '1px solid var(--military-green-border, #244634)',
                  color: 'var(--military-green-highlight, #86efac)',
                  padding: '6px 14px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Commander Overview
              </button>
              <button
                onClick={() => handleLoadPreset('operator')}
                style={{
                  background: '#1a1d24',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  padding: '6px 14px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Operator Feeds
              </button>
              <button
                onClick={() => setIsLibraryOpen(true)}
                style={{
                  background: '#1a1d24',
                  border: '1px solid #334155',
                  color: '#38bdf8',
                  padding: '6px 14px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Open Library
              </button>
            </div>
          </div>
        )}

        {/* Floating Minimized Modules Quick-Restore Tray (Bottom Left) */}
        {minimizedWidgets.length > 0 && (
          <div 
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(13, 16, 23, 0.95)',
              border: '1px solid #1e2633',
              borderRadius: '3px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
              zIndex: 300,
              maxWidth: '600px',
              overflowX: 'auto'
            }}
          >
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Minimized ({minimizedWidgets.length}):
            </span>
            {minimizedWidgets.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  handleUpdateWidget(w.id, { isMinimized: false });
                  setFocusedWidgetId(w.id);
                  // Auto-pan to center the restored widget if it's off screen
                  setPanOffset({
                    x: Math.min(20, -(w.x * GRID_SIZE * zoom) + 100),
                    y: Math.min(20, -(w.y * GRID_SIZE * zoom) + 100)
                  });
                }}
                style={{
                  background: '#131417',
                  border: '1px solid var(--military-green-border)',
                  color: 'var(--military-green-text)',
                  fontSize: '9px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
                title={`Click to restore ${w.title}`}
              >
                <span>{w.title}</span>
                <Maximize2 size={10} color="var(--military-green-text)" />
              </button>
            ))}
          </div>
        )}

        {/* Tactical Mini-Map & Virtual Camera Radar HUD (Bottom Right) */}
        <div 
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(16, 18, 22, 0.95)',
            border: '1px solid var(--military-green-border)',
            borderRadius: '3px',
            boxShadow: 'var(--shadow-panel)',
            zIndex: 300,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            width: isMiniMapExpanded ? '200px' : 'auto'
          }}
        >
          {/* Mini-Map Header Bar */}
          <div 
            style={{
              height: '24px',
              background: '#141518',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px',
              fontSize: '9px',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--military-green-text)' }}>
              <Compass size={11} />
              <span>RADAR NAVIGATOR</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handleRecenter}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Recenter Camera to Home (0, 0)"
              >
                <RotateCcw size={10} />
              </button>
              <button
                onClick={() => setIsMiniMapExpanded(!isMiniMapExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {isMiniMapExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </button>
            </div>
          </div>

          {/* Mini-Map Expanded Viewport Canvas */}
          {isMiniMapExpanded && (
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Radar Box */}
              <div 
                style={{
                  height: '90px',
                  background: '#0a0b0d',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '2px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Radar Grid Lines */}
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(42, 71, 54, 0.4)' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(42, 71, 54, 0.4)' }} />

                {/* Render Miniature Modules */}
                {widgets.map((w) => {
                  const miniX = (w.x * 2.5) % 170;
                  const miniY = (w.y * 1.8) % 75;
                  const miniW = Math.max(10, w.w * 2.5);
                  const miniH = Math.max(6, (w.isMinimized ? 2 : w.h) * 1.8);
                  return (
                    <div
                      key={w.id}
                      style={{
                        position: 'absolute',
                        left: `${Math.max(2, miniX)}px`,
                        top: `${Math.max(2, miniY)}px`,
                        width: `${miniW}px`,
                        height: `${miniH}px`,
                        background: w.isMinimized ? 'rgba(54, 97, 71, 0.2)' : 'rgba(54, 97, 71, 0.5)',
                        border: '1px solid var(--military-green-border)',
                        borderRadius: '1px'
                      }}
                    />
                  );
                })}

                {/* Current Camera Viewport Wireframe Box */}
                <div 
                  style={{
                    position: 'absolute',
                    left: `${Math.max(0, Math.min(130, -panOffset.x * 0.08))}px`,
                    top: `${Math.max(0, Math.min(60, -panOffset.y * 0.08))}px`,
                    width: `${Math.max(30, 80 / zoom)}px`,
                    height: `${Math.max(20, 50 / zoom)}px`,
                    border: '1.5px solid var(--military-green-border-focus)',
                    background: 'rgba(42, 71, 54, 0.25)',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              {/* Coordinates and Zoom Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)' }}>
                <span style={{ fontFamily: 'monospace' }}>
                  X: {Math.round(-panOffset.x)} Y: {Math.round(-panOffset.y)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <button
                    disabled={isZoomLocked}
                    onClick={() => !isZoomLocked && setZoom(prev => Math.max(0.4, prev - 0.1))}
                    style={{
                      background: isZoomLocked ? '#121417' : '#181a1f',
                      border: '1px solid var(--border-subtle)',
                      color: isZoomLocked ? '#64748b' : 'var(--text-primary)',
                      borderRadius: '2px',
                      padding: '1px 4px',
                      cursor: isZoomLocked ? 'not-allowed' : 'pointer'
                    }}
                    title={isZoomLocked ? 'Zoom is locked' : 'Zoom Out'}
                  >
                    <ZoomOut size={9} />
                  </button>
                  <span style={{ fontFamily: 'monospace', color: isZoomLocked ? '#38bdf8' : 'var(--military-green-text)' }}>
                    {Math.round(zoom * 100)}%{isZoomLocked ? ' 🔒' : ''}
                  </span>
                  <button
                    disabled={isZoomLocked}
                    onClick={() => !isZoomLocked && setZoom(prev => Math.min(1.6, prev + 0.1))}
                    style={{
                      background: isZoomLocked ? '#121417' : '#181a1f',
                      border: '1px solid var(--border-subtle)',
                      color: isZoomLocked ? '#64748b' : 'var(--text-primary)',
                      borderRadius: '2px',
                      padding: '1px 4px',
                      cursor: isZoomLocked ? 'not-allowed' : 'pointer'
                    }}
                    title={isZoomLocked ? 'Zoom is locked' : 'Zoom In'}
                  >
                    <ZoomIn size={9} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Widget Library Drawer */}
        <WidgetLibrary
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onAddWidget={handleDeployFromLibrary}
        />
      </div>
    </div>
  );
};
