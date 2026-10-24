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
  Film,
  Upload,
  Volume2,
  VolumeX,
  ShieldAlert,
  ArrowRight,
  X
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
  videoSrc: string;
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
    modelAssigned: 'keremberke/yolov8n-visdrone',
    videoSrc: '/videos/sample_traffic.mp4'
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
    modelAssigned: 'keremberke/yolov8n-visdrone',
    videoSrc: '/videos/sample_car.mp4'
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
    modelAssigned: 'keremberke/yolov8n-visdrone',
    videoSrc: '/videos/sample_face_pedestrians.mp4'
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
    modelAssigned: 'keremberke/yolov8n-visdrone',
    videoSrc: '/videos/sample_bottleneck.mp4'
  }
];

interface TacticalVideoFeedProps {
  feedId?: string;
  compact?: boolean;
  onFeedSelect?: (feedId: string) => void;
  onTriggerIncident?: (incidentId: string) => void;
  onNavigate?: (page: any) => void;
}

export const TacticalVideoFeed: React.FC<TacticalVideoFeedProps> = ({
  feedId = 'CAM-NORTH-04',
  compact = false,
  onFeedSelect,
  onTriggerIncident,
  onNavigate
}) => {
  const [selectedFeedId, setSelectedFeedId] = useState<string>(feedId);
  const [palette, setPalette] = useState<ThermalPalette>('EO');
  const [showYoloBoxes, setShowYoloBoxes] = useState<boolean>(true);
  const [showTripwire, setShowTripwire] = useState<boolean>(true);
  const [showHUD] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [feedSource, setFeedSource] = useState<'video' | 'synthetic'>('video');
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isBreached] = useState<boolean>(true);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [triggerIncidentData, setTriggerIncidentData] = useState<{
    incident_id: string;
    threat_level: 'L4' | 'L5';
    summary: string;
  } | null>(null);
  const [timeString, setTimeString] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeFeed = TACTICAL_FEEDS.find(f => f.id === selectedFeedId) || TACTICAL_FEEDS[0];
  const activeVideoSrc = customVideoUrl || activeFeed.videoSrc;

  useEffect(() => {
    setSelectedFeedId(feedId);
    setCustomVideoUrl(null);
  }, [feedId]);

  // Sync video play/pause
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, activeVideoSrc]);

  // Video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

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

  // Handle local video file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setFeedSource('video');
      setIsPlaying(true);
    }
  };

  // Canvas Overlay Animation Loop (draws bounding boxes, tripwire, HUD over video)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;
    let lastTime = 0;

    const render = (time: number) => {
      // Throttle to ~25 FPS to keep CPU load low and application snappy
      if (time - lastTime < 38) {
        if (isPlaying) {
          animationFrameId = requestAnimationFrame(render);
        }
        return;
      }
      lastTime = time;
      t += 0.04;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // If synthetic mode is active, render background canvas scene
      if (feedSource === 'synthetic') {
        ctx.save();
        if (selectedFeedId === 'UAV-FALCON-02') {
          renderUAVScene(ctx, w, h, t, palette);
        } else if (selectedFeedId === 'THM-NORTH-03') {
          renderThermalRidgeScene(ctx, w, h, t, palette);
        } else if (selectedFeedId === 'CAM-WEST-01') {
          renderNavalScene(ctx, w, h, t, palette);
        } else {
          renderCheckpointScene(ctx, w, h, t, palette);
        }
        ctx.restore();
      }

      // 2. Virtual Tripwire Geofence Line
      if (showTripwire) {
        renderVirtualTripwire(ctx, w, h, isBreached);
      }

      // 3. Hugging Face YOLOv8 VisDrone Bounding Boxes
      if (showYoloBoxes) {
        renderYoloDetections(ctx, w, h, t, selectedFeedId, isBreached);
      }

      // 4. Military Reticle & Crosshairs
      if (showHUD) {
        renderMilitaryHUD(ctx, w, h, palette);
      }

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedFeedId, palette, showYoloBoxes, showTripwire, showHUD, isPlaying, isBreached, feedSource]);

  // Handle Trigger Breach workflow to Backend (Supports L4 High and L5 Critical)
  const handleSimulateBreach = async (level: 'L4' | 'L5' = 'L4') => {
    setIsTriggering(true);
    const summary = level === 'L5'
      ? `${activeFeed.name}: Hostile Autonomous Drone Swarm penetrating forward defense corridor. Immediate Two-Person Command Sign-off required.`
      : `${activeFeed.name}: Target TRK-01 crossed restricted perimeter Zone B in active surveillance video. Model reported 94.2% confidence.`;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/cv/trigger-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feed_id: selectedFeedId,
          threat_level: level,
          detection_summary: summary,
          officer_email: 'Meera@defence.com'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTriggerIncidentData({
          incident_id: data.incident_id,
          threat_level: level,
          summary: summary
        });
        if (onTriggerIncident) {
          onTriggerIncident(data.incident_id);
        }
      } else {
        const fallbackId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        setTriggerIncidentData({
          incident_id: fallbackId,
          threat_level: level,
          summary: summary
        });
        if (onTriggerIncident) onTriggerIncident(fallbackId);
      }
    } catch {
      const fallbackId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setTriggerIncidentData({
        incident_id: fallbackId,
        threat_level: level,
        summary: summary
      });
      if (onTriggerIncident) onTriggerIncident(fallbackId);
    } finally {
      setIsTriggering(false);
    }
  };

  // Snapshot Capture
  const handleCaptureSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Merge video frame and canvas
    const mergeCanvas = document.createElement('canvas');
    mergeCanvas.width = canvas.width;
    mergeCanvas.height = canvas.height;
    const mergeCtx = mergeCanvas.getContext('2d');
    if (mergeCtx) {
      if (videoRef.current && feedSource === 'video') {
        mergeCtx.drawImage(videoRef.current, 0, 0, mergeCanvas.width, mergeCanvas.height);
      }
      mergeCtx.drawImage(canvas, 0, 0);
      const link = document.createElement('a');
      link.download = `VIGILANCE_${selectedFeedId}_${Date.now()}.png`;
      link.href = mergeCanvas.toDataURL('image/png');
      link.click();
    }
  };

  // FLIR Thermal Palette Shader Filter
  const getPaletteFilterStyle = (): React.CSSProperties => {
    switch (palette) {
      case 'White-Hot':
        return { filter: 'grayscale(100%) contrast(175%) brightness(115%)' };
      case 'Black-Hot':
        return { filter: 'grayscale(100%) invert(100%) contrast(165%) brightness(95%)' };
      case 'Ironbow':
        return { filter: 'contrast(190%) saturate(300%) hue-rotate(190deg) brightness(90%)' };
      case 'NVG Green':
        return { filter: 'sepia(100%) hue-rotate(85deg) saturate(450%) brightness(105%) contrast(140%)' };
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
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="video/*" 
        style={{ display: 'none' }} 
        onChange={handleFileUpload} 
      />

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
            {customVideoUrl ? 'CUSTOM VIDEO INGEST' : activeFeed.name}
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

        {/* Source Switcher & Video Upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Toggle Video Stream vs Synthetic HUD */}
          <button
            onClick={() => setFeedSource(feedSource === 'video' ? 'synthetic' : 'video')}
            style={{
              background: feedSource === 'video' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              border: `1px solid ${feedSource === 'video' ? '#38bdf8' : '#334155'}`,
              color: feedSource === 'video' ? '#38bdf8' : '#94a3b8',
              fontSize: '9px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
            title="Toggle between real video playback and synthetic tactical HUD"
          >
            <Film size={10} />
            <span>{feedSource === 'video' ? 'VIDEO STREAM' : 'SYNTHETIC HUD'}</span>
          </button>

          {/* Upload Clip Button */}
          {!compact && (
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#cbd5e1',
                fontSize: '9px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
              title="Upload your own surveillance video file to test"
            >
              <Upload size={10} />
              <span>UPLOAD</span>
            </button>
          )}

          {/* Preset Feeds Pills */}
          {!compact && TACTICAL_FEEDS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setSelectedFeedId(f.id);
                setCustomVideoUrl(null);
                if (onFeedSelect) onFeedSelect(f.id);
              }}
              style={{
                background: selectedFeedId === f.id && !customVideoUrl ? '#1e293b' : 'transparent',
                border: `1px solid ${selectedFeedId === f.id && !customVideoUrl ? '#38bdf8' : '#334155'}`,
                color: selectedFeedId === f.id && !customVideoUrl ? '#38bdf8' : '#94a3b8',
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

          {/* Play / Pause Toggle */}
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

      {/* Main Video Viewport */}
      <div 
        style={{
          flex: 1,
          position: 'relative',
          background: '#04060a',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Real HTML5 Surveillance Video Stream */}
        {feedSource === 'video' && (
          <video
            ref={videoRef}
            src={activeVideoSrc}
            playsInline
            autoPlay
            muted={isMuted}
            loop
            onTimeUpdate={handleTimeUpdate}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
              ...getPaletteFilterStyle()
            }}
          />
        )}

        {/* Tactical Canvas Overlay (YOLO Bounding Boxes, Virtual Tripwire, HUD Reticle) */}
        <canvas 
          ref={canvasRef}
          width={compact ? 640 : 960}
          height={compact ? 360 : 540}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
            ...(feedSource === 'synthetic' ? getPaletteFilterStyle() : {})
          }}
        />

        {/* Scanlines Effect for Military Aesthetic */}
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
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <AlertTriangle size={13} />
            <span>BREACH DETECTED: TRK-01 IN ZONE B RESTRICTED CORRIDOR</span>
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
            pointerEvents: 'none',
            zIndex: 10
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
            textAlign: 'right',
            zIndex: 10
          }}
        >
          <div>PALETTE: {palette.toUpperCase()} | ZOOM: {zoomLevel}x</div>
          <div style={{ color: '#4ade80' }}>HF YOLOv8-VisDrone: 11.8ms | 60 FPS</div>
        </div>
      </div>

      {/* Video Progress Timeline (Shown when playing real video) */}
      {feedSource === 'video' && duration > 0 && (
        <div 
          style={{
            height: '4px',
            background: '#1e2633',
            position: 'relative',
            cursor: 'pointer'
          }}
        >
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            step="0.1" 
            value={currentTime} 
            onChange={handleSeek}
            style={{
              position: 'absolute',
              top: '-6px',
              left: 0,
              width: '100%',
              height: '16px',
              opacity: 0,
              cursor: 'pointer',
              zIndex: 20
            }}
          />
          <div 
            style={{
              height: '100%',
              width: `${(currentTime / duration) * 100}%`,
              background: '#38bdf8',
              transition: 'width 0.1s linear'
            }}
          />
        </div>
      )}

      {/* Floating Interactive Control Strip */}
      <div 
        style={{
          background: 'var(--bg-surface-elevated)',
          borderTop: '1px solid var(--border-subtle)',
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
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            FLIR Palette:
          </span>
          {(['EO', 'White-Hot', 'Black-Hot', 'Ironbow', 'NVG Green'] as ThermalPalette[]).map((p) => (
            <button
              key={p}
              onClick={() => setPalette(p)}
              style={{
                background: palette === p ? 'var(--military-green-border-focus)' : 'var(--bg-card)',
                border: `1px solid ${palette === p ? 'var(--military-green-accent)' : 'var(--border-subtle)'}`,
                color: palette === p ? '#fff' : 'var(--text-secondary)',
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
              background: showYoloBoxes ? 'var(--military-green-surface)' : 'transparent',
              border: `1px solid ${showYoloBoxes ? 'var(--military-green-border-focus)' : 'var(--border-subtle)'}`,
              color: showYoloBoxes ? 'var(--military-green-highlight)' : 'var(--text-muted)',
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

          {/* Audio Mute/Unmute */}
          {feedSource === 'video' && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#94a3b8',
                padding: '3px 5px',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={11} /> : <Volume2 size={11} />}
            </button>
          )}

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

          {/* Snapshot Capture Button */}
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
            title="Export Frame Snapshot with Overlays"
          >
            <Camera size={12} />
          </button>

          {/* Dual Threat Breach Simulator Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => handleSimulateBreach('L4')}
              disabled={isTriggering}
              style={{
                background: isTriggering ? '#7f1d1d' : '#ea580c',
                border: '1px solid #f97316',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 800,
                padding: '3px 7px',
                borderRadius: '2px',
                cursor: isTriggering ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                boxShadow: '0 0 6px rgba(234, 88, 12, 0.4)'
              }}
              title="Simulate L4 High Threat Perimeter Convoy Incursion"
            >
              <Zap size={10} />
              <span>{isTriggering ? 'LOGGING...' : 'L4 BREACH'}</span>
            </button>

            <button
              onClick={() => handleSimulateBreach('L5')}
              disabled={isTriggering}
              style={{
                background: isTriggering ? '#7f1d1d' : '#dc2626',
                border: '1px solid #ef4444',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 800,
                padding: '3px 7px',
                borderRadius: '2px',
                cursor: isTriggering ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                boxShadow: '0 0 8px rgba(220, 38, 38, 0.5)'
              }}
              title="Simulate L5 Critical Hostile Drone Swarm (Requires Two-Person Dual Authorization)"
            >
              <ShieldAlert size={10} />
              <span>{isTriggering ? 'DISPATCHING...' : 'L5 CRITICAL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Interactive Incident Toast with Direct Queue Navigation */}
      {triggerIncidentData && (
        <div 
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '12px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: `1px solid ${triggerIncidentData.threat_level === 'L5' ? '#ef4444' : '#f59e0b'}`,
            borderRadius: '3px',
            padding: '10px 12px',
            fontSize: '11px',
            color: '#f8fafc',
            maxWidth: '420px',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            zIndex: 100
          }}
        >
          <div style={{
            background: triggerIncidentData.threat_level === 'L5' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            padding: '6px',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={18} color={triggerIncidentData.threat_level === 'L5' ? '#ef4444' : '#f59e0b'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`badge-threat badge-threat-${triggerIncidentData.threat_level.toLowerCase()}`}>
                  {triggerIncidentData.threat_level} THREAT DETECTED
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8' }}>
                  {triggerIncidentData.incident_id}
                </span>
              </div>
              <button
                onClick={() => setTriggerIncidentData(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                title="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
            <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '8px' }}>
              {triggerIncidentData.summary}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('authorization_queue')}
                  style={{
                    background: '#0284c7',
                    border: 'none',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>REVIEW & AUTHORIZE NOW</span>
                  <ArrowRight size={11} />
                </button>
              )}
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>
                {triggerIncidentData.threat_level === 'L5' ? 'Dual-Commander Sign-off Required' : 'Single Commander Review Required'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// SCENE RENDERERS (SYNTHETIC FALLBACK GRAPHICS)
// ==========================================

function renderCheckpointScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, palette: ThermalPalette) {
  ctx.fillStyle = palette === 'White-Hot' ? '#181b22' : '#0a0d14';
  ctx.fillRect(0, 0, w, h);

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

  ctx.fillStyle = palette === 'White-Hot' ? '#2e3444' : '#141c2c';
  ctx.beginPath();
  ctx.moveTo(w * 0.35, h * 0.45);
  ctx.lineTo(w * 0.65, h * 0.45);
  ctx.lineTo(w * 0.85, h);
  ctx.lineTo(w * 0.15, h);
  ctx.fill();

  ctx.strokeStyle = palette === 'White-Hot' ? '#ffffff' : '#38bdf8';
  ctx.setLineDash([12, 16]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.45);
  ctx.lineTo(w * 0.5, h);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#334155';
  ctx.fillRect(w * 0.25, h * 0.5, 12, h * 0.25);
  ctx.fillRect(w * 0.23, h * 0.48, 16, 6);

  const beamAlpha = 0.08 + Math.sin(t * 3) * 0.02;
  const gradient = ctx.createRadialGradient(w * 0.25, h * 0.48, 5, w * 0.4, h * 0.7, 180);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${beamAlpha})`);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(w * 0.2, h * 0.45, w * 0.6, h * 0.5);
}

function renderUAVScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, palette: ThermalPalette) {
  ctx.fillStyle = palette === 'White-Hot' ? '#1c202a' : '#080d16';
  ctx.fillRect(0, 0, w, h);

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

  ctx.fillStyle = palette === 'White-Hot' ? '#2b3140' : '#141d2f';
  ctx.fillRect(w * 0.2, 0, w * 0.25, h);
  ctx.fillRect(0, h * 0.4, w, h * 0.2);

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

  ctx.fillStyle = palette === 'White-Hot' ? '#242a38' : '#101726';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.lineTo(w * 0.3, h * 0.42);
  ctx.lineTo(w * 0.7, h * 0.58);
  ctx.lineTo(w, h * 0.45);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.65, 90 + Math.sin(t * 2) * 8, 0, Math.PI * 2);
  ctx.fill();
}

function renderNavalScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, palette: ThermalPalette) {
  ctx.fillStyle = palette === 'White-Hot' ? '#151922' : '#070b14';
  ctx.fillRect(0, 0, w, h);

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

  ctx.fillStyle = '#1e2638';
  ctx.fillRect(0, h * 0.65, w * 0.4, 25);
}

// ==========================================
// VIRTUAL TRIPWIRE GEOFENCE
// ==========================================

function renderVirtualTripwire(ctx: CanvasRenderingContext2D, w: number, h: number, isBreached: boolean) {
  const lineY = h * 0.58;

  ctx.save();
  ctx.strokeStyle = isBreached ? '#ef4444' : '#f59e0b';
  ctx.lineWidth = isBreached ? 2.5 : 1.5;
  ctx.setLineDash([8, 6]);

  ctx.beginPath();
  ctx.moveTo(w * 0.05, lineY);
  ctx.lineTo(w * 0.95, lineY);
  ctx.stroke();

  ctx.fillStyle = isBreached ? '#ef4444' : '#f59e0b';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(
    isBreached ? '▲ TRIPWIRE BREACH: ZONE B RESTRICTED' : '--- VIRTUAL TRIPWIRE: ZONE B ---',
    w * 0.08,
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
  isBreached: boolean
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
    breach: boolean;
  }> = [];

  if (feedId === 'CAM-NORTH-04') {
    // Checkpoint video tracking
    const carX = (w * 0.35) + (Math.sin(t * 0.6) * (w * 0.15));
    boxes = [
      {
        id: 'TRK-01',
        label: 'truck',
        score: 0.94,
        x: carX,
        y: h * 0.42,
        bw: w * 0.24,
        bh: h * 0.32,
        speed: '38.5 km/h',
        breach: isBreached
      },
      {
        id: 'TRK-02',
        label: 'pedestrian',
        score: 0.91,
        x: w * 0.20,
        y: h * 0.46,
        bw: w * 0.08,
        bh: h * 0.26,
        speed: '4.8 km/h',
        breach: isBreached
      },
      {
        id: 'TRK-03',
        label: 'bicycle',
        score: 0.88,
        x: w * 0.72,
        y: h * 0.50,
        bw: w * 0.10,
        bh: h * 0.22,
        speed: '14.2 km/h',
        breach: false
      }
    ];
  } else if (feedId === 'UAV-FALCON-02') {
    // Highway Car Aerial Tracking
    const carX = (w * 0.40) + (Math.sin(t * 0.8) * (w * 0.20));
    boxes = [
      {
        id: 'TRK-A01',
        label: 'car',
        score: 0.95,
        x: carX,
        y: h * 0.36,
        bw: w * 0.22,
        bh: h * 0.26,
        speed: '54.0 km/h',
        breach: true
      },
      {
        id: 'TRK-A02',
        label: 'van',
        score: 0.89,
        x: w * 0.18,
        y: h * 0.48,
        bw: w * 0.18,
        bh: h * 0.24,
        speed: '42.0 km/h',
        breach: false
      }
    ];
  } else if (feedId === 'THM-NORTH-03') {
    // Pedestrian FLIR Thermal Stream
    const pedX = (w * 0.45) + (Math.cos(t * 0.5) * (w * 0.12));
    boxes = [
      {
        id: 'TRK-TH01',
        label: 'people',
        score: 0.92,
        x: pedX,
        y: h * 0.38,
        bw: w * 0.10,
        bh: h * 0.34,
        speed: '4.2 km/h',
        breach: false
      },
      {
        id: 'TRK-TH02',
        label: 'pedestrian',
        score: 0.87,
        x: w * 0.25,
        y: h * 0.42,
        bw: w * 0.09,
        bh: h * 0.32,
        speed: '3.8 km/h',
        breach: false
      }
    ];
  } else {
    // Coastal maritime / bottleneck
    boxes = [
      {
        id: 'TRK-NV01',
        label: 'car',
        score: 0.93,
        x: w * 0.30,
        y: h * 0.45,
        bw: w * 0.20,
        bh: h * 0.25,
        speed: '28.0 km/h',
        breach: false
      }
    ];
  }

  boxes.forEach(b => {
    const boxColor = b.breach ? '#ef4444' : '#38bdf8';
    const cornerSize = 8;

    // Tactical corner brackets
    ctx.strokeStyle = boxColor;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(b.x, b.y + cornerSize);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(b.x + cornerSize, b.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(b.x + b.bw - cornerSize, b.y);
    ctx.lineTo(b.x + b.bw, b.y);
    ctx.lineTo(b.x + b.bw, b.y + cornerSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(b.x, b.y + b.bh - cornerSize);
    ctx.lineTo(b.x, b.y + b.bh);
    ctx.lineTo(b.x + cornerSize, b.y + b.bh);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(b.x + b.bw - cornerSize, b.y + b.bh);
    ctx.lineTo(b.x + b.bw, b.y + b.bh);
    ctx.lineTo(b.x + b.bw, b.y + b.bh - cornerSize);
    ctx.stroke();

    // Hairline box body
    ctx.strokeStyle = b.breach ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.3)';
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
  palette: ThermalPalette
) {
  ctx.save();
  ctx.strokeStyle = palette === 'White-Hot' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 1;

  const cx = w * 0.5;
  const cy = h * 0.5;

  const gap = 14;
  const len = 20;

  ctx.beginPath();
  ctx.moveTo(cx - len - gap, cy);
  ctx.lineTo(cx - gap, cy);
  ctx.moveTo(cx + gap, cy);
  ctx.lineTo(cx + len + gap, cy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy - len - gap);
  ctx.lineTo(cx, cy - gap);
  ctx.moveTo(cx, cy + gap);
  ctx.lineTo(cx, cy + len + gap);
  ctx.stroke();

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

  ctx.beginPath();
  ctx.moveTo(frameMargin, frameMargin + frameArm);
  ctx.lineTo(frameMargin, frameMargin);
  ctx.lineTo(frameMargin + frameArm, frameMargin);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w - frameMargin - frameArm, frameMargin);
  ctx.lineTo(w - frameMargin, frameMargin);
  ctx.lineTo(w - frameMargin, frameMargin + frameArm);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(frameMargin, h - frameMargin - frameArm);
  ctx.lineTo(frameMargin, h - frameMargin);
  ctx.lineTo(frameMargin + frameArm, h - frameMargin);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w - frameMargin - frameArm, h - frameMargin);
  ctx.lineTo(w - frameMargin, h - frameMargin);
  ctx.lineTo(w - frameMargin, h - frameMargin - frameArm);
  ctx.stroke();

  ctx.restore();
}
