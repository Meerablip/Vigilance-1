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

  // Handle Dragging via Pointer Events (Capture pointer so events are never lost)
  const handleHeaderPointerDown = (e: React.PointerEvent) => {
    if (isLocked || widget.isMaximized || (e.target as HTMLElement).closest('.panel-btn')) return;
    e.preventDefault();
    onFocus(widget.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    isDragging.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialWidgetPos.current = { x: widget.x, y: widget.y };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDragging.current) return;
      const scale = Math.max(0.2, zoom);
      const deltaX = Math.round((moveEvent.clientX - dragStartPos.current.x) / (gridSize * scale));
      const deltaY = Math.round((moveEvent.clientY - dragStartPos.current.y) / (gridSize * scale));

      // Endless canvas: allow moving anywhere
      const newX = Math.max(0, initialWidgetPos.current.x + deltaX);
      const newY = Math.max(0, initialWidgetPos.current.y + deltaY);

      onUpdate({ x: newX, y: newY });
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      isDragging.current = false;
      try {
        (upEvent.target as HTMLElement).releasePointerCapture(upEvent.pointerId);
      } catch (_) {}
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Handle Resizing via Pointer Events (Smooth real-time expansion with pointer capture)
  const handleResizePointerDown = (e: React.PointerEvent, direction: string) => {
    if (isLocked || widget.isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus(widget.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    isResizing.current = true;
    resizeDirection.current = direction;
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    initialWidgetBounds.current = { x: widget.x, y: widget.y, w: widget.w, h: widget.h };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isResizing.current) return;
      const scale = Math.max(0.2, zoom);
      const deltaGridX = Math.round((moveEvent.clientX - resizeStartPos.current.x) / (gridSize * scale));
      const deltaGridY = Math.round((moveEvent.clientY - resizeStartPos.current.y) / (gridSize * scale));

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
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      isResizing.current = false;
      try {
        (upEvent.target as HTMLElement).releasePointerCapture(upEvent.pointerId);
      } catch (_) {}
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Escape key handler to quickly restore from fullscreen
  useEffect(() => {
    if (!widget.isMaximized) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onUpdate({ isMaximized: false });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [widget.isMaximized, onUpdate]);

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

  // Isolate module wheel events so internal scrolling or map zooming never affects the modular canvas
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const stopWheelBubble = (e: WheelEvent) => {
      e.stopPropagation();
    };

    el.addEventListener('wheel', stopWheelBubble, { passive: true });
    return () => {
      el.removeEventListener('wheel', stopWheelBubble);
    };
  }, []);

  // Compute CSS placement
  const isMax = widget.isMaximized;
  const isMin = widget.isMinimized;

  const panelStyle: React.CSSProperties = isMax ? {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1000,
    borderRadius: 0,
    border: 'none',
    boxShadow: 'none'
  } : {
    position: 'absolute',
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
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div 
        className="panel-header"
        onPointerDown={handleHeaderPointerDown}
        onDoubleClick={() => {
          if (isMin) {
            onUpdate({ isMinimized: false });
          } else {
            onUpdate({ isMaximized: !isMax });
          }
        }}
        style={{ cursor: isMin ? 'pointer' : isMax ? 'default' : 'grab' }}
      >
        <div className="panel-title-area">
          {!isMax && <Move size={12} color="var(--text-muted)" style={{ cursor: 'grab' }} />}
          <span>{widget.title}</span>
          {isMax && (
            <span style={{
              fontSize: '9px',
              fontFamily: 'monospace',
              fontWeight: 700,
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '1px 6px',
              borderRadius: '2px',
              marginLeft: '6px'
            }}>
              FULLSCREEN EXPANDED (ESC TO RESTORE)
            </span>
          )}
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
          {/* Minimize / Expand (hidden in fullscreen) */}
          {!isMax && (
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
          )}

          {/* Maximize / Restore */}
          <button
            className="panel-btn"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isMaximized: !isMax });
            }}
            title={isMax ? 'Restore Size (Escape)' : 'Maximize to Full Workspace'}
          >
            {isMax ? <Minimize2 size={13} color="#38bdf8" /> : <Maximize2 size={13} />}
          </button>

          {/* 3-Dot Contextual Menu */}
          {!isMax && (
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
          )}

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
        <div className="panel-body" style={{ height: isMax ? 'calc(100% - 32px)' : undefined }}>
          {children}
        </div>
      )}

      {/* Border & Corner Resizing Grips (active when not locked and not maximized/minimized) */}
      {!isLocked && !isMax && !isMin && (
        <>
          <div className="resize-edge resize-edge-n" onPointerDown={(e) => handleResizePointerDown(e, 'n')} />
          <div className="resize-edge resize-edge-s" onPointerDown={(e) => handleResizePointerDown(e, 's')} />
          <div className="resize-edge resize-edge-w" onPointerDown={(e) => handleResizePointerDown(e, 'w')} />
          <div className="resize-edge resize-edge-e" onPointerDown={(e) => handleResizePointerDown(e, 'e')} />

          <div className="resize-corner resize-corner-nw" onPointerDown={(e) => handleResizePointerDown(e, 'nw')} />
          <div className="resize-corner resize-corner-ne" onPointerDown={(e) => handleResizePointerDown(e, 'ne')} />
          <div className="resize-corner resize-corner-sw" onPointerDown={(e) => handleResizePointerDown(e, 'sw')} />
          
          {/* Visible Tactical Corner Gripper in Southeast */}
          <div 
            className="resize-corner resize-corner-se" 
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            title="Click and drag to expand or resize module"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" style={{ pointerEvents: 'none', marginBottom: '2px', marginRight: '2px', opacity: 0.7 }}>
              <line x1="8" y1="2" x2="2" y2="8" stroke="var(--military-green-border-focus, #38bdf8)" strokeWidth="1.2" />
              <line x1="8" y1="5" x2="5" y2="8" stroke="var(--military-green-border-focus, #38bdf8)" strokeWidth="1.2" />
              <line x1="8" y1="8" x2="8" y2="8" stroke="var(--military-green-border-focus, #38bdf8)" strokeWidth="1.2" />
            </svg>
          </div>
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
