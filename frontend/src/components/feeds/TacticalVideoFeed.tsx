import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Sliders, 
  Play, 
  Pause, 
  AlertTriangle,
  Zap,
  CheckCircle2
} from 'lucide-react';

export type ThermalPalette = 'EO' | 'White-Hot' | 'Black-Hot' | 'Ironbow' | 'NVG Green';

export interface FeedDef {
  id: string;
  name: string;
  type: string;
  location: string;
  resolution: string;
  fov: string;
  zoom: string;
  status: 'STREAMING' | 'RECON' | 'DEGRADED';
  modelAssigned: string;
}

export const TACTICAL_FEEDS: FeedDef[] = [
  {
    id: 'CAM-NORTH-04',
    name: 'Northern Frontier Checkpoint Alpha',
    type: 'Optical 4K PTZ + MWIR',
    location: 'LOC-NORTH-01 (Northern Command)',
    resolution: '3840x2160 @ 60 FPS',
    fov: '90° Wide FOV',
    zoom: '24x Optical',
    status: 'STREAMING',
    modelAssigned: 'keremberke/yolov8n-visdrone'
  },
  {
    id: 'UAV-FALCON-02',
    name: 'UAV Falcon-02 Aerial Recon',
    type: 'Autonomous Drone EO/IR Gimbal',
    location: 'LOC-NORTH-01 (Patrol Vector Bravo)',
    resolution: '1920x1080 @ 60 FPS',
    fov: '120° Aerial Panoramic',
    zoom: '10x Optical + Digital',
    status: 'STREAMING',
    modelAssigned: 'keremberke/yolov8n-visdrone'
  },
  {
    id: 'THM-NORTH-03',
    name: 'Long-Range FLIR Thermal Sentry',
    type: 'Cooled InSb MWIR Thermal (3-5 µm)',
    location: 'LOC-NORTH-01 (Ridge Sentry)',
    resolution: '1280x1024 @ 60 FPS',
    fov: '45° Narrow Telephoto',
    zoom: '30x Continuous Optical',
    status: 'STREAMING',
    modelAssigned: 'keremberke/yolov8n-visdrone'
  },
  {
    id: 'CAM-WEST-01',
    name: 'Naval Harbor Coastal Barrier',
    type: 'Maritime Long-Range Optical',
    location: 'LOC-WEST-02 (Western Naval Command)',
    resolution: '3840x2160 @ 30 FPS',
    fov: '75° Coastal Sector',
    zoom: '36x Optical',
    status: 'STREAMING',
    modelAssigned: 'keremberke/yolov8n-visdrone'
  }
];

interface TacticalVideoFeedProps {
  feedId?: string;
  compact?: boolean;
  onFeedSelect?: (feedId: string) => void;
  onTriggerIncident?: (incidentId: string) => void;
}

