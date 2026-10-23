import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Map as MapLibreMap, type StyleSpecification, type MapMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  DEFENSE_STATIONS,
  SENSOR_NODES,
  ACTIVE_INCIDENTS,
  GEOFENCES,
  INDIA_SOI_BOUNDARY_COORDS,
  LIVE_TRACK_PLOTS,
  type TacticalDefenseStation,
  type TacticalSensorNode,
  type TacticalIncidentMarker,
  type TacticalTrackPlot
} from '../../data/indiaGeospatial';
import type { ThreatLevel } from '../../types';
import {
  Radio,
  Camera,
  Flame,
  Volume2,
  Maximize2,
  Navigation,
  Globe,
  Map as MapIcon,
  Mountain
} from 'lucide-react';

interface PrecisionIndiaMapProps {
  compact?: boolean;
  onSelectIncident?: (incidentId: string) => void;
  onExpand?: () => void;
  highlightedIncidentId?: string;
  onStartSimulation?: () => void;
  isSimulating?: boolean;
}

export type BaseMapType = 'google-hybrid' | 'google-roadmap' | 'google-terrain';

export const PrecisionIndiaMap: React.FC<PrecisionIndiaMapProps> = ({
  compact = false,
  onSelectIncident,
  onExpand,
  highlightedIncidentId,
  onStartSimulation,
  isSimulating = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasOverlayRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  // Base Map Layer (Default: Google Satellite Hybrid for true photographic place accuracy + roads/labels)
  const [baseMap, setBaseMap] = useState<BaseMapType>('google-hybrid');

  // Tactical Layers Toggle State
  const [layers, setLayers] = useState({
    radarRings: true,
    liveTracks: true,
    sensorNodes: true,
    geofences: true,
    threats: true,
    soiBoundary: true
  });

  // Active Selections
  const [selectedStation, setSelectedStation] = useState<TacticalDefenseStation | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<TacticalSensorNode | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<TacticalIncidentMarker | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<TacticalTrackPlot | null>(null);
  const [activeSector, setActiveSector] = useState<string>('ALL');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(compact ? 4.2 : 5.0);

  // Dynamic live track drift state (Simulates real periodic radar plot updates)
  const [tracks, setTracks] = useState<TacticalTrackPlot[]>(LIVE_TRACK_PLOTS);

  // Convert Survey of India boundary [lat, lng] to GeoJSON polygon [lng, lat]
  const soiGeoJSON = useMemo(() => {
    const coords = INDIA_SOI_BOUNDARY_COORDS.map(([lat, lng]) => [lng, lat]);
    if (coords.length > 0 && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
      coords.push(coords[0]);
    }
    return {
      type: 'Feature' as const,
      properties: {
        name: 'Survey of India Territorial Sovereign Boundary',
        code: 'IND-SOI-2026'
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coords]
      }
    };
  }, []);

  // Generate MapLibre Style Specification for Google Maps Tiles
  const getMapStyle = (type: BaseMapType): StyleSpecification => {
    let tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'; // Default Hybrid
    if (type === 'google-roadmap') {
      tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // Street Roadmap
    } else if (type === 'google-terrain') {
      tileUrl = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'; // Terrain Elevation
    }

    return {
      version: 8,
      sources: {
        'google-tiles': {
          type: 'raster',
          tiles: [
            tileUrl.replace('mt1', 'mt0'),
            tileUrl.replace('mt1', 'mt1'),
            tileUrl.replace('mt1', 'mt2'),
            tileUrl.replace('mt1', 'mt3')
          ],
          tileSize: 256,
          attribution: 'Google Maps Place-Accurate Cartography • Survey of India Boundary Alignment'
        }
      },
      layers: [
        {
          id: 'google-tiles-layer',
          type: 'raster',
          source: 'google-tiles',
          minzoom: 0,
          maxzoom: 20
        }
      ]
    };
  };

  // Initialize MapLibre with Place-Accurate Google Maps
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: getMapStyle(baseMap),
      center: [78.9629, 22.5937], // Center of India
      zoom: compact ? 4.2 : 5.0,
      minZoom: 3.5,
      maxZoom: 19,
      attributionControl: false
    });

    mapRef.current = map;

    map.on('mousemove', (e: MapMouseEvent) => {
      setCursorCoords({
        lat: Number(e.lngLat.lat.toFixed(4)),
        lng: Number(e.lngLat.lng.toFixed(4))
      });
    });

    map.on('zoom', () => {
      setMapZoom(Number(map.getZoom().toFixed(1)));
    });

    map.on('load', () => {
      // 1. Add SOI Boundary Line & Mask
      map.addSource('soi-boundary', {
        type: 'geojson',
        data: soiGeoJSON
      });

      // Shaded Indian sovereign territory
      map.addLayer({
        id: 'soi-fill',
        type: 'fill',
        source: 'soi-boundary',
        paint: {
          'fill-color': '#0369a1',
          'fill-opacity': 0.08
        }
      });

      // Hairline official boundary stroke
      map.addLayer({
        id: 'soi-stroke',
        type: 'line',
        source: 'soi-boundary',
        paint: {
          'line-color': '#0284c7',
          'line-width': 2.0,
          'line-dasharray': [4, 2],
          'line-opacity': 0.95
        }
      });

      // 2. Add Tactical Geofences
      const geofenceFeatures = GEOFENCES.map((geo) => ({
        type: 'Feature' as const,
        properties: {
          id: geo.id,
          name: geo.name,
          severity: geo.severityOnBreach
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [geo.polygon.map(([lat, lng]) => [lng, lat])]
        }
      }));

      map.addSource('tactical-geofences', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: geofenceFeatures
        }
      });

      map.addLayer({
        id: 'geofence-fill',
        type: 'fill',
        source: 'tactical-geofences',
        paint: {
          'fill-color': '#ef4444',
          'fill-opacity': 0.16
        }
      });

      map.addLayer({
        id: 'geofence-stroke',
        type: 'line',
        source: 'tactical-geofences',
        paint: {
          'line-color': '#dc2626',
          'line-width': 1.8,
          'line-dasharray': [3, 2],
          'line-opacity': 0.9
        }
      });
    });

    return () => {
      map.remove();
    };
  }, []);

  // Handle Base Map Switching (Satellite vs Roadmap vs Terrain)
  const handleSwitchBaseMap = (type: BaseMapType) => {
    setBaseMap(type);
    const map = mapRef.current;
    if (!map) return;

    // Save center and zoom
    const center = map.getCenter();
    const zoom = map.getZoom();

    map.setStyle(getMapStyle(type));

    map.once('style.load', () => {
      map.setCenter(center);
      map.setZoom(zoom);

      // Re-add SOI Boundary
      if (!map.getSource('soi-boundary')) {
        map.addSource('soi-boundary', {
          type: 'geojson',
          data: soiGeoJSON
        });

        map.addLayer({
          id: 'soi-fill',
          type: 'fill',
          source: 'soi-boundary',
          paint: {
            'fill-color': '#0369a1',
            'fill-opacity': 0.08
          }
        });

        map.addLayer({
          id: 'soi-stroke',
          type: 'line',
          source: 'soi-boundary',
          paint: {
            'line-color': '#0284c7',
            'line-width': 2.0,
            'line-dasharray': [4, 2],
            'line-opacity': 0.95
          }
        });
      }

      // Re-add Geofences
      if (!map.getSource('tactical-geofences')) {
        const geofenceFeatures = GEOFENCES.map((geo) => ({
          type: 'Feature' as const,
          properties: {
            id: geo.id,
            name: geo.name,
            severity: geo.severityOnBreach
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: [geo.polygon.map(([lat, lng]) => [lng, lat])]
          }
        }));

        map.addSource('tactical-geofences', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: geofenceFeatures
          }
        });

        map.addLayer({
          id: 'geofence-fill',
          type: 'fill',
          source: 'tactical-geofences',
          paint: {
            'fill-color': '#ef4444',
            'fill-opacity': 0.16
          }
        });

        map.addLayer({
          id: 'geofence-stroke',
          type: 'line',
          source: 'tactical-geofences',
          paint: {
            'line-color': '#dc2626',
            'line-width': 1.8,
            'line-dasharray': [3, 2],
            'line-opacity': 0.9
          }
        });
      }
    });
  };

  // Update MapLibre layer visibility on state change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('soi-fill')) {
      map.setLayoutProperty('soi-fill', 'visibility', layers.soiBoundary ? 'visible' : 'none');
    }
    if (map.getLayer('soi-stroke')) {
      map.setLayoutProperty('soi-stroke', 'visibility', layers.soiBoundary ? 'visible' : 'none');
    }
    if (map.getLayer('geofence-fill')) {
      map.setLayoutProperty('geofence-fill', 'visibility', layers.geofences ? 'visible' : 'none');
    }
    if (map.getLayer('geofence-stroke')) {
      map.setLayoutProperty('geofence-stroke', 'visibility', layers.geofences ? 'visible' : 'none');
    }
  }, [layers]);

  // Periodic realistic radar track advancement (e.g., every 3s plot update, no fake continuous wedge)
  useEffect(() => {
    const interval = setInterval(() => {
      setTracks((prev) =>
        prev.map((trk) => {
          // Advance coordinates slightly along heading
          const rad = (trk.headingDeg * Math.PI) / 180;
          // ~0.003 deg delta
          const dLat = (Math.cos(rad) * trk.speedKts) / 75000;
          const dLng = (Math.sin(rad) * trk.speedKts) / 75000;

          const newLat = trk.coordinates[0] + dLat;
          const newLng = trk.coordinates[1] + dLng;

          const newHistory: [number, number][] = [
            trk.coordinates,
            ...(trk.history.slice(0, 3))
          ];

          return {
            ...trk,
            coordinates: [newLat, newLng],
            history: newHistory
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Canvas Overlay for Realistic Fixed Range Rings & Track Velocity Vectors
  useEffect(() => {
    const canvas = canvasOverlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderOverlay = () => {
      const map = mapRef.current;
      if (!map) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Render Static Tactical Radar Range Rings (Professional, subtle hairline circles)
      if (layers.radarRings) {
        DEFENSE_STATIONS.forEach((station) => {
          const pt = map.project([station.coordinates[1], station.coordinates[0]]);
          if (pt.x < -300 || pt.x > width + 300 || pt.y < -300 || pt.y > height + 300) return;

          const center = map.getCenter();
          const p1 = map.project([center.lng, center.lat]);
          const p2 = map.project([center.lng + 1, center.lat]);
          const pixelsPerDegree = Math.abs(p2.x - p1.x);
          const pixelsPerKm = pixelsPerDegree / 111;
          const radiusPixels = Math.max(30, station.radarSweepRadiusKm * pixelsPerKm);

          ctx.save();
          // Concentric calibrated range rings
          const rings = [0.25, 0.5, 0.75, 1.0];
          rings.forEach((ratio, idx) => {
            const r = radiusPixels * ratio;
            ctx.beginPath();
            ctx.strokeStyle = idx === 3 ? 'rgba(56, 189, 248, 0.5)' : 'rgba(56, 189, 248, 0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash(idx === 3 ? [4, 4] : [2, 4]);
            ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
            ctx.stroke();

            // Nautical/Kilometer range label along East axis
            const km = Math.round(station.radarSweepRadiusKm * ratio);
            ctx.fillStyle = 'rgba(224, 242, 254, 0.6)';
            ctx.font = '8px monospace';
            ctx.fillText(`${km}km`, pt.x + r + 3, pt.y - 2);
          });

          // Cardinal crosshair ticks
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          const tickLen = 6;
          // North, South, East, West ticks
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y - radiusPixels - tickLen);
          ctx.lineTo(pt.x, pt.y - radiusPixels + tickLen);
          ctx.moveTo(pt.x, pt.y + radiusPixels - tickLen);
          ctx.lineTo(pt.x, pt.y + radiusPixels + tickLen);
          ctx.moveTo(pt.x - radiusPixels - tickLen, pt.y);
          ctx.lineTo(pt.x - radiusPixels + tickLen, pt.y);
          ctx.moveTo(pt.x + radiusPixels - tickLen, pt.y);
          ctx.lineTo(pt.x + radiusPixels + tickLen, pt.y);
          ctx.stroke();

          ctx.restore();
        });
      }

      // 2. Render Live Track Plots (Velocity Vector line + Historical breadcrumbs)
      if (layers.liveTracks) {
        tracks.forEach((trk) => {
          const pt = map.project([trk.coordinates[1], trk.coordinates[0]]);
          if (pt.x < -100 || pt.x > width + 100 || pt.y < -100 || pt.y > height + 100) return;

          const isHostile = trk.affiliation === 'hostile';
          const isFriendly = trk.affiliation === 'friendly';
          const trackColor = isHostile ? '#ef4444' : isFriendly ? '#10b981' : '#f59e0b';

          ctx.save();

          // Draw historical breadcrumbs trail
          if (trk.history.length > 0) {
            ctx.strokeStyle = trackColor;
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);

            trk.history.forEach((hist, i) => {
              const hpt = map.project([hist[1], hist[0]]);
              ctx.lineTo(hpt.x, hpt.y);

              // Small historical dot
              ctx.fillStyle = trackColor;
              ctx.globalAlpha = 0.5 / (i + 1);
              ctx.beginPath();
              ctx.arc(hpt.x, hpt.y, 1.5, 0, Math.PI * 2);
              ctx.fill();
            });
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }

          // Draw Speed Velocity Vector (Direction & speed leader line)
          const headingRad = ((trk.headingDeg - 90) * Math.PI) / 180;
          const vectorLength = Math.max(12, Math.min(45, (trk.speedKts / 500) * 35));
          const vx = pt.x + Math.cos(headingRad) * vectorLength;
          const vy = pt.y + Math.sin(headingRad) * vectorLength;

          ctx.strokeStyle = trackColor;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(vx, vy);
          ctx.stroke();

          ctx.restore();
        });
      }
    };

    const animId = requestAnimationFrame(renderOverlay);
    return () => cancelAnimationFrame(animId);
  }, [layers, tracks, baseMap]);

  // Sector Quick Navigation Fly-to
  const handleSectorJump = (sectorKey: string) => {
    setActiveSector(sectorKey);
    const map = mapRef.current;
    if (!map) return;

    switch (sectorKey) {
      case 'NORTH':
        map.flyTo({ center: [74.7973, 34.0837], zoom: 8.5, speed: 1.4 });
        break;
      case 'WEST':
        map.flyTo({ center: [72.8347, 18.9220], zoom: 9.5, speed: 1.4 });
        break;
      case 'EAST':
        map.flyTo({ center: [91.8594, 27.5861], zoom: 8.8, speed: 1.4 });
        break;
      case 'CENTRAL':
        map.flyTo({ center: [77.2090, 28.6139], zoom: 8.5, speed: 1.4 });
        break;
      case 'SOUTH':
        map.flyTo({ center: [76.2673, 9.9312], zoom: 9.0, speed: 1.4 });
        break;
      default:
        map.flyTo({ center: [78.9629, 22.5937], zoom: compact ? 4.2 : 5.0, speed: 1.2 });
        break;
    }
  };

  const getThreatColor = (level: ThreatLevel) => {
    switch (level) {
      case 'L5': return '#ef4444'; // Red
      case 'L4': return '#ea580c'; // Rust orange
      case 'L3': return '#f59e0b'; // Amber
      case 'L2': return '#10b981'; // Green
      case 'L1': default: return '#64748b'; // Slate
    }
  };

  const getSensorIcon = (type: TacticalSensorNode['sensorType']) => {
    switch (type) {
      case 'radar': return <Radio size={11} />;
      case 'cctv': return <Camera size={11} />;
      case 'thermal': return <Flame size={11} />;
      case 'acoustic': return <Volume2 size={11} />;
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#0c0f17',
      overflow: 'hidden',
      fontFamily: 'var(--font-mono, monospace)',
      userSelect: 'none'
    }}>
      {/* 1. Underlying Google Maps Viewport (Place-Accurate) */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />

      {/* 2. Tactical Canvas Overlay (Fixed Range Rings & Track Vectors) */}
      <canvas
        ref={canvasOverlayRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />

      {/* 3. Top Left: Sector Filter & Map Mode Switcher */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {/* Header HUD */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1px solid rgba(51, 65, 85, 0.8)',
          borderRadius: '2px',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.05em' }}>
              SOI GEOSPATIAL DEFENSE ENGINE
            </span>
          </div>

          <span style={{ color: '#475569', fontSize: '10px' }}>|</span>

          {/* Place-Accurate Google Base Map Switcher */}
          <div style={{ display: 'flex', gap: '2px' }}>
            {[
              { type: 'google-hybrid' as BaseMapType, label: 'SATELLITE', icon: Globe },
              { type: 'google-roadmap' as BaseMapType, label: 'STREETS', icon: MapIcon },
              { type: 'google-terrain' as BaseMapType, label: 'TERRAIN', icon: Mountain }
            ].map((b) => {
              const Icon = b.icon;
              const isActive = baseMap === b.type;
              return (
                <button
                  key={b.type}
                  onClick={() => handleSwitchBaseMap(b.type)}
                  style={{
                    background: isActive ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
                    border: `1px solid ${isActive ? '#38bdf8' : 'rgba(71, 85, 105, 0.5)'}`,
                    color: isActive ? '#fff' : '#94a3b8',
                    padding: '2px 6px',
                    borderRadius: '2px',
                    fontSize: '9px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title={`Switch to Google ${b.label}`}
                >
                  <Icon size={10} />
                  <span>{b.label}</span>
                </button>
              );
            })}
          </div>

          <span style={{ color: '#475569', fontSize: '10px' }}>|</span>

          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
            ZOOM {mapZoom}x
          </div>

          {onExpand && (
            <button
              onClick={onExpand}
              title="Expand to Full Map View"
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
              <Maximize2 size={13} />
            </button>
          )}
        </div>

        {/* Tactical Sector Quick Jumps */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          maxWidth: compact ? '280px' : '650px'
        }}>
          {[
            { key: 'ALL', label: 'ALL INDIA' },
            { key: 'NORTH', label: 'NORTH: J&K / LADAKH' },
            { key: 'WEST', label: 'WEST: ARABIAN SEA' },
            { key: 'EAST', label: 'EAST: TAWANG' },
            { key: 'CENTRAL', label: 'CENTRAL: DELHI' },
            { key: 'SOUTH', label: 'SOUTH: COASTAL' }
          ].map((sec) => (
            <button
              key={sec.key}
              onClick={() => handleSectorJump(sec.key)}
              style={{
                background: activeSector === sec.key ? 'rgba(2, 132, 199, 0.35)' : 'rgba(15, 23, 42, 0.92)',
                border: `1px solid ${activeSector === sec.key ? '#38bdf8' : 'rgba(51, 65, 85, 0.8)'}`,
                color: activeSector === sec.key ? '#f8fafc' : '#94a3b8',
                padding: '3px 8px',
                borderRadius: '2px',
                fontSize: '9px',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.04em'
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Top Right: Tactical Layer Toggles & AI Simulation Quick Trigger */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '6px'
      }}>
        {onStartSimulation && (
          <button
            onClick={onStartSimulation}
            disabled={isSimulating}
            style={{
              background: isSimulating ? '#1e293b' : '#042f2e',
              border: `1px solid ${isSimulating ? '#64748b' : '#0d9488'}`,
              color: isSimulating ? '#94a3b8' : '#2dd4bf',
              padding: '5px 12px',
              borderRadius: '2px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              letterSpacing: '0.04em'
            }}
          >
            <Radio size={12} className={isSimulating ? 'animate-spin' : ''} />
            {isSimulating ? 'AI RECON SIMULATING...' : '▶ START AI SENSOR SIMULATION'}
          </button>
        )}

        {/* Tactical Layers Bar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1px solid rgba(51, 65, 85, 0.8)',
          borderRadius: '2px',
          padding: '4px 6px',
          display: 'flex',
          gap: '6px'
        }}>
          {[
            { key: 'radarRings' as const, label: 'RADAR RINGS' },
            { key: 'liveTracks' as const, label: 'LIVE TRACKS' },
            { key: 'sensorNodes' as const, label: 'SENSORS' },
            { key: 'geofences' as const, label: 'GEOFENCE' },
            { key: 'threats' as const, label: 'THREATS' },
            { key: 'soiBoundary' as const, label: 'SOI BORDER' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setLayers(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              style={{
                background: layers[item.key] ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                border: `1px solid ${layers[item.key] ? '#38bdf8' : 'transparent'}`,
                color: layers[item.key] ? '#e0f2fe' : '#64748b',
                padding: '2px 6px',
                borderRadius: '2px',
                fontSize: '9px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Interactive HTML Markers (Stations, Realistic Tracks, Sensors, Incidents) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }}>
        {/* Render Defense Station Pins */}
        {DEFENSE_STATIONS.map((station) => {
          const map = mapRef.current;
          if (!map) return null;
          const pos = map.project([station.coordinates[1], station.coordinates[0]]);
          if (pos.x < -50 || pos.x > window.innerWidth || pos.y < -50 || pos.y > window.innerHeight) return null;

          return (
            <div
              key={station.id}
              onClick={() => {
                setSelectedStation(station);
                setSelectedSensor(null);
                setSelectedIncident(null);
                setSelectedTrack(null);
              }}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 6
              }}
            >
              <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid #38bdf8',
                borderRadius: '2px',
                padding: '2px 5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '9px',
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
              }}>
                <Radio size={10} color="#38bdf8" />
                <span>{station.name.split(' (')[0]}</span>
              </div>
            </div>
          );
        })}

        {/* Render Realistic Live Military Radar Tracks (No fake spinning, pure military track symbology) */}
        {layers.liveTracks && tracks.map((trk) => {
          const map = mapRef.current;
          if (!map) return null;
          const pos = map.project([trk.coordinates[1], trk.coordinates[0]]);
          if (pos.x < -50 || pos.x > window.innerWidth || pos.y < -50 || pos.y > window.innerHeight) return null;

          const isHostile = trk.affiliation === 'hostile';
          const isFriendly = trk.affiliation === 'friendly';
          const color = isHostile ? '#ef4444' : isFriendly ? '#10b981' : '#f59e0b';

          return (
            <div
              key={trk.id}
              onClick={() => {
                setSelectedTrack(trk);
                setSelectedStation(null);
                setSelectedSensor(null);
                setSelectedIncident(null);
              }}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                zIndex: 9
              }}
            >
              {/* Tactical Track Icon (Rotated along flight heading) */}
              <div style={{
                transform: `rotate(${trk.headingDeg}deg)`,
                color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))'
              }}>
                <Navigation size={13} fill={color} />
              </div>

              {/* Military Track Data Tag */}
              {!compact && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.92)',
                  border: `1px solid ${color}`,
                  borderRadius: '2px',
                  padding: '2px 5px',
                  fontSize: '8px',
                  color: '#f8fafc',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.7)'
                }}>
                  <div style={{ fontWeight: 700, color }}>{trk.id} • {trk.callsign.split(' ')[0]}</div>
                  <div style={{ color: '#cbd5e1' }}>
                    {trk.altitudeFt ? `FL${Math.round(trk.altitudeFt / 100)}` : 'SURFACE'} • {trk.speedKts}KT • SQ{trk.squawkCode}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Render Physical Surveillance Sensor Node Pins */}
        {layers.sensorNodes && SENSOR_NODES.map((sensor) => {
          const map = mapRef.current;
          if (!map) return null;
          const pos = map.project([sensor.coordinates[1], sensor.coordinates[0]]);
          if (pos.x < -50 || pos.x > window.innerWidth || pos.y < -50 || pos.y > window.innerHeight) return null;

          return (
            <div
              key={sensor.id}
              onClick={() => {
                setSelectedSensor(sensor);
                setSelectedStation(null);
                setSelectedIncident(null);
                setSelectedTrack(null);
              }}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                zIndex: 7
              }}
            >
              <div style={{
                background: 'rgba(4, 47, 46, 0.92)',
                border: '1px solid #14b8a6',
                borderRadius: '2px',
                padding: '2px 4px',
                color: '#2dd4bf',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '8px',
                fontWeight: 600
              }}>
                {getSensorIcon(sensor.sensorType)}
                <span>{sensor.id}</span>
              </div>
            </div>
          );
        })}

        {/* Render Active Threat Incident Reticles */}
        {layers.threats && ACTIVE_INCIDENTS.map((inc) => {
          const map = mapRef.current;
          if (!map) return null;
          const pos = map.project([inc.coordinates[1], inc.coordinates[0]]);
          if (pos.x < -50 || pos.x > window.innerWidth || pos.y < -50 || pos.y > window.innerHeight) return null;

          const color = getThreatColor(inc.threatLevel);
          const isHighlighted = highlightedIncidentId === inc.id;

          return (
            <div
              key={inc.id}
              onClick={() => {
                setSelectedIncident(inc);
                setSelectedStation(null);
                setSelectedSensor(null);
                setSelectedTrack(null);
                if (onSelectIncident) onSelectIncident(inc.id);
              }}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                zIndex: 8
              }}
            >
              {/* Tactical Reticle Badge */}
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '2px',
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                border: `1.5px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isHighlighted ? `0 0 10px ${color}` : '0 2px 8px rgba(0,0,0,0.7)',
                position: 'relative'
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color }}>{inc.threatLevel}</span>
              </div>

              {!compact && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.92)',
                  border: `1px solid ${color}`,
                  borderRadius: '2px',
                  padding: '2px 5px',
                  fontSize: '9px',
                  color: '#f8fafc',
                  whiteSpace: 'nowrap'
                }}>
                  {inc.id} • {inc.confidence}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 6. Selected Item Inspection Drawer / HUD Flyout */}
      {(selectedIncident || selectedStation || selectedSensor || selectedTrack) && (
        <div style={{
          position: 'absolute',
          bottom: '34px',
          left: '10px',
          zIndex: 15,
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(71, 85, 105, 0.8)',
          borderRadius: '2px',
          padding: '12px 14px',
          width: compact ? '280px' : '360px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {selectedTrack && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Navigation size={13} color={selectedTrack.affiliation === 'hostile' ? '#ef4444' : '#10b981'} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                    {selectedTrack.id} • {selectedTrack.callsign}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTrack(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px', color: '#cbd5e1' }}>
                <div>TYPE: <strong style={{ color: '#f8fafc' }}>{selectedTrack.type.toUpperCase()}</strong></div>
                <div>AFFILIATION: <strong style={{ color: selectedTrack.affiliation === 'hostile' ? '#ef4444' : '#10b981' }}>{selectedTrack.affiliation.toUpperCase()}</strong></div>
                <div>ALTITUDE: {selectedTrack.altitudeFt ? `${selectedTrack.altitudeFt} FT` : 'SURFACE'}</div>
                <div>SPEED: {selectedTrack.speedKts} KNOTS</div>
                <div>HEADING: {selectedTrack.headingDeg}°</div>
                <div>SQUAWK: {selectedTrack.squawkCode}</div>
              </div>

              <div style={{ fontSize: '10px', color: '#64748b', borderTop: '1px solid #334155', paddingTop: '6px' }}>
                RADAR SENSOR: {selectedTrack.sourceRadarId} • POS: {selectedTrack.coordinates[0].toFixed(4)}°N, {selectedTrack.coordinates[1].toFixed(4)}°E
              </div>
            </>
          )}

          {selectedIncident && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    backgroundColor: getThreatColor(selectedIncident.threatLevel),
                    color: '#000',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '2px'
                  }}>
                    {selectedIncident.threatLevel}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                    {selectedIncident.id}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: 500 }}>
                {selectedIncident.title}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px', color: '#cbd5e1' }}>
                <div>COORDS: {selectedIncident.coordinates[0].toFixed(4)}°N, {selectedIncident.coordinates[1].toFixed(4)}°E</div>
                <div>CONFIDENCE: <span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedIncident.confidence}%</span></div>
                <div>STATUS: <span style={{ color: '#fbbf24' }}>{selectedIncident.workflowStatus}</span></div>
                <div>UNCERTAINTY: {selectedIncident.uncertaintyScore}%</div>
              </div>

              <div style={{ fontSize: '10px', color: '#64748b', borderTop: '1px solid #334155', paddingTop: '6px' }}>
                FUSED TELEMETRY: {selectedIncident.sensorSources.join(', ')}
              </div>
            </>
          )}

          {selectedStation && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Radio size={12} color="#38bdf8" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                    {selectedStation.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedStation(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                {selectedStation.sector}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px', color: '#94a3b8' }}>
                <div>READINESS: <span style={{ color: '#10b981', fontWeight: 600 }}>{selectedStation.readinessStatus}</span></div>
                <div>RADAR RADIUS: {selectedStation.radarSweepRadiusKm} KM</div>
                <div>ELEVATION: {selectedStation.elevationMeters} M</div>
                <div>PULSE DOPPLER: GS-SERIES ACTIVE</div>
              </div>
            </>
          )}

          {selectedSensor && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {getSensorIcon(selectedSensor.sensorType)}
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                    {selectedSensor.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSensor(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px', color: '#cbd5e1' }}>
                <div>STATUS: <span style={{ color: '#10b981', fontWeight: 600 }}>{selectedSensor.status.toUpperCase()}</span></div>
                <div>QUALITY: {selectedSensor.dataQuality}%</div>
                <div>RANGE: {selectedSensor.rangeKm} KM</div>
                <div>LAST PING: {selectedSensor.lastPing}</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 7. Bottom Status & Coordinates Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '24px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderTop: '1px solid rgba(51, 65, 85, 0.8)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        fontSize: '10px',
        color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>CARTOGRAPHY: GOOGLE MAPS PLACE-ACCURATE ({baseMap.toUpperCase()})</span>
          <span>DATUM: SURVEY OF INDIA 2026</span>
          {cursorCoords && (
            <span style={{ color: '#f8fafc', fontWeight: 600 }}>
              POS: {cursorCoords.lat}° N, {cursorCoords.lng}° E
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#10b981' }}>● RADAR TRACKING: {tracks.length} LIVE TRACKS</span>
          <span>INCIDENTS: {ACTIVE_INCIDENTS.length} ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
