import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Volume2,
  Globe2,
  Terminal,
  Save,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Cpu,
  Smartphone
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'display' | 'audio' | 'tactical' | 'network' | 'security'>('tactical');
  const [savedNotice, setSavedNotice] = useState(false);

  // Settings State
  const [coordFormat, setCoordFormat] = useState('mgrs');
  const [themeMode, setThemeMode] = useState('graphite_pure');
  const [scanlines, setScanlines] = useState(false);
  const [gridOpacity, setGridOpacity] = useState(30);
  const [audioSiren, setAudioSiren] = useState(true);
  const [audioVolume, setAudioVolume] = useState(85);
  const [voiceAlerts, setVoiceAlerts] = useState(true);
  const [autoAckLatency, setAutoAckLatency] = useState(450);
  const [encryptionStandard, setEncryptionStandard] = useState('kyber768');
  const [sessionTimeout, setSessionTimeout] = useState('30m');
  const [twoPersonRuleL5, setTwoPersonRuleL5] = useState(true);
  const [pwaOfflineCache, setPwaOfflineCache] = useState(true);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans text-neutral-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-neutral-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <Settings className="w-3.5 h-3.5" />
              SYSTEM CONFIGURATION
            </span>
            <span className="text-xs font-mono text-neutral-500">PARAM-NODE-01</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Vigilance Command Platform Settings
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Configure telemetry displays, audio alert dispatch, Survey of India coordinate reference frames, and encrypted network links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono animate-fade-in bg-emerald-950/60 px-3 py-1.5 rounded border border-emerald-800/80">
              <CheckCircle2 className="w-4 h-4" /> CONFIG APPLIED & PERSISTED
            </span>
          )}
          <button
            onClick={() => {
              setCoordFormat('mgrs');
              setScanlines(false);
              setGridOpacity(30);
              setAudioSiren(true);
              setTwoPersonRuleL5(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs tracking-wider font-mono transition-colors shadow-lg shadow-emerald-950/40"
          >
            <Save className="w-4 h-4" /> SAVE CONFIGURATION
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2 overflow-x-auto text-xs font-mono">
        {[
          { id: 'tactical', label: 'Tactical & Geospatial', icon: Globe2 },
          { id: 'display', label: 'Display & Aesthetics', icon: Sliders },
          { id: 'audio', label: 'Alert Audio & Klaxons', icon: Volume2 },
          { id: 'network', label: 'Defense Links & Net', icon: Terminal },
          { id: 'security', label: 'Auth & PWA Offline', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded font-mono transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'tactical' && (
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-6">
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Globe2 className="w-4 h-4 text-emerald-400" /> Geospatial & Coordinate References
              </h2>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Primary Coordinate System Reference
                  </label>
                  <p className="text-[11px] text-neutral-500 mb-2 font-sans">
                    Standardizes all unit positions, perimeter breaches, and target tracks across regional headquarters.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'mgrs', name: 'MGRS (Military Grid Reference)', desc: '1m precision NATO/Indian Army standard' },
                      { id: 'dms', name: 'WGS-84 DMS', desc: 'Degrees, Minutes, Seconds notation' },
                      { id: 'dd', name: 'Decimal Degrees', desc: 'Standard decimal GIS projection' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => setCoordFormat(fmt.id)}
                        className={`text-left p-3 rounded border transition-all ${
                          coordFormat === fmt.id
                            ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300'
                            : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{fmt.name}</div>
                        <div className="text-[10px] text-neutral-500 mt-1 font-sans">{fmt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-neutral-200 font-semibold">Survey of India Digital Boundary Adherence</div>
                      <div className="text-[11px] text-neutral-500 font-sans">Enforce strict boundary rendering matching official SOI digitized geospatial vectors.</div>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-mono bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded">
                      ENFORCED (SOI v24.2)
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-neutral-200 font-semibold">Strict Two-Person Authorization for L5 Threat Dispatches</div>
                      <div className="text-[11px] text-neutral-500 font-sans">Mandates biometric or secondary commander confirmation before firing kinetic response protocols.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={twoPersonRuleL5}
                      onChange={(e) => setTwoPersonRuleL5(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-6">
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Sliders className="w-4 h-4 text-emerald-400" /> Command Center Visual Aesthetics
              </h2>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Theme Color Palette</label>
                  <p className="text-[11px] text-neutral-500 mb-2 font-sans">Tactical low-glare dark palette optimized for 24/7 operations room monitors.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setThemeMode('graphite_pure')}
                      className={`p-3 rounded border text-left ${
                        themeMode === 'graphite_pure'
                          ? 'bg-neutral-900 border-emerald-500 text-emerald-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#0a0b0d] border border-emerald-500/50"></span>
                        Graphite Black & Military Green
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1 font-sans">Pure #0a0b0d base with subtle bottle green highlights.</div>
                    </button>
                    <button
                      onClick={() => setThemeMode('night_ops')}
                      className={`p-3 rounded border text-left ${
                        themeMode === 'night_ops'
                          ? 'bg-neutral-900 border-emerald-500 text-emerald-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#040608] border border-cyan-500/50"></span>
                        Deep Midnight Ops
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1 font-sans">Near-zero lux contrast with muted cyan telemetry.</div>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-neutral-200 font-semibold">CRT Telemetry Scanlines Effect</div>
                    <div className="text-[11px] text-neutral-500 font-sans">Subtle horizontal scanlines over sensor video feeds and tactical radar.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={scanlines}
                    onChange={(e) => setScanlines(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-200 font-semibold">Modular Gridline Opacity</span>
                    <span className="text-emerald-400">{gridOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={gridOpacity}
                    onChange={(e) => setGridOpacity(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-neutral-950 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                    <span>Muted (10%)</span>
                    <span>Standard Military (30%)</span>
                    <span>High Contrast (60%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-6">
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Volume2 className="w-4 h-4 text-emerald-400" /> Auditory Warning Systems
              </h2>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-neutral-200 font-semibold">DEFCON L4/L5 Siren Klaxon</div>
                    <div className="text-[11px] text-neutral-500 font-sans">Trigger audio alarm tone upon confirmed drone incursions or perimeter breaches.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioSiren}
                    onChange={(e) => setAudioSiren(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-neutral-200 font-semibold">Synthetic Voice Announcements (TTS)</div>
                    <div className="text-[11px] text-neutral-500 font-sans">Voice synthesis readouts: "HOSTILE DRONE DETECTED IN SECTOR 4-BRAVO".</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceAlerts}
                    onChange={(e) => setVoiceAlerts(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-200 font-semibold">Master Audio Gain</span>
                    <span className="text-emerald-400">{audioVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-neutral-950 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-6">
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Terminal className="w-4 h-4 text-emerald-400" /> Defense HQ Packet Dispatch Protocol
              </h2>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Simulated Packet ACK Latency (ms)</label>
                  <p className="text-[11px] text-neutral-500 mb-2 font-sans">Simulates realistic satellite uplink delay to Regional Air Defense networks.</p>
                  <input
                    type="number"
                    value={autoAckLatency}
                    onChange={(e) => setAutoAckLatency(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 rounded text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-800/80">
                  <label className="block text-neutral-300 font-semibold mb-1">Defense Network Cryptographic Suite</label>
                  <select
                    value={encryptionStandard}
                    onChange={(e) => setEncryptionStandard(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 rounded text-neutral-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="kyber768">ML-KEM / Kyber-768 (NIST Post-Quantum Cryptography)</option>
                    <option value="aes256gcm">AES-256-GCM + Diffie-Hellman Ephemeral</option>
                    <option value="chachapoly">ChaCha20-Poly1305 (Tactical High-Speed Mobile Mesh)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-6">
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Shield className="w-4 h-4 text-emerald-400" /> Security, Session & PWA Offline Storage
              </h2>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Operator Inactivity Auto-Lock</label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 rounded text-neutral-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="15m">15 Minutes (High Security Mode)</option>
                    <option value="30m">30 Minutes (Standard Watch Shift)</option>
                    <option value="60m">60 Minutes (Command Center Briefing)</option>
                    <option value="never">Disabled (Test Lab Only)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-neutral-200 font-semibold">PWA Offline Cache & Sensor Buffer</div>
                    <div className="text-[11px] text-neutral-500 font-sans">
                      Cache tactical maps, geofences, and recent drone detections locally via Service Worker.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pwaOfflineCache}
                    onChange={(e) => setPwaOfflineCache(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-neutral-200 font-semibold">Flush Local Tactical Cache</div>
                    <div className="text-[11px] text-neutral-500 font-sans">Clear IndexedDB sensor logs and service worker assets.</div>
                  </div>
                  <button
                    onClick={() => alert('Local cache successfully purged. Ready for fresh session.')}
                    className="px-3 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-xs font-mono transition-colors"
                  >
                    PURGE CACHE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Info Card */}
        <div className="space-y-4">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 font-mono text-xs space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold border-b border-neutral-800 pb-2">
              <Cpu className="w-4 h-4 text-emerald-400" /> PLATFORM TELEMETRY
            </div>
            <div className="space-y-2 text-neutral-400 text-[11px]">
              <div className="flex justify-between">
                <span>Core Framework:</span>
                <span className="text-neutral-200">React 18 / Vite 5</span>
              </div>
              <div className="flex justify-between">
                <span>PWA Service Worker:</span>
                <span className="text-emerald-400">REGISTERED (v1.0.4)</span>
              </div>
              <div className="flex justify-between">
                <span>Vercel Edge Ready:</span>
                <span className="text-emerald-400">OPTIMIZED</span>
              </div>
              <div className="flex justify-between">
                <span>SOI Geodesy Datum:</span>
                <span className="text-neutral-200">WGS-84 / Everest 1956</span>
              </div>
              <div className="flex justify-between">
                <span>Backend Relay:</span>
                <span className="text-neutral-200">FastAPI Async (Port 8000)</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-4 text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Smartphone className="w-4 h-4" /> PWA INSTALLED STATUS
            </div>
            <p className="text-[11px] font-sans text-neutral-400">
              Vigilance can run offline as a standalone Progressive Web App on Windows, macOS, Android, and iOS devices with full military grid support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