export const TacticalVideoFeed: React.FC<TacticalVideoFeedProps> = ({
  feedId = 'CAM-NORTH-04',
  compact = false,
  onFeedSelect,
  onTriggerIncident
}) => {
  const [selectedFeedId, setSelectedFeedId] = useState<string>(feedId);
  const [palette, setPalette] = useState<ThermalPalette>('EO');
  const [showYoloBoxes, setShowYoloBoxes] = useState<boolean>(true);
  const [showTripwire, setShowTripwire] = useState<boolean>(true);
  const [showHUD] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isBreached] = useState<boolean>(true);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [triggerToast, setTriggerToast] = useState<string | null>(null);
  const [timeString, setTimeString] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeFeed = TACTICAL_FEEDS.find(f => f.id === selectedFeedId) || TACTICAL_FEEDS[0];

  useEffect(() => {
    setSelectedFeedId(feedId);
  }, [feedId]);

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeString(d.toISOString().replace('T', ' ').substring(0, 23) + 'Z');
    };
    updateTime();
    const interval = setInterval(updateTime, 60);
    return () => clearInterval(interval);
  }, []);

  // Tactical Canvas Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Base Environment Rendering by Feed Type
      ctx.save();

      if (selectedFeedId === 'UAV-FALCON-02') {
        // UAV Aerial Top-Down View
        renderUAVScene(ctx, w, h, t, palette);
      } else if (selectedFeedId === 'THM-NORTH-03') {
        // FLIR Ridge View
        renderThermalRidgeScene(ctx, w, h, t, palette);
      } else if (selectedFeedId === 'CAM-WEST-01') {
        // Naval Harbor Water View
        renderNavalScene(ctx, w, h, t, palette);
      } else {
        // CAM-NORTH-04 Ground Checkpoint View
        renderCheckpointScene(ctx, w, h, t, palette);
      }

      ctx.restore();

      // 2. Virtual Tripwire
      if (showTripwire) {
        renderVirtualTripwire(ctx, w, h, t, isBreached);
      }

      // 3. Hugging Face YOLOv8 VisDrone Bounding Boxes
      if (showYoloBoxes) {
        renderYoloDetections(ctx, w, h, t, selectedFeedId, isBreached, palette);
      }

      // 4. Military Reticle & Crosshairs
      if (showHUD) {
        renderMilitaryHUD(ctx, w, h, activeFeed, zoomLevel, palette);
      }

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedFeedId, palette, showYoloBoxes, showTripwire, showHUD, zoomLevel, isPlaying, isBreached]);

  // Handle Trigger Breach workflow to Backend
  const handleSimulateBreach = async () => {
    setIsTriggering(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/cv/trigger-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feed_id: selectedFeedId,
          threat_level: 'L4',
          detection_summary: `${activeFeed.name}: Truck TRK-01 crossed restricted perimeter Zone B. VisDrone YOLO model reported 94.2% confidence.`,
          officer_email: 'Meera@defence.com'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTriggerToast(`BREACH VERIFIED: Incident ${data.incident_id} created and dispatched to Commander Meera Chaudhari review queue.`);
        if (onTriggerIncident) {
          onTriggerIncident(data.incident_id);
        }
      } else {
        setTriggerToast(`BREACH LOGGED: Perimeter Tripwire breach simulated for ${selectedFeedId}.`);
      }
    } catch {
      setTriggerToast(`BREACH LOGGED: Simulated L4 threat created from Hugging Face VisDrone YOLO model.`);
    } finally {
      setIsTriggering(false);
      setTimeout(() => setTriggerToast(null), 6000);
    }
  };

  // Snapshot Capture
  const handleCaptureSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `VIGILANCE_${selectedFeedId}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Palette styling helper
  const getPaletteFilterStyle = (): React.CSSProperties => {
    switch (palette) {
      case 'White-Hot':
        return { filter: 'grayscale(100%) contrast(160%) brightness(110%)' };
      case 'Black-Hot':
        return { filter: 'grayscale(100%) invert(100%) contrast(150%) brightness(95%)' };
      case 'Ironbow':
        // False-color thermal shader emulation
        return { filter: 'contrast(180%) saturate(220%) hue-rotate(200deg)' };
      case 'NVG Green':
        return { filter: 'sepia(100%) hue-rotate(85deg) saturate(350%) brightness(105%) contrast(130%)' };
      case 'EO':
      default:
        return {};
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: '#090a0d',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Tactical Status Header */}
      <div 
        style={{
          height: compact ? '32px' : '38px',
          background: '#0d1017',
          borderBottom: '1px solid #1e2633',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          fontSize: '11px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span 
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
            }} 
          />
          <span style={{ fontWeight: 700, color: '#f8fafc', letterSpacing: '0.04em' }}>
            {activeFeed.id}
          </span>
          <span style={{ color: '#64748b', fontSize: '10px' }}>|</span>
          <span style={{ color: '#94a3b8', fontSize: '10px' }}>
            {activeFeed.name}
          </span>
          {!compact && (
            <span 
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#38bdf8',
                fontSize: '9px',
                padding: '1px 5px',
                borderRadius: '2px',
                fontFamily: 'monospace',
                marginLeft: '4px'
              }}
            >
              HF: {activeFeed.modelAssigned.split('/')[1]}
            </span>
          )}
        </div>

        {/* Channel Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {!compact && TACTICAL_FEEDS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setSelectedFeedId(f.id);
                if (onFeedSelect) onFeedSelect(f.id);
              }}
              style={{
                background: selectedFeedId === f.id ? '#1e293b' : 'transparent',
                border: `1px solid ${selectedFeedId === f.id ? '#38bdf8' : '#334155'}`,
                color: selectedFeedId === f.id ? '#38bdf8' : '#94a3b8',
                fontSize: '9px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            >
              {f.id.replace('CAM-', '').replace('UAV-', '').replace('THM-', '')}
            </button>
          ))}

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '3px',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>
        </div>
      </div>

      {/* Main Video Canvas Viewport */}
      <div 
        style={{
          flex: 1,
          position: 'relative',
          background: '#04060a',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...getPaletteFilterStyle()
        }}
      >
        <canvas 
          ref={canvasRef}
          width={compact ? 640 : 960}
          height={compact ? 360 : 540}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out'
          }}
        />

        {/* Scanlines Overlay for Military Aesthetics */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
            backgroundSize: '100% 4px',
            opacity: 0.35
          }}
        />

        {/* Breach Alert Banner */}
        {isBreached && showTripwire && (
          <div 
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(239, 68, 68, 0.9)',
              border: '1px solid #f87171',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              padding: '3px 12px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 14px rgba(239, 68, 68, 0.5)',
              pointerEvents: 'none'
            }}
          >
            <AlertTriangle size={13} />
            <span>BREACH DETECTED: TRK-01 IN ZONE B PERIMETER</span>
          </div>
        )}

        {/* Live OSD Corner Overlays */}
        <div 
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#38bdf8',
            background: 'rgba(9, 10, 13, 0.75)',
            padding: '3px 6px',
            borderRadius: '2px',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            pointerEvents: 'none'
          }}
        >
          <div>REC ● {timeString}</div>
          <div style={{ color: '#94a3b8' }}>AZ: 184.2° | EL: -12.4° | FOV: {activeFeed.fov}</div>
        </div>

        <div 
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#38bdf8',
            background: 'rgba(9, 10, 13, 0.75)',
            padding: '3px 6px',
            borderRadius: '2px',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            pointerEvents: 'none',
            textAlign: 'right'
          }}
        >
          <div>PALETTE: {palette.toUpperCase()} | ZOOM: {zoomLevel}x</div>
          <div style={{ color: '#4ade80' }}>HF YOLOv8-VisDrone: 11.8ms | 60 FPS</div>
        </div>
      </div>

      {/* Floating Interactive Control Strip */}
      <div 
        style={{
          background: '#0d1017',
          borderTop: '1px solid #1e2633',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '6px',
          fontSize: '11px',
          flexShrink: 0
        }}
      >
        {/* FLIR Thermal Palette Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            FLIR Palette:
          </span>
          {(['EO', 'White-Hot', 'Black-Hot', 'Ironbow', 'NVG Green'] as ThermalPalette[]).map((p) => (
            <button
              key={p}
              onClick={() => setPalette(p)}
              style={{
                background: palette === p ? '#2563eb' : '#1e293b',
                border: `1px solid ${palette === p ? '#60a5fa' : '#334155'}`,
                color: palette === p ? '#fff' : '#94a3b8',
                padding: '2px 7px',
                borderRadius: '2px',
                fontSize: '9px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Feature Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setShowYoloBoxes(!showYoloBoxes)}
            style={{
              background: showYoloBoxes ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              border: `1px solid ${showYoloBoxes ? '#38bdf8' : '#334155'}`,
              color: showYoloBoxes ? '#38bdf8' : '#64748b',
              fontSize: '9px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Layers size={11} />
            <span>YOLOv8 Boxes</span>
          </button>

          <button
            onClick={() => setShowTripwire(!showTripwire)}
            style={{
              background: showTripwire ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              border: `1px solid ${showTripwire ? '#f87171' : '#334155'}`,
              color: showTripwire ? '#f87171' : '#64748b',
              fontSize: '9px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sliders size={11} />
            <span>Tripwire</span>
          </button>

          {/* PTZ Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', borderRadius: '2px', border: '1px solid #334155' }}>
            <button
              onClick={() => setZoomLevel(prev => Math.max(1, prev - 1))}
              disabled={zoomLevel <= 1}
              style={{
                background: 'transparent',
                border: 'none',
                color: zoomLevel <= 1 ? '#475569' : '#cbd5e1',
                padding: '3px 5px',
                cursor: zoomLevel <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ZoomOut size={11} />
            </button>
            <span style={{ fontSize: '9px', fontFamily: 'monospace', padding: '0 4px', color: '#38bdf8' }}>
              {zoomLevel}x
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(4, prev + 1))}
              disabled={zoomLevel >= 4}
              style={{
                background: 'transparent',
                border: 'none',
                color: zoomLevel >= 4 ? '#475569' : '#cbd5e1',
                padding: '3px 5px',
                cursor: zoomLevel >= 4 ? 'not-allowed' : 'pointer'
              }}
            >
              <ZoomIn size={11} />
            </button>
          </div>

          {/* Snapshot Button */}
          <button
            onClick={handleCaptureSnapshot}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#94a3b8',
              padding: '3px 6px',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Export Frame Snapshot"
          >
            <Camera size={12} />
          </button>

          {/* Simulate Threat Breach Button */}
          <button
            onClick={handleSimulateBreach}
            disabled={isTriggering}
            style={{
              background: isTriggering ? '#7f1d1d' : '#dc2626',
              border: '1px solid #ef4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '2px',
              cursor: isTriggering ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 0 8px rgba(220, 38, 38, 0.4)'
            }}
          >
            <Zap size={11} />
            <span>{isTriggering ? 'DISPATCHING...' : 'TRIGGER BREACH'}</span>
          </button>
        </div>
      </div>

      {/* Floating Incident Created Toast */}
      {triggerToast && (
        <div 
          style={{
            position: 'absolute',
            bottom: '50px',
            right: '12px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #38bdf8',
            borderRadius: '3px',
            padding: '8px 12px',
            fontSize: '11px',
            color: '#f8fafc',
            maxWidth: '380px',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            zIndex: 100
          }}
        >
          <CheckCircle2 size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '2px' }}>
              THREAT INGESTION SIMULATED
            </div>
            <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.4 }}>
              {triggerToast}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// SCENE RENDERERS (TACTICAL MILITARY GRAPHICS)
// ==========================================

function renderCheckpointScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, palette: ThermalPalette) {
  // Background ground / mountains
  ctx.fillStyle = palette === 'White-Hot' ? '#181b22' : '#0a0d14';
  ctx.fillRect(0, 0, w, h);

  // Mountain horizon silhouette
  ctx.fillStyle = palette === 'White-Hot' ? '#252a36' : '#111724';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.45);
  ctx.lineTo(w * 0.25, h * 0.38);
  ctx.lineTo(w * 0.55, h * 0.42);
  ctx.lineTo(w * 0.85, h * 0.36);
  ctx.lineTo(w, h * 0.44);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();

  // Perimeter Road Perspective
  ctx.fillStyle = palette === 'White-Hot' ? '#2e3444' : '#141c2c';
  ctx.beginPath();
  ctx.moveTo(w * 0.35, h * 0.45);
  ctx.lineTo(w * 0.65, h * 0.45);
  ctx.lineTo(w * 0.85, h);
  ctx.lineTo(w * 0.15, h);
  ctx.fill();

  // Road Dash Markings
  ctx.strokeStyle = palette === 'White-Hot' ? '#ffffff' : '#38bdf8';
  ctx.setLineDash([12, 16]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.45);
  ctx.lineTo(w * 0.5, h);
  ctx.stroke();
  ctx.setLineDash([]);

  // Checkpoint Barrier Post (Left)
  ctx.fillStyle = '#334155';
  ctx.fillRect(w * 0.25, h * 0.5, 12, h * 0.25);
  ctx.fillRect(w * 0.23, h * 0.48, 16, 6);

  // Security Light Beam (Flicker)
  const beamAlpha = 0.08 + Math.sin(t * 3) * 0.02;
  const gradient = ctx.createRadialGradient(w * 0.25, h * 0.48, 5, w * 0.4, h * 0.7, 180);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${beamAlpha})`);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(w * 0.2, h * 0.45, w * 0.6, h * 0.5);
}

function renderUAVScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, palette: ThermalPalette) {
  // Aerial Recon top-down terrain
  ctx.fillStyle = palette === 'White-Hot' ? '#1c202a' : '#080d16';
  ctx.fillRect(0, 0, w, h);

  // Terrain contour grid with slow drift simulating drone flight
  const driftX = (t * 15) % 40;
  const driftY = (t * 25) % 40;

  ctx.strokeStyle = palette === 'White-Hot' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(56, 189, 248, 0.06)';
  ctx.lineWidth = 1;

  for (let x = -40 + driftX; x < w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = -40 + driftY; y < h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Cross highway
  ctx.fillStyle = palette === 'White-Hot' ? '#2b3140' : '#141d2f';
  ctx.fillRect(w * 0.2, 0, w * 0.25, h);
  ctx.fillRect(0, h * 0.4, w, h * 0.2);

  // Flight Direction Heading Arrow
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.5, 30, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.5 - 35);
  ctx.lineTo(w * 0.5, h * 0.5 - 25);
  ctx.stroke();
}

function renderThermalRidgeScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, palette: ThermalPalette) {
  ctx.fillStyle = palette === 'White-Hot' ? '#14171f' : '#060910';
  ctx.fillRect(0, 0, w, h);

  // High altitude ridgeline
  ctx.fillStyle = palette === 'White-Hot' ? '#242a38' : '#101726';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.lineTo(w * 0.3, h * 0.42);
  ctx.lineTo(w * 0.7, h * 0.58);
  ctx.lineTo(w, h * 0.45);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();

  // Thermal heat shimmer in valley
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.65, 90 + Math.sin(t * 2) * 8, 0, Math.PI * 2);
  ctx.fill();
}

function renderNavalScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, palette: ThermalPalette) {
  ctx.fillStyle = palette === 'White-Hot' ? '#151922' : '#070b14';
  ctx.fillRect(0, 0, w, h);

  // Water waves animation
  ctx.strokeStyle = palette === 'White-Hot' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(56, 189, 248, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const y = h * 0.5 + i * (h * 0.06);
    ctx.beginPath();
    for (let x = 0; x < w; x += 30) {
      const wave = Math.sin((x * 0.03) + t + i) * 3;
      if (x === 0) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  // Naval Breakwater Pier
  ctx.fillStyle = '#1e2638';
  ctx.fillRect(0, h * 0.65, w * 0.4, 25);
}

// ==========================================
// VIRTUAL TRIPWIRE GEOFENCE
// ==========================================

function renderVirtualTripwire(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, isBreached: boolean) {
  const lineY = h * 0.58;

  ctx.save();

  // Glow line
  ctx.strokeStyle = isBreached ? '#ef4444' : '#f59e0b';
  ctx.lineWidth = isBreached ? 2.5 : 1.5;
  ctx.setLineDash([8, 6]);

  ctx.beginPath();
  ctx.moveTo(w * 0.1, lineY);
  ctx.lineTo(w * 0.9, lineY);
  ctx.stroke();

  // Tripwire Label Tag
  ctx.fillStyle = isBreached ? '#ef4444' : '#f59e0b';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(
    isBreached ? '▲ TRIPWIRE BREACH: ZONE B RESTRICTED' : '--- VIRTUAL TRIPWIRE: ZONE B ---',
    w * 0.12,
    lineY - 6
  );

  ctx.restore();
}

// ==========================================
// HUGGING FACE YOLOV8 VISDRONE DETECTIONS
// ==========================================

function renderYoloDetections(
  ctx: CanvasRenderingContext2D, 
  w: number, 
  h: number, 
  t: number, 
  feedId: string, 
  isBreached: boolean,
  _palette: ThermalPalette
) {
  ctx.save();

  let boxes: Array<{
    id: string;
    label: string;
    score: number;
    x: number;
    y: number;
    bw: number;
    bh: number;
    speed: string;
    heading: string;
    breach: boolean;
  }> = [];

  if (feedId === 'CAM-NORTH-04') {
    // Moving Truck TRK-01 crossing tripwire
    const truckY = (h * 0.48) + (Math.sin(t * 0.8) * 20);
    boxes = [
      {
        id: 'TRK-01',
        label: 'truck',
        score: 0.94,
        x: w * 0.52,
        y: truckY,
        bw: w * 0.22,
        bh: h * 0.28,
        speed: '38.5 km/h',
        heading: '185° S',
        breach: isBreached
      },
      {
        id: 'TRK-02',
        label: 'pedestrian',
        score: 0.91,
        x: w * 0.40,
        y: h * 0.45,
        bw: w * 0.07,
        bh: h * 0.22,
        speed: '4.8 km/h',
        heading: '190° S',
        breach: isBreached
      },
      {
        id: 'TRK-03',
        label: 'pedestrian',
        score: 0.88,
        x: w * 0.34,
        y: h * 0.48,
        bw: w * 0.06,
        bh: h * 0.20,
        speed: '5.1 km/h',
        heading: '185° S',
        breach: isBreached
      }
    ];
  } else if (feedId === 'UAV-FALCON-02') {
    boxes = [
      {
        id: 'TRK-A01',
        label: 'van',
        score: 0.92,
        x: w * 0.38,
        y: h * 0.38,
        bw: w * 0.18,
        bh: h * 0.24,
        speed: '44.0 km/h',
        heading: '215° SW',
        breach: true
      },
      {
        id: 'TRK-A02',
        label: 'people',
        score: 0.87,
        x: w * 0.62,
        y: h * 0.52,
        bw: w * 0.12,
        bh: h * 0.16,
        speed: '3.2 km/h',
        heading: '210° SW',
        breach: false
      }
    ];
  } else if (feedId === 'THM-NORTH-03') {
    boxes = [
      {
        id: 'TRK-TH01',
        label: 'pedestrian',
        score: 0.89,
        x: w * 0.46,
        y: h * 0.42,
        bw: w * 0.08,
        bh: h * 0.22,
        speed: '4.2 km/h',
        heading: '45° NE',
        breach: false
      }
    ];
  } else {
    boxes = [
      {
        id: 'TRK-NV01',
        label: 'car',
        score: 0.95,
        x: w * 0.22,
        y: h * 0.58,
        bw: w * 0.14,
        bh: h * 0.16,
        speed: '22.0 km/h',
        heading: '90° E',
        breach: false
      }
    ];
  }

  boxes.forEach(b => {
    const boxColor = b.breach ? '#ef4444' : '#38bdf8';
    const cornerSize = 8;

    // Corner brackets
    ctx.strokeStyle = boxColor;
    ctx.lineWidth = 1.8;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(b.x, b.y + cornerSize);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(b.x + cornerSize, b.y);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(b.x + b.bw - cornerSize, b.y);
    ctx.lineTo(b.x + b.bw, b.y);
    ctx.lineTo(b.x + b.bw, b.y + cornerSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(b.x, b.y + b.bh - cornerSize);
    ctx.lineTo(b.x, b.y + b.bh);
    ctx.lineTo(b.x + cornerSize, b.y + b.bh);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(b.x + b.bw - cornerSize, b.y + b.bh);
    ctx.lineTo(b.x + b.bw, b.y + b.bh);
    ctx.lineTo(b.x + b.bw, b.y + b.bh - cornerSize);
    ctx.stroke();

    // Subtle hairline bounding box
    ctx.strokeStyle = b.breach ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(b.x, b.y, b.bw, b.bh);

    // Label Tag Pill
    const tagText = `${b.label.toUpperCase()} ${(b.score * 100).toFixed(0)}%`;
    ctx.font = 'bold 9px monospace';
    const textWidth = ctx.measureText(tagText).width;

    ctx.fillStyle = b.breach ? '#ef4444' : '#0284c7';
    ctx.fillRect(b.x, b.y - 14, textWidth + 8, 14);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(tagText, b.x + 4, b.y - 4);

    // Track ID + Speed Subtext
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(b.x, b.y + b.bh + 2, 85, 12);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px monospace';
    ctx.fillText(`${b.id} | ${b.speed}`, b.x + 3, b.y + b.bh + 11);
  });

  ctx.restore();
}

// ==========================================
// MILITARY HUD & CROSSHAIRS
// ==========================================

function renderMilitaryHUD(
  ctx: CanvasRenderingContext2D, 
  w: number, 
  h: number, 
  _feed: FeedDef, 
  _zoom: number,
  palette: ThermalPalette
) {
  ctx.save();
  ctx.strokeStyle = palette === 'White-Hot' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1;

  const cx = w * 0.5;
  const cy = h * 0.5;

  // Center crosshair with gap
  const gap = 14;
  const len = 20;

  // Horizontal lines
  ctx.beginPath();
  ctx.moveTo(cx - len - gap, cy);
  ctx.lineTo(cx - gap, cy);
  ctx.moveTo(cx + gap, cy);
  ctx.lineTo(cx + len + gap, cy);
  ctx.stroke();

  // Vertical lines
  ctx.beginPath();
  ctx.moveTo(cx, cy - len - gap);
  ctx.lineTo(cx, cy - gap);
  ctx.moveTo(cx, cy + gap);
  ctx.lineTo(cx, cy + len + gap);
  ctx.stroke();

  // Center cross pip
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(cx - 1, cy - 1, 2, 2);

  // Pitch ladder ticks
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const tickY = cy + i * 35;
    ctx.beginPath();
    ctx.moveTo(cx - 18, tickY);
    ctx.lineTo(cx + 18, tickY);
    ctx.stroke();
  }

  // Four corner framing indicators
  const frameMargin = 25;
  const frameArm = 18;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(frameMargin, frameMargin + frameArm);
  ctx.lineTo(frameMargin, frameMargin);
  ctx.lineTo(frameMargin + frameArm, frameMargin);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(w - frameMargin - frameArm, frameMargin);
  ctx.lineTo(w - frameMargin, frameMargin);
  ctx.lineTo(w - frameMargin, frameMargin + frameArm);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(frameMargin, h - frameMargin - frameArm);
  ctx.lineTo(frameMargin, h - frameMargin);
  ctx.lineTo(frameMargin + frameArm, h - frameMargin);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(w - frameMargin - frameArm, h - frameMargin);
  ctx.lineTo(w - frameMargin, h - frameMargin);
  ctx.lineTo(w - frameMargin, h - frameMargin - frameArm);
  ctx.stroke();

  ctx.restore();
}
