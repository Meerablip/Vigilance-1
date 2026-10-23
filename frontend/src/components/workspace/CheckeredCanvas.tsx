import React, { useState, useEffect, useRef } from 'react';
import { ModularWidget } from './ModularWidget';
import { WidgetLibrary } from './WidgetLibrary';
import { LayoutToolbar } from './LayoutToolbar';
import { WidgetContentRenderer } from './WidgetContentRenderer';
import type { WidgetConfig, PageId } from '../../types';

interface CheckeredCanvasProps {
  onNavigate: (page: PageId) => void;
  onSelectIncident?: (incidentId: string) => void;
}

const DEFAULT_COMMANDER_LAYOUT: WidgetConfig[] = [
  {
    id: 'widget-map-1',
    type: 'regional_map',
    title: 'Regional Threat Map (India GIS Grid)',
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
    title: 'Live Optical Feed #04 (YOLO AI Overlay)',
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
    title: 'Active Alert Queue (5-Level Prioritized)',
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
    title: '5-Level Policy Distribution & Handling',
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
    title: 'Perimeter Live Optical Feed #04',
    category: 'live_monitoring',
    x: 0,
    y: 0,
    w: 21,
    h: 28,
    minW: 14,
    minH: 12
  },
  {
    id: 'widget-map-op',
    type: 'regional_map',
    title: 'Regional India Map',
    category: 'situational_awareness',
    x: 21,
    y: 0,
    w: 20,
    h: 15,
    minW: 12,
    minH: 10
  },
  {
    id: 'widget-alerts-op',
    type: 'alert_queue',
    title: 'Triage Queue',
    category: 'alerts_decisions',
    x: 21,
    y: 15,
    w: 20,
    h: 13,
    minW: 12,
    minH: 8
  }
];

export const CheckeredCanvas: React.FC<CheckeredCanvasProps> = ({
  onNavigate,
  onSelectIncident
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('vigilance_workspace_layout');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_COMMANDER_LAYOUT;
  });

  const [isLocked, setIsLocked] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isIncidentMode, setIsIncidentMode] = useState(false);
  const [focusedWidgetId, setFocusedWidgetId] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1400, height: 800 });

  const GRID_SIZE = 24;

  // Track canvas size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setCanvasDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Update a widget
  const handleUpdateWidget = (id: string, updatedProps: Partial<WidgetConfig>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updatedProps } : w));
  };

  // Remove widget
  const handleRemoveWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  // Duplicate widget
  const handleDuplicateWidget = (widget: WidgetConfig) => {
    const newWidget: WidgetConfig = {
      ...widget,
      id: `widget-${Date.now()}`,
      title: `${widget.title} (Copy)`,
      x: Math.min(widget.x + 2, 20),
      y: Math.min(widget.y + 2, 20)
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  // Add new widget from library
  const handleAddFromLibrary = (def: Omit<WidgetConfig, 'id' | 'x' | 'y'>) => {
    // Find free spot
    const newWidget: WidgetConfig = {
      ...def,
      id: `widget-${Date.now()}`,
      x: 2,
      y: 2,
      minW: 10,
      minH: 8
    };
    setWidgets(prev => [...prev, newWidget]);
    setIsLibraryOpen(false);
  };

  // Save layout
  const handleSaveLayout = () => {
    localStorage.setItem('vigilance_workspace_layout', JSON.stringify(widgets));
    alert('Workspace layout configuration saved to local storage.');
  };

  // Reset to default
  const handleResetLayout = () => {
    setWidgets(DEFAULT_COMMANDER_LAYOUT);
    localStorage.removeItem('vigilance_workspace_layout');
  };

  // Presets
  const handleLoadPreset = (preset: 'operator' | 'commander' | 'analyst') => {
    if (preset === 'operator') setWidgets(OPERATOR_TACTICAL_LAYOUT);
    else if (preset === 'commander') setWidgets(DEFAULT_COMMANDER_LAYOUT);
    else {
      // Analyst preset
      setWidgets([
        { id: 'w-fused', type: 'fused_summary', title: 'Fusion Summary', category: 'data_fusion', x: 0, y: 0, w: 20, h: 16 },
        { id: 'w-health', type: 'system_health_card', title: 'System Health', category: 'operations', x: 20, y: 0, w: 21, h: 16 },
        { id: 'w-alerts', type: 'alert_queue', title: 'Historical Alerts', category: 'alerts_decisions', x: 0, y: 16, w: 41, h: 14 }
      ]);
    }
  };

  // Toggle incident focus mode
  const handleToggleIncidentMode = () => {
    if (!isIncidentMode) {
      // Switch to incident focus
      setIsIncidentMode(true);
      setWidgets([
        { id: 'w-inc-map', type: 'regional_map', title: 'INCIDENT GIS FOCUS • NORTH SECTOR 4', category: 'situational_awareness', x: 0, y: 0, w: 20, h: 28 },
        { id: 'w-inc-cctv', type: 'cctv_feeds', title: 'PRIMARY SENSOR CAM-NORTH-04', category: 'live_monitoring', x: 20, y: 0, w: 21, h: 16 },
        { id: 'w-inc-alerts', type: 'alert_queue', title: 'RELATED EVIDENCE & SENSOR SPIKES', category: 'alerts_decisions', x: 20, y: 16, w: 21, h: 12 }
      ]);
    } else {
      setIsIncidentMode(false);
      setWidgets(DEFAULT_COMMANDER_LAYOUT);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Layout Toolbar */}
      <LayoutToolbar
        isLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
        onOpenWidgetLibrary={() => setIsLibraryOpen(!isLibraryOpen)}
        onResetLayout={handleResetLayout}
        onSaveLayout={handleSaveLayout}
        onLoadPreset={handleLoadPreset}
        onToggleIncidentMode={handleToggleIncidentMode}
        isIncidentMode={isIncidentMode}
      />

      {/* Main Checkered Canvas Area */}
      <div 
        ref={containerRef}
        className="checkered-canvas"
        style={{ flex: 1, height: '100%', position: 'relative' }}
      >
        {widgets.map((widget) => (
          <ModularWidget
            key={widget.id}
            widget={widget}
            gridSize={GRID_SIZE}
            canvasBounds={canvasDimensions}
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
        ))}

        {/* Slide-out Widget Library Drawer */}
        <WidgetLibrary
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onAddWidget={handleAddFromLibrary}
        />
      </div>
    </div>
  );
};
