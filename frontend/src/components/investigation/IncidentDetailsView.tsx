import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Radio, 
  Video, 
  Flame, 
  Activity, 
  History, 
  GitMerge, 
  Printer, 
  MessageSquare, 
  Send,
  Zap,
  Sliders
} from 'lucide-react';
import type { PageId, ThreatLevel } from '../../types';
import { ACTIVE_INCIDENTS } from '../../data/indiaGeospatial';

interface IncidentDetailsViewProps {
  incidentId?: string;
  onNavigate: (page: PageId) => void;
  currentUser?: { officer_name: string; role: string };
}

export const IncidentDetailsView: React.FC<IncidentDetailsViewProps> = ({
  incidentId = 'INC-2026-9041',
  onNavigate,
  currentUser = { officer_name: 'Meera Chaudhari', role: 'Chief Commander' }
}) => {
  const [selectedId, setSelectedId] = useState<string>(incidentId);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'optical' | 'thermal' | 'radar' | 'acoustic'>('optical');
  const [operatorNotes, setOperatorNotes] = useState<Array<{ id: string; author: string; time: string; text: string }>>([
    {
      id: 'note-1',
      author: 'Lt. Col. R. Verma (Sector Ops)',
      time: '6m ago',
      text: 'Visual correlation matches VisDrone YOLO training profile for mechanized convoy. Alert escalated per Standing Order 4.2.'
    },
    {
      id: 'note-2',
      author: 'Meera Chaudhari (Chief Commander)',
      time: '2m ago',
      text: 'Doppler velocity cross-referenced with GS-02 Radar. Dual thermal signatures confirm combustion engines active.'
    }
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  const [isDossierGenerated, setIsDossierGenerated] = useState(false);

  // Find active incident or default
  const incident = ACTIVE_INCIDENTS.find(i => i.id === selectedId) || ACTIVE_INCIDENTS[0];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      author: `${currentUser.officer_name} (${currentUser.role})`,
      time: 'Just now',
      text: newNoteText.trim()
    };
    setOperatorNotes([newNote, ...operatorNotes]);
    setNewNoteText('');
  };

  const getThreatColor = (level: ThreatLevel) => {
    switch (level) {
      case 'L5': return 'var(--threat-l5, #ef4444)';
      case 'L4': return 'var(--threat-l4, #f97316)';
      case 'L3': return 'var(--threat-l3, #eab308)';
      case 'L2': return 'var(--threat-l2, #06b6d4)';
      case 'L1': return 'var(--threat-l1, #10b981)';
    }
  };

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
      {/* Top Incident Control & Selector Header */}
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--military-green-surface, #182c20)',
            border: '1px solid var(--military-green-border, #274734)',
            padding: '4px 10px',
            borderRadius: '2px'
          }}>
            <ShieldAlert size={16} color={getThreatColor(incident.threatLevel)} />
            <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em' }}>
              INCIDENT INVESTIGATION DESK
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>ACTIVE FILE:</span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{
                background: 'var(--bg-card, #131417)',
                border: '1px solid var(--border-focus, #334155)',
                color: '#f8fafc',
                padding: '4px 8px',
                borderRadius: '2px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {ACTIVE_INCIDENTS.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  [{inc.threatLevel}] {inc.id} — {inc.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Cross-Navigation & Forensic Dossier Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onNavigate('authorization_queue')}
            style={{
              background: 'var(--military-green-surface, #182c20)',
              border: '1px solid var(--military-green-border-focus, #366147)',
              color: 'var(--military-green-highlight, #a4cbb4)',
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
            <Zap size={12} />
            <span>AUTHORIZATION QUEUE</span>
          </button>

          <button
            onClick={() => onNavigate('playback')}
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
            <History size={12} />
            <span>MULTI-TRACK PLAYBACK</span>
          </button>

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
            <span>FUSION MATRIX</span>
          </button>

          <button
            onClick={() => {
              setIsDossierGenerated(true);
              setTimeout(() => setIsDossierGenerated(false), 4000);
            }}
            style={{
              background: isDossierGenerated ? 'var(--military-green-border, #274734)' : 'rgba(30, 41, 59, 0.6)',
              border: '1px solid #475569',
              color: '#f8fafc',
              padding: '5px 10px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Printer size={12} />
            <span>{isDossierGenerated ? 'DOSSIER EXPORTED' : 'EXPORT DOSSIER'}</span>
          </button>
        </div>
      </div>

      {/* Main Investigation Split Workspace */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1.25fr 0.95fr',
        gap: '12px',
        padding: '14px',
        overflowY: 'auto'
      }}>
        {/* LEFT COLUMN: Multi-Sensor Synchronized Evidence & Optical/Thermal/Radar Views */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Evidence Viewport Card */}
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Evidence Selector Bar */}
            <div style={{
              height: '36px',
              background: 'var(--bg-subtle, #101114)',
              borderBottom: '1px solid var(--border-subtle, #23262e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[
                  { key: 'optical' as const, label: 'OPTICAL YOLOv8', icon: Video },
                  { key: 'thermal' as const, label: 'FLIR THERMAL IR', icon: Flame },
                  { key: 'radar' as const, label: 'DOPPLER RADAR', icon: Radio },
                  { key: 'acoustic' as const, label: 'ACOUSTIC WAVEFORM', icon: Activity }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeEvidenceTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveEvidenceTab(tab.key)}
                      style={{
                        background: isActive ? 'var(--military-green-surface, #182c20)' : 'transparent',
                        border: `1px solid ${isActive ? 'var(--military-green-border-focus, #366147)' : 'transparent'}`,
                        color: isActive ? 'var(--military-green-highlight, #a4cbb4)' : '#94a3b8',
                        padding: '3px 8px',
                        borderRadius: '2px',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Icon size={11} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: '9px', color: '#64748b' }}>
                SPATIOTEMPORALLY ALIGNED • SYNCHRONIZED CLOCK
              </div>
            </div>

            {/* Evidence Canvas & Overlays */}
            <div style={{
              height: '320px',
              background: '#040507',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {activeEvidenceTab === 'optical' && (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  {/* Simulated Tactical Optical Scene */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(180deg, #091217 0%, #050a0d 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Simulated High-Res Tactical Target Frame */}
                    <div style={{
                      width: '88%',
                      height: '80%',
                      border: '1px dashed rgba(69, 124, 90, 0.4)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#84b699' }}>
                        <span>CAM-NORTH-04 • 1920x1080@30FPS</span>
                        <span>LAT: {incident.coordinates[0]}°N | LNG: {incident.coordinates[1]}°E</span>
                      </div>

                      {/* YOLO Bounding Box Overlay 1 */}
                      <div style={{
                        position: 'absolute',
                        top: '35%',
                        left: '42%',
                        width: '120px',
                        height: '75px',
                        border: '2px solid #ef4444',
                        background: 'rgba(239, 68, 68, 0.12)',
                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-16px',
                          left: '-2px',
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: '9px',
                          fontWeight: 800,
                          padding: '1px 5px',
                          letterSpacing: '0.04em'
                        }}>
                          HEAVY TRANSPORT #104: 94.2%
                        </div>
                      </div>

                      {/* YOLO Bounding Box Overlay 2 */}
                      <div style={{
                        position: 'absolute',
                        top: '48%',
                        left: '66%',
                        width: '45px',
                        height: '65px',
                        border: '2px solid #f97316',
                        background: 'rgba(249, 115, 22, 0.12)'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-16px',
                          left: '-2px',
                          background: '#f97316',
                          color: '#fff',
                          fontSize: '8px',
                          fontWeight: 800,
                          padding: '1px 4px'
                        }}>
                          PERSON #105: 91.0%
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b' }}>
                        <span>AZIMUTH: 342° | ELEV: 1585M</span>
                        <span>YOLO INFERENCE LATENCY: 23ms (TENSORRT)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeEvidenceTab === 'thermal' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(ellipse at center, #3b0764 0%, #1e1b4b 60%, #030712 100%)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Thermal signature heat blip */}
                  <div style={{
                    width: '140px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #facc15 0%, #ea580c 45%, #7c2d12 80%, transparent 100%)',
                    filter: 'blur(8px)',
                    opacity: 0.85
                  }} />
                  <div style={{ position: 'absolute', top: '14px', left: '16px', fontSize: '10px', color: '#fbbf24' }}>
                    FLIR LONG-RANGE THERMAL INFRARED (THM-NORTH-03)
                  </div>
                  <div style={{ position: 'absolute', bottom: '14px', right: '16px', fontSize: '10px', color: '#f8fafc' }}>
                    TEMPERATURE DELTA: <span style={{ color: '#ef4444', fontWeight: 700 }}>+14.8°C</span> (COMBUSTION SIGNATURE)
                  </div>
                </div>
              )}

              {activeEvidenceTab === 'radar' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: '#07100b',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Radar sweep concentric circles */}
                  <div style={{ width: '220px', height: '220px', border: '1px solid rgba(69, 124, 90, 0.4)', borderRadius: '50%', position: 'absolute' }} />
                  <div style={{ width: '150px', height: '150px', border: '1px solid rgba(69, 124, 90, 0.3)', borderRadius: '50%', position: 'absolute' }} />
                  <div style={{ width: '80px', height: '80px', border: '1px solid rgba(69, 124, 90, 0.2)', borderRadius: '50%', position: 'absolute' }} />
                  <div style={{ width: '220px', height: '1px', background: 'rgba(69, 124, 90, 0.4)', position: 'absolute' }} />
                  <div style={{ height: '220px', width: '1px', background: 'rgba(69, 124, 90, 0.4)', position: 'absolute' }} />

                  {/* Radar plot */}
                  <div style={{
                    position: 'absolute',
                    top: '38%',
                    left: '58%',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 8px #22c55e'
                  }} />
                  <div style={{ position: 'absolute', top: '34%', left: '60%', fontSize: '9px', color: '#86efac', fontWeight: 700 }}>
                    GS-02 TRK-94 • VEL: 38 KM/H
                  </div>

                  <div style={{ position: 'absolute', top: '14px', left: '16px', fontSize: '10px', color: '#86efac' }}>
                    GROUND DOPPLER RADAR • 180 KM RADIUS
                  </div>
                </div>
              )}

              {activeEvidenceTab === 'acoustic' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: '#090d14',
                  position: 'relative',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: '#38bdf8', marginBottom: '10px' }}>
                    ACOUSTIC SEISMIC TRIPWIRE ARRAY (ACS-EAST-01) • FREQUENCY PEAKS
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '120px', gap: '3px' }}>
                    {[20, 35, 18, 42, 68, 88, 95, 76, 52, 34, 48, 82, 91, 64, 30, 24, 55, 78, 62, 40].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: `${h}%`,
                          background: h > 80 ? '#ef4444' : h > 60 ? '#f97316' : '#0284c7',
                          borderRadius: '1px'
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '8px' }}>
                    <span>0 Hz</span>
                    <span>ENGINE COMBUSTION RESONANCE: 142 Hz (HIGH PROBABILITY)</span>
                    <span>2000 Hz</span>
                  </div>
                </div>
              )}
            </div>

            {/* Evidence Telemetry Ribbon */}
            <div style={{
              padding: '10px 14px',
              background: 'var(--bg-subtle, #101114)',
              borderTop: '1px solid var(--border-subtle, #23262e)',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              fontSize: '10px'
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>TARGET SPEED</span>
                <strong style={{ color: '#f8fafc' }}>38.2 KM/H (STEADY)</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>BORDER DISTANCE</span>
                <strong style={{ color: '#ef4444' }}>84 METERS (BREACH)</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>ACTIVE SENSORS</span>
                <strong style={{ color: 'var(--military-green-text, #84b699)' }}>{incident.sensorSources.join(', ')}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>UNCERTAINTY</span>
                <strong style={{ color: '#fbbf24' }}>{incident.uncertaintyScore}% (LOW)</strong>
              </div>
            </div>
          </div>

          {/* Operator Chain of Custody & Notes */}
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={13} color="var(--military-green-text, #84b699)" />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
                TACTICAL OPERATOR NOTES & CHAIN OF CUSTODY
              </span>
            </div>

            {/* Note Input */}
            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Append official forensic observation or commander directive..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-card, #131417)',
                  border: '1px solid var(--border-subtle, #23262e)',
                  color: '#f8fafc',
                  padding: '6px 10px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--military-green-surface, #182c20)',
                  border: '1px solid var(--military-green-border, #274734)',
                  color: 'var(--military-green-highlight, #a4cbb4)',
                  padding: '0 12px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Send size={11} />
                <span>LOG NOTE</span>
              </button>
            </form>

            {/* Note History */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
              {operatorNotes.map(n => (
                <div
                  key={n.id}
                  style={{
                    background: 'var(--bg-card, #131417)',
                    border: '1px solid #1f232b',
                    padding: '8px 10px',
                    borderRadius: '2px',
                    fontSize: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--military-green-text, #84b699)' }}>{n.author}</span>
                    <span>{n.time}</span>
                  </div>
                  <div style={{ color: '#cbd5e1', lineHeight: 1.4 }}>{n.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Explanation, 5-Vector Breakdown & Audit Trail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 5-Vector Telemetry Breakdown */}
          <div style={{
            background: 'var(--bg-surface, #141518)',
            border: '1px solid var(--border-subtle, #23262e)',
            borderRadius: '2px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.04em' }}>
                5-VECTOR STATUS BREAKDOWN
              </span>
              <span style={{
                background: getThreatColor(incident.threatLevel),
                color: '#fff',
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '2px'
              }}>
                LEVEL {incident.threatLevel}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Event Classification</span>
                <strong style={{ color: getThreatColor(incident.threatLevel) }}>
                  {incident.threatLevel} — High Priority Perimeter Incursion
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Fused Confidence Score</span>
                <strong style={{ color: '#f8fafc' }}>{incident.confidence}% (Multimodal Calibrated)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Workflow Routing Path</span>
                <strong style={{ color: '#fbbf24' }}>{incident.workflowStatus}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Authorization Protocol</span>
                <strong style={{ color: 'var(--military-green-highlight, #a4cbb4)' }}>
                  {incident.threatLevel === 'L5' ? 'Dual-Commander Sign-off Required' : 'Single HITL Commander Approval'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-card, #131417)' }}>
                <span style={{ color: '#94a3b8' }}>Tactical Network Status</span>
                <strong style={{ color: '#94a3b8' }}>Held in Queue (Awaiting Action)</strong>
              </div>
            </div>
          </div>

          {/* AI Explainability & Neural Feature Attribution */}
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
              <Sliders size={13} color="var(--military-green-text, #84b699)" />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
                AI EXPLAINABILITY & FEATURE WEIGHTS
              </span>
            </div>

            <p style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.4, margin: '2px 0 6px 0' }}>
              Hugging Face YOLOv8 & spatiotemporal fusion engine evaluated 4 contributing feature vectors to calculate threat severity:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
              {[
                { label: 'Geofence Buffer Breach (< 100m)', weight: 36, color: '#ef4444' },
                { label: 'Optical VisDrone YOLO Object Detection (Truck)', weight: 30, color: '#f97316' },
                { label: 'Doppler Velocity Vector (38 km/h Steady Inbound)', weight: 20, color: '#eab308' },
                { label: 'FLIR Thermal Combustion Delta (+14.8°C)', weight: 14, color: '#06b6d4' }
              ].map((feat, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ color: '#cbd5e1' }}>{feat.label}</span>
                    <strong style={{ color: feat.color }}>{feat.weight}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: '#1c1e23', borderRadius: '1px', overflow: 'hidden' }}>
                    <div style={{ width: `${feat.weight * 2.5}%`, height: '100%', background: feat.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '6px',
              padding: '6px 8px',
              background: 'var(--bg-card, #131417)',
              borderLeft: '2px solid var(--military-green-border-focus, #366147)',
              fontSize: '10px',
              color: '#94a3b8'
            }}>
              RULE ACTIVATED: <strong style={{ color: '#f8fafc' }}>POLICY 4.2-A (RESTRICTED ZONE VEHICULAR DISMOUNT)</strong>
            </div>
          </div>

          {/* Chronological Incident Audit Trail */}
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
              <Clock size={13} color="var(--military-green-text, #84b699)" />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
                CHRONOLOGICAL AUDIT TIMELINE
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              {[
                { time: 'T - 180s', text: 'Acoustic tripwire ACS-EAST-01 registered 142 Hz combustion vibration.', tag: 'TELEMETRY' },
                { time: 'T - 120s', text: 'Ground Doppler Radar GS-02 detected 38 km/h target crossing Sector 4.', tag: 'RADAR LOCK' },
                { time: 'T - 60s', text: 'Optical PTZ CAM-04 slew-to-cue: YOLOv8 model flagged Heavy Truck (94.2%).', tag: 'AI INFERENCE' },
                { time: 'T - 20s', text: 'Spatiotemporal engine correlated 3 data streams into unified Incident INC-2026-9041.', tag: 'FUSION' },
                { time: 'T - 0s', text: 'Policy engine classified L4 severity. Ingested to Officer Meera Chaudhari review queue.', tag: 'QUEUE' }
              ].map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '10px', lineHeight: 1.3 }}>
                  <span style={{ color: 'var(--military-green-text, #84b699)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {step.time}
                  </span>
                  <div style={{ flex: 1, color: '#cbd5e1' }}>
                    {step.text}
                  </div>
                  <span style={{
                    fontSize: '8px',
                    color: '#64748b',
                    background: '#1c1e23',
                    padding: '1px 4px',
                    borderRadius: '2px',
                    height: 'fit-content'
                  }}>
                    {step.tag}
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
