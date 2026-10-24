import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Minus, 
  Maximize2, 
  Minimize2, 
  MoreVertical, 
  Copy, 
  Settings, 
  Move
} from 'lucide-react';
import type { WidgetConfig } from '../../types';

interface ModularWidgetProps {
  widget: WidgetConfig;
  gridSize: number; // e.g. 24px
  canvasBounds?: { width: number; height: number };
  zoom?: number;
  isLocked: boolean;
  onUpdate: (updated: Partial<WidgetConfig>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (widget: WidgetConfig) => void;
  onFocus: (id: string) => void;
  isFocused: boolean;
  children: React.ReactNode;
}

export const ModularWidget: React.FC<ModularWidgetProps> = ({
  widget,
  gridSize = 24,
  zoom = 1,
  isLocked,
  onUpdate,
  onRemove,
  onDuplicate,
  onFocus,
  isFocused,
  children
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Dragging state
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialWidgetPos = useRef({ x: widget.x, y: widget.y });

  // Resizing state
  const isResizing = useRef(false);
  const resizeDirection = useRef<string>('');
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const initialWidgetBounds = useRef({ x: widget.x, y: widget.y, w: widget.w, h: widget.h });

  // Handle Dragging
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (isLocked || widget.isMaximized || (e.target as HTMLElement).closest('.panel-btn')) return;
    onFocus(widget.id);
    isDragging.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialWidgetPos.current = { x: widget.x, y: widget.y };
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  // Handle Resizing
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (isLocked || widget.isMaximized) return;
    e.stopPropagation();
    onFocus(widget.id);
    isResizing.current = true;
    resizeDirection.current = direction;
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    initialWidgetBounds.current = { x: widget.x, y: widget.y, w: widget.w, h: widget.h };
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  const handleWindowMouseMove = (e: MouseEvent) => {
    const scale = Math.max(0.2, zoom);
    if (isDragging.current) {
      const deltaX = Math.round((e.clientX - dragStartPos.current.x) / (gridSize * scale));
      const deltaY = Math.round((e.clientY - dragStartPos.current.y) / (gridSize * scale));

      // Endless canvas: allow dragging anywhere downwards or rightwards without upper boundary cap!
      const newX = Math.max(0, initialWidgetPos.current.x + deltaX);
      const newY = Math.max(0, initialWidgetPos.current.y + deltaY);

      onUpdate({ x: newX, y: newY });
    } else if (isResizing.current) {
      const deltaGridX = Math.round((e.clientX - resizeStartPos.current.x) / (gridSize * scale));
      const deltaGridY = Math.round((e.clientY - resizeStartPos.current.y) / (gridSize * scale));

      const dir = resizeDirection.current;
      let newX = initialWidgetBounds.current.x;
      let newY = initialWidgetBounds.current.y;
      let newW = initialWidgetBounds.current.w;
      let newH = initialWidgetBounds.current.h;

      const minW = widget.minW || 8;
      const minH = widget.minH || 6;

      if (dir.includes('e')) {
        newW = Math.max(minW, initialWidgetBounds.current.w + deltaGridX);
      }
      if (dir.includes('s')) {
        newH = Math.max(minH, initialWidgetBounds.current.h + deltaGridY);
      }
      if (dir.includes('w')) {
        const potentialW = initialWidgetBounds.current.w - deltaGridX;
        if (potentialW >= minW) {
          newW = potentialW;
          newX = initialWidgetBounds.current.x + deltaGridX;
        }
      }
      if (dir.includes('n')) {
        const potentialH = initialWidgetBounds.current.h - deltaGridY;
        if (potentialH >= minH) {
          newH = potentialH;
          newY = initialWidgetBounds.current.y + deltaGridY;
        }
      }

      onUpdate({ x: newX, y: newY, w: newW, h: newH });
    }
  };

  const handleWindowMouseUp = () => {
    isDragging.current = false;
    isResizing.current = false;
    window.removeEventListener('mousemove', handleWindowMouseMove);
    window.removeEventListener('mouseup', handleWindowMouseUp);
  };

  // Right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onFocus(widget.id);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (contextMenuPos && !(e.target as HTMLElement).closest('.context-menu')) {
        setContextMenuPos(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [contextMenuPos]);

  // Compute CSS placement
  const isMax = widget.isMaximized;
  const isMin = widget.isMinimized;

  const panelStyle: React.CSSProperties = isMax ? {
    position: 'absolute',
    left: '8px',
    top: '8px',
    right: '8px',
    bottom: '8px',
    zIndex: 999
  } : {
    left: `${widget.x * gridSize}px`,
    top: `${widget.y * gridSize}px`,
    width: `${widget.w * gridSize}px`,
    height: isMin ? '36px' : `${widget.h * gridSize}px`,
    zIndex: isFocused ? 50 : 10
  };

  return (
    <div
      ref={panelRef}
      className={`modular-panel ${isFocused ? 'panel-focused' : ''}`}
      style={panelStyle}
      onClick={() => onFocus(widget.id)}
      onContextMenu={handleContextMenu}
    >
      {/* Header */}
      <div 
        className="panel-header"
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={() => onUpdate({ isMinimized: !isMin })}
        style={{ cursor: isMin ? 'pointer' : 'default' }}
      >
        <div className="panel-title-area">
          <Move size={12} color="var(--text-muted)" style={{ cursor: 'grab' }} />
          <span>{widget.title}</span>
          {isMin && (
            <span style={{
              fontSize: '8px',
              fontFamily: 'monospace',
              fontWeight: 700,
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '1px 5px',
              borderRadius: '2px',
              marginLeft: '6px'
            }}>
              MINIMIZED (DOUBLE CLICK TO RESTORE)
            </span>
          )}
        </div>

        <div className="panel-actions">
          {/* Minimize / Expand */}
          <button
            className="panel-btn"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isMinimized: !isMin });
            }}
            title={isMin ? 'Expand Panel' : 'Minimize Panel'}
          >
            {isMin ? <Maximize2 size={11} color="#38bdf8" /> : <Minus size={13} />}
          </button>

          {/* Maximize / Restore */}
          <button
            className="panel-btn"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isMaximized: !isMax });
            }}
            title={isMax ? 'Restore Size' : 'Maximize to Full Workspace'}
          >
            {isMax ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {/* 3-Dot Contextual Menu */}
          <button
            className="panel-btn"
            onClick={(e) => {
              e.stopPropagation();
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setContextMenuPos({ x: rect.right - 140, y: rect.bottom + 4 });
            }}
            title="Panel Options"
          >
            <MoreVertical size={13} />
          </button>

          {/* Quick Close 'X' Button */}
          <button
            className="panel-btn close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(widget.id);
            }}
            title="Remove Panel from Workspace"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Body Content (hidden when minimized) */}
      {!isMin && (
        <div className="panel-body">
          {children}
        </div>
      )}

      {/* Border & Corner Resizing Grips (active when not locked and not maximized/minimized) */}
      {!isLocked && !isMax && !isMin && (
        <>
          <div className="resize-edge resize-edge-n" onMouseDown={(e) => handleResizeStart(e, 'n')} />
          <div className="resize-edge resize-edge-s" onMouseDown={(e) => handleResizeStart(e, 's')} />
          <div className="resize-edge resize-edge-w" onMouseDown={(e) => handleResizeStart(e, 'w')} />
          <div className="resize-edge resize-edge-e" onMouseDown={(e) => handleResizeStart(e, 'e')} />

          <div className="resize-corner resize-corner-nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
          <div className="resize-corner resize-corner-ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
          <div className="resize-corner resize-corner-sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
          <div className="resize-corner resize-corner-se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
        </>
      )}

      {/* Right-click & 3-dot Context Menu */}
      {contextMenuPos && (
        <div 
          className="context-menu"
          style={{ left: `${contextMenuPos.x}px`, top: `${contextMenuPos.y}px` }}
        >
          <div 
            className="context-item"
            onClick={() => {
              onUpdate({ isMaximized: !isMax });
              setContextMenuPos(null);
            }}
          >
            <Maximize2 size={13} />
            <span>{isMax ? 'Restore Dimensions' : 'Maximize Panel'}</span>
          </div>

          <div 
            className="context-item"
            onClick={() => {
              onDuplicate(widget);
              setContextMenuPos(null);
            }}
          >
            <Copy size={13} />
            <span>Duplicate Widget</span>
          </div>

          <div 
            className="context-item"
            onClick={() => {
              alert(`Configuration settings for: ${widget.title}`);
              setContextMenuPos(null);
            }}
          >
            <Settings size={13} />
            <span>Configure Filters</span>
          </div>

          <div className="context-divider" />

          <div 
            className="context-item"
            style={{ color: 'var(--threat-l5)' }}
            onClick={() => {
              onRemove(widget.id);
              setContextMenuPos(null);
            }}
          >
            <X size={13} />
            <span>Remove from Workspace</span>
          </div>
        </div>
      )}
    </div>
  );
};
