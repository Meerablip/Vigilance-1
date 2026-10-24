import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  FastForward, 
  Rewind, 
  Radio, 
  Video, 
  Flame, 
  Activity, 
  AlertCircle, 
  Bookmark, 
  Clock, 
  ArrowLeft, 
  GitMerge 
} from 'lucide-react';
import type { PageId } from '../../types';
import { ACTIVE_INCIDENTS } from '../../data/indiaGeospatial';

interface IncidentPlaybackViewProps {
  incidentId?: string;
  onNavigate: (page: PageId) => void;
}

export const IncidentPlaybackView: React.FC<IncidentPlaybackViewProps> = ({
  incidentId = 'INC-2026-9041',
  onNavigate
}) => {
  // Scrubber time in seconds relative to incident detection (-60s to +30s)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [selectedIncidentId] = useState<string>(incidentId);
  const [bookmarks, setBookmarks] = useState<Array<{ time: number; label: string }>>([
    { time: -45, label: 'Acoustic tripwire trigger' },
    { time: -22, label: 'Radar velocity lock (38 km/h)' },
    { time: 0, label: 'L4 Perimeter incursion breach' },
    { time: 14, label: 'Optical foliage occlusion' }
  ]);
  const [newBookmarkLabel, setNewBookmarkLabel] = useState('');

  const lastTickRef = useRef<number>(Date.now());

  const incident = ACTIVE_INCIDENTS.find(i => i.id === selectedIncidentId) || ACTIVE_INCIDENTS[0];

  // Playback timer loop
  useEffect(() => {
    if (isPlaying) {
      lastTickRef.current = Date.now();
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 30) {
            setIsPlaying(false);
            return 30;
          }
          return Math.min(30, Number((prev + 0.1 * playbackSpeed).toFixed(1)));
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, playbackSpeed]);

  const handleSeek = (newVal: number) => {
    setCurrentTime(newVal);
  };

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookmarkLabel.trim()) return;
    setBookmarks([...bookmarks, { time: currentTime, label: newBookmarkLabel.trim() }]);
    setNewBookmarkLabel('');
  };

  // Compute simulated dynamic position based on scrubber time
  const targetSpeed = currentTime < -30 ? 42.0 : currentTime < 0 ? 38.2 : 24.5;
  const isOccluded = currentTime >= 12 && currentTime <= 18;
  const confidenceAtTime = isOccluded ? 72.4 : currentTime < 0 ? 88.5 : 94.2;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-canvas, #0a0b0d)',
      color: '#f8fafc',
      overflow: 'hidden',
      height: '100%',
      fontFamily: 'var(--font-mono, monospace)'
    }}>
      {/* Top Playback Toolbar */}
      <div style={{
        height: '52px',
        background: 'var(--bg-surface-elevated, #181a1f)',
        borderBottom: '1px solid var(--border-subtle, #23262e)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => onNavigate('incident_details')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            <ArrowLeft size={14} />
            <span>DETAILS</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--military-green-surface, #182c20)',
            border: '1px solid var(--military-green-border, #274734)',
            padding: '4px 10px',
            borderRadius: '2px'
          }}>
            <Clock size={14} color="var(--military-green-highlight, #a4cbb4)" />
            <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em' }}>
              MULTI-TRACK FORENSIC PLAYBACK
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
            FILE: <strong style={{ color: '#f8fafc' }}>{incident.id}</strong> — {incident.title}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onNavigate('fusion')}
            style={{
              background: 'var(--bg-card, #131417)',
              border: '1px solid var(--border-subtle, #23262e)',
              color: '#cbd5e1',
              padding: '5px 12px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <GitMerge size={12} />
            <span>CROSS-SENSOR FUSION MATRIX</span>
          </button>
        </div>
      </div>

      {/* Main Playback Split Screen */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1.35fr 0.85fr',
        gap: '12px',
        padding: '14px',
        overflowY: 'auto'
      }}>
        {/* LEFT COLUMN: Synchronized Visualizer & Multi-Track Scrubber */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Synchronized Multi-Sensor Viewport */}
          <div style={{
            height: '340px',
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              height: '32px',
              background: 'var(--bg-subtle, #101114)',
              borderBottom: '1px solid var(--border-subtle, #23262e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              fontSize: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--military-green-text, #84b699)', fontWeight: 700 }}>
                  ● SYNCHRONIZED FORENSIC VIEWPORT
                </span>
                <span style={{ color: '#64748b' }}>|</span>
                <span style={{ color: '#94a3b8' }}>TIME: {currentTime >= 0 ? `+${currentTime.toFixed(1)}s` : `${currentTime.toFixed(1)}s`}</span>
              </div>

              {isOccluded && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  padding: '1px 6px',
                  borderRadius: '2px',
                  fontSize: '9px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <AlertCircle size={10} />
                  <span>OPTICAL OCCLUSION DETECTED • RADAR/THERMAL MAINTAINING CONTINUITY</span>
                </div>
              )}
            </div>

            {/* Simulated Synchronized Viewport Content */}
            <div style={{
              flex: 1,
              background: '#040507',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(180deg, #091217 0%, #050a0d 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* HUD Overlay */}
                <div style={{ position: 'absolute', top: '10px', left: '12px', fontSize: '10px', color: '#84b699' }}>
                  CAM-04 (OPTICAL) + GS-02 (DOPPLER) • FRAME #{Math.floor((currentTime + 60) * 30)}
                </div>

                <div style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '10px', color: '#94a3b8' }}>
                  SPEED: <strong style={{ color: '#f8fafc' }}>{targetSpeed} KM/H</strong>
                </div>

                {/* Target Bounding Box that moves horizontally with scrubber */}
                <div style={{
                  position: 'absolute',
                  top: '40%',
                  left: `${Math.max(15, Math.min(80, 45 + (currentTime * 0.6)))}%`,
                  width: '110px',
                  height: '70px',
                  border: `2px solid ${isOccluded ? '#eab308' : '#ef4444'}`,
                  background: isOccluded ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                  transition: 'left 0.1s linear',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '4px'
                }}>
                  <div style={{
                    fontSize: '8px',
                    fontWeight: 800,
                    background: isOccluded ? '#eab308' : '#ef4444',
                    color: '#fff',
                    padding: '1px 4px',
                    width: 'fit-content'
                  }}>
                    {isOccluded ? 'RADAR FUSED (OPTICAL LOST)' : 'TRK #104 (TRUCK)'}
                  </div>
                  <div style={{ fontSize: '8px', color: '#fff', textAlign: 'right' }}>
                    {confidenceAtTime}%
                  </div>
                </div>

                {/* Range Rings Crosshair */}
                <div style={{ width: '180px', height: '180px', border: '1px dashed rgba(69, 124, 90, 0.3)', borderRadius: '50%', position: 'absolute', pointerEvents: 'none' }} />
                <div style={{ width: '300px', height: '300px', border: '1px dashed rgba(69, 124, 90, 0.15)', borderRadius: '50%', position: 'absolute', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Playback Transport Controls */}
            <div style={{
              height: '48px',
              background: 'var(--bg-subtle, #101114)',
              borderTop: '1px solid var(--border-subtle, #23262e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleSeek(Math.max(-60, currentTime - 5))}
                  title="Rewind 5s"
                  style={{
                    background: 'var(--bg-card, #131417)',
                    border: '1px solid var(--border-subtle, #23262e)',
                    color: '#cbd5e1',
                    width: '28px',
                    height: '28px',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Rewind size={13} />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    background: isPlaying ? 'var(--military-green-border-focus, #366147)' : 'var(--military-green-surface, #182c20)',
                    border: '1px solid var(--military-green-border, #274734)',
                    color: 'var(--military-green-highlight, #a4cbb4)',
                    padding: '5px 16px',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>

                <button
                  onClick={() => handleSeek(Math.min(30, currentTime + 5))}
                  title="Forward 5s"
                  style={{
                    background: 'var(--bg-card, #131417)',
                    border: '1px solid var(--border-subtle, #23262e)',
                    color: '#cbd5e1',
                    width: '28px',
                    height: '28px',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <FastForward size={13} />
                </button>

                <button
                  onClick={() => handleSeek(0)}
                  style={{
                    background: 'var(--bg-card, #131417)',
                    border: '1px solid var(--border-subtle, #23262e)',
                    color: '#fbbf24',
                    padding: '4px 10px',
                    borderRadius: '2px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  JUMP TO T=0 (BREACH)
                </button>
              </div>

              {/* Speed Multiplier */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#64748b' }}>SPEED:</span>
                {[0.5, 1.0, 2.0, 4.0].map(s => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    style={{
                      background: playbackSpeed === s ? 'var(--military-green-surface, #182c20)' : 'transparent',
                      border: `1px solid ${playbackSpeed === s ? 'var(--military-green-border, #274734)' : 'transparent'}`,
                      color: playbackSpeed === s ? 'var(--military-green-highlight, #a4cbb4)' : '#94a3b8',
                      padding: '2px 6px',
                      borderRadius: '2px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Master Multi-Track Telemetry Scrubber Bar */}
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
                MULTI-CHANNEL ALIGNED TELEMETRY SCRUBBER
              </span>
              <span style={{ fontSize: '10px', color: 'var(--military-green-text, #84b699)', fontWeight: 700 }}>
                CURRENT: {currentTime >= 0 ? `+${currentTime.toFixed(1)}s` : `${currentTime.toFixed(1)}s`}
              </span>
            </div>

            {/* Slider Scrubber Track */}
            <div style={{ position: 'relative', width: '100%', margin: '4px 0' }}>
              <input
                type="range"
                min={-60}
                max={30}
                step={0.1}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--military-green-highlight, #a4cbb4)',
                  cursor: 'pointer'
                }}
              />
              {/* T=0 Center Marker */}
              <div style={{
                position: 'absolute',
                top: '-4px',
                left: '66.6%',
                width: '2px',
                height: '18px',
                background: '#ef4444',
                pointerEvents: 'none'
              }} />
            </div>

            {/* Individual Channel Streams */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
              {/* Track 1: Optical */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px', background: 'var(--bg-card, #131417)', borderRadius: '2px' }}>
                <Video size={12} color="#38bdf8" />
                <span style={{ width: '120px', color: '#94a3b8' }}>OPTICAL CCTV CAM-04</span>
                <div style={{ flex: 1, height: '12px', background: '#0a0b0d', position: 'relative', borderRadius: '1px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: 'rgba(56, 189, 248, 0.3)' }} />
                  {/* Occlusion hole on track */}
                  <div style={{ position: 'absolute', left: '80%', width: '7%', height: '100%', background: 'rgba(239, 68, 68, 0.7)' }} title="Foliage Occlusion" />
                </div>
                <span style={{ fontSize: '9px', color: isOccluded ? '#ef4444' : '#38bdf8' }}>
                  {isOccluded ? 'OCCLUDED' : 'STREAMING'}
                </span>
              </div>

              {/* Track 2: Doppler Radar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px', background: 'var(--bg-card, #131417)', borderRadius: '2px' }}>
                <Radio size={12} color="#22c55e" />
                <span style={{ width: '120px', color: '#94a3b8' }}>DOPPLER RADAR GS-02</span>
                <div style={{ flex: 1, height: '12px', background: '#0a0b0d', position: 'relative', borderRadius: '1px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: 'rgba(34, 197, 94, 0.35)' }} />
                </div>
                <span style={{ fontSize: '9px', color: '#22c55e' }}>LOCKED 100%</span>
              </div>

              {/* Track 3: Thermal Infrared */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px', background: 'var(--bg-card, #131417)', borderRadius: '2px' }}>
                <Flame size={12} color="#f97316" />
                <span style={{ width: '120px', color: '#94a3b8' }}>FLIR THERMAL THM-03</span>
                <div style={{ flex: 1, height: '12px', background: '#0a0b0d', position: 'relative', borderRadius: '1px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: 'rgba(249, 115, 22, 0.3)' }} />
                </div>
                <span style={{ fontSize: '9px', color: '#f97316' }}>+14.8°C ΔT</span>
              </div>

              {/* Track 4: Acoustic Array */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px', background: 'var(--bg-card, #131417)', borderRadius: '2px' }}>
                <Activity size={12} color="#a855f7" />
                <span style={{ width: '120px', color: '#94a3b8' }}>ACOUSTIC TRIPWIRE</span>
                <div style={{ flex: 1, height: '12px', background: '#0a0b0d', position: 'relative', borderRadius: '1px', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: '16%', width: '50%', height: '100%', background: 'rgba(168, 85, 247, 0.4)' }} />
                </div>
                <span style={{ fontSize: '9px', color: '#a855f7' }}>142 Hz PEAK</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Forensic Inspector & Keyframe Bookmarks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Fused Track Telemetry at Scrubber Instant */}
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            padding: '14px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px', letterSpacing: '0.04em' }}>
              TELEMETRY AT T = {currentTime >= 0 ? `+${currentTime.toFixed(1)}s` : `${currentTime.toFixed(1)}s`}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Target Velocity</span>
                <strong style={{ color: '#f8fafc' }}>{targetSpeed} KM/H (RADIAL INBOUND)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Sensor Confidence</span>
                <strong style={{ color: isOccluded ? '#eab308' : '#22c55e' }}>{confidenceAtTime}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Track Continuity</span>
                <strong style={{ color: 'var(--military-green-text, #84b699)' }}>99.2% (KALMAN FILTER UNBROKEN)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Active Primary Sensor</span>
                <strong style={{ color: '#38bdf8' }}>{isOccluded ? 'GS-02 DOPPLER RADAR' : 'CAM-NORTH-04 + RADAR'}</strong>
              </div>
            </div>
          </div>

          {/* Bookmarks & Timestamp Markers */}
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={13} color="var(--military-green-text, #84b699)" />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
                TACTICAL EVENT BOOKMARKS
              </span>
            </div>

            {/* Add Bookmark form */}
            <form onSubmit={handleAddBookmark} style={{ display: 'flex', gap: '6px', margin: '4px 0' }}>
              <input
                type="text"
                placeholder="Tag current timestamp..."
                value={newBookmarkLabel}
                onChange={(e) => setNewBookmarkLabel(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-card, #131417)',
                  border: '1px solid var(--border-subtle, #23262e)',
                  color: '#f8fafc',
                  padding: '5px 8px',
                  borderRadius: '2px',
                  fontSize: '10px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--military-green-surface, #182c20)',
                  border: '1px solid var(--military-green-border, #274734)',
                  color: 'var(--military-green-highlight, #a4cbb4)',
                  padding: '0 8px',
                  borderRadius: '2px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                PIN
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '180px', overflowY: 'auto' }}>
              {bookmarks.map((b, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSeek(b.time)}
                  style={{
                    background: 'var(--bg-card, #131417)',
                    border: '1px solid #1f232b',
                    padding: '6px 8px',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  <span style={{ color: '#cbd5e1' }}>{b.label}</span>
                  <span style={{
                    color: 'var(--military-green-text, #84b699)',
                    fontWeight: 700,
                    background: 'rgba(24, 44, 32, 0.6)',
                    padding: '1px 5px',
                    borderRadius: '2px'
                  }}>
                    {b.time >= 0 ? `+${b.time}s` : `${b.time}s`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
