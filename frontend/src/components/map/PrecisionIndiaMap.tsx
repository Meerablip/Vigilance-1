import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Map as MapLibreMap, type StyleSpecification, type MapMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  DEFENSE_STATIONS,
  SENSOR_NODES,
  ACTIVE_INCIDENTS,
  GEOFENCES,
  INDIA_SOI_BOUNDARY_COORDS,
  type TacticalDefenseStation,
  type TacticalSensorNode,
  type TacticalIncidentMarker
} from '../../data/indiaGeospatial';
import type { ThreatLevel } from '../../types';
import {
  Radio,
  Camera,
  Flame,
  Volume2,
  Maximize2
} from 'lucide-react';

interface PrecisionIndiaMapProps {
  compact?: boolean;
  onSelectIncident?: (incidentId: string) => void;
  onExpand?: () => void;
  highlightedIncidentId?: string;
  onStartSimulation?: () => void;
  isSimulating?: boolean;
}

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

  // Tactical Layers Toggle State
  const [layers, setLayers] = useState({
    radarSweep: true,
    sensorCones: true,
    geofences: true,
    threats: true,
    soiBoundary: true,
    gridOverlay: true
  });

  // Active Sector / Selection State
  const [selectedStation, setSelectedStation] = useState<TacticalDefenseStation | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<TacticalSensorNode | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<TacticalIncidentMarker | null>(null);
  const [activeSector, setActiveSector] = useState<string>('ALL');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(compact ? 4.2 : 4.8);

  // Radar sweep animation angle (radians)
  const sweepAngleRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Convert Survey of India boundary [lat, lng] to GeoJSON polygon [lng, lat]
  const soiGeoJSON = useMemo(() => {
    const coords = INDIA_SOI_BOUNDARY_COORDS.map(([lat, lng]) => [lng, lat]);
    // Close polygon if not already closed
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

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Dark tactical military map style (Clean ESRI Dark Gray GIS - Zero watermark)
    const tacticalMapStyle: StyleSpecification = {
      version: 8,
      sources: {
        'esri-dark-gray': {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: 'Survey of India Sovereign Alignment • Tactical GIS'
        },
        'esri-dark-reference': {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'esri-dark-layer',
          type: 'raster',
          source: 'esri-dark-gray',
          minzoom: 0,
          maxzoom: 16
        },
        {
          id: 'esri-reference-layer',
          type: 'raster',
          source: 'esri-dark-reference',
          minzoom: 0,
          maxzoom: 16
        }
      ]
    };

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: tacticalMapStyle,
      center: [78.9629, 22.5937], // Center of India
      zoom: compact ? 4.1 : 4.8,
      minZoom: 3.5,
      maxZoom: 16,
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
          'fill-color': '#162235',
          'fill-opacity': 0.18
        }
      });

      // Hairline boundary stroke
      map.addLayer({
        id: 'soi-stroke',
        type: 'line',
        source: 'soi-boundary',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 1.5,
          'line-dasharray': [3, 2],
          'line-opacity': 0.85
        }
      });

      // 2. Add Geofences
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
          'fill-color': '#dc2626',
          'fill-opacity': 0.15
        }
      });

      map.addLayer({
        id: 'geofence-stroke',
        type: 'line',
        source: 'tactical-geofences',
        paint: {
          'line-color': '#ef4444',
          'line-width': 1.8,
          'line-dasharray': [4, 2],
          'line-opacity': 0.9
        }
      });
    });

    return () => {
      map.remove();
    };
  }, [compact, soiGeoJSON]);

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

  // Canvas Doppler Radar & Sensor FOV Animation Loop
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

      // Increment Doppler radar rotation
      sweepAngleRef.current += 0.035;

      // 1. Render Doppler Radar Range Rings & Sweep Beams
      if (layers.radarSweep) {
        DEFENSE_STATIONS.forEach((station) => {
          // Project [lng, lat] to canvas pixel {x, y}
          const pt = map.project([station.coordinates[1], station.coordinates[0]]);
          if (pt.x < -200 || pt.x > width + 200 || pt.y < -200 || pt.y > height + 200) return;

          // Convert km radius to pixels based on current zoom
          // Rough approximation: at zoom 5, 1 deg lat is ~111km, pixel conversion
          const center = map.getCenter();
          const p1 = map.project([center.lng, center.lat]);
          const p2 = map.project([center.lng + 1, center.lat]);
          const pixelsPerDegree = Math.abs(p2.x - p1.x);
          const pixelsPerKm = pixelsPerDegree / 111;
          const radiusPixels = Math.max(30, station.radarSweepRadiusKm * pixelsPerKm);

          // Draw concentric range rings (50km, 100km, max radius)
          ctx.save();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);

          // Ring 1 (1/3 radius)
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radiusPixels * 0.35, 0, Math.PI * 2);
          ctx.stroke();

          // Ring 2 (2/3 radius)
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radiusPixels * 0.7, 0, Math.PI * 2);
          ctx.stroke();

          // Outer Ring
          ctx.setLineDash([4, 2]);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radiusPixels, 0, Math.PI * 2);
          ctx.stroke();

          // Distance Tag
          ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
          ctx.font = '9px monospace';
          ctx.fillText(`${station.radarSweepRadiusKm} KM`, pt.x + radiusPixels + 4, pt.y + 3);

          // Draw rotating radar sweep wedge
          const currentSweep = sweepAngleRef.current * (station.dopplerRpm / 12);
          const sweepGradient = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radiusPixels);
          sweepGradient.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
          sweepGradient.addColorStop(1, 'rgba(56, 189, 248, 0.25)');

          ctx.fillStyle = sweepGradient;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.arc(pt.x, pt.y, radiusPixels, currentSweep - 0.45, currentSweep);
          ctx.closePath();
          ctx.fill();

          // Sweep leading edge line
          ctx.strokeStyle = 'rgba(125, 211, 252, 0.85)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(
            pt.x + radiusPixels * Math.cos(currentSweep),
            pt.y + radiusPixels * Math.sin(currentSweep)
          );
          ctx.stroke();

          // Station crosshair center
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });
      }

      // 2. Render Sensor FOV Cones (Optical/Thermal)
      if (layers.sensorCones) {
        SENSOR_NODES.forEach((sensor) => {
          if (!sensor.fovBearingDeg || !sensor.fovSpreadDeg) return;
          const pt = map.project([sensor.coordinates[1], sensor.coordinates[0]]);
          if (pt.x < -100 || pt.x > width + 100 || pt.y < -100 || pt.y > height + 100) return;

          const p1 = map.project([sensor.coordinates[1], sensor.coordinates[0]]);
          const p2 = map.project([sensor.coordinates[1] + 0.1, sensor.coordinates[0]]);
          const pixelsPerDegree = Math.abs(p2.x - p1.x);
          const pixelsPerKm = pixelsPerDegree / 11.1;
          const coneRadiusPixels = Math.max(25, Math.min(100, sensor.rangeKm * pixelsPerKm));

          // Angle conversion: Bearing 0 is North (-PI/2 in canvas radians)
          const centerRad = ((sensor.fovBearingDeg - 90) * Math.PI) / 180;
          const spreadRad = (sensor.fovSpreadDeg * Math.PI) / 180;
          const startRad = centerRad - spreadRad / 2;
          const endRad = centerRad + spreadRad / 2;

          ctx.save();
          ctx.fillStyle = sensor.sensorType === 'thermal' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)';
          ctx.strokeStyle = sensor.sensorType === 'thermal' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 197, 94, 0.6)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);

          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.arc(pt.x, pt.y, coneRadiusPixels, startRad, endRad);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.restore();
        });
      }

      animFrameIdRef.current = requestAnimationFrame(renderOverlay);
    };

    renderOverlay();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [layers]);

  // Sector Quick Navigation Fly-to
  const handleSectorJump = (sectorKey: string) => {
    setActiveSector(sectorKey);
    const map = mapRef.current;
    if (!map) return;

    switch (sectorKey) {
      case 'NORTH':
        map.flyTo({ center: [74.7973, 34.0837], zoom: 7.2, speed: 1.4 });
        break;
      case 'WEST':
        map.flyTo({ center: [72.8347, 18.9220], zoom: 8.5, speed: 1.4 });
        break;
      case 'EAST':
        map.flyTo({ center: [91.8594, 27.5861], zoom: 7.8, speed: 1.4 });
        break;
      case 'CENTRAL':
        map.flyTo({ center: [77.2090, 28.6139], zoom: 7.5, speed: 1.4 });
        break;
      case 'SOUTH':
        map.flyTo({ center: [76.2673, 9.9312], zoom: 8.0, speed: 1.4 });
        break;
      default:
        map.flyTo({ center: [78.9629, 22.5937], zoom: compact ? 4.1 : 4.8, speed: 1.2 });
        break;
    }
  };

  const getThreatColor = (level: ThreatLevel) => {
    switch (level) {
      case 'L5': return '#ef4444'; // Red
      case 'L4': return '#f97316'; // Rust orange
      case 'L3': return '#eab308'; // Amber
      case 'L2': return '#22c55e'; // Green
      case 'L1': default: return '#64748b'; // Slate
    }
  };

  const getSensorIcon = (type: TacticalSensorNode['sensorType']) => {
    switch (type) {
      case 'radar': return <Radio size={12} />;
      case 'cctv': return <Camera size={12} />;
      case 'thermal': return <Flame size={12} />;
      case 'acoustic': return <Volume2 size={12} />;
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#090A0D',
      overflow: 'hidden',
      fontFamily: 'var(--font-mono, monospace)',
      userSelect: 'none'
    }}>
      {/* 1. Underlying MapLibre GL Map Viewport */}
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

      {/* 2. Tactical Doppler Radar & FOV Canvas Overlay */}
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

      {/* 3. Top Left: Sector Filter & Mission Command HUD */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{
          background: 'rgba(13, 16, 23, 0.94)',
          border: '1px solid var(--border-subtle, #27272a)',
          borderRadius: '2px',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f4f4f5', letterSpacing: '0.05em' }}>
              SOI GEOSPATIAL DEFENSE ENGINE
            </span>
          </div>

          <span style={{ color: '#52525b', fontSize: '10px' }}>|</span>

          <div style={{ fontSize: '10px', color: '#a1a1aa' }}>
            ZOOM {mapZoom}x
          </div>

          {onExpand && (
            <button
              onClick={onExpand}
              title="Expand to Full Map View"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#a1a1aa',
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
                background: activeSector === sec.key ? '#1e293b' : 'rgba(13, 16, 23, 0.88)',
                border: `1px solid ${activeSector === sec.key ? '#38bdf8' : 'rgba(39, 39, 42, 0.8)'}`,
                color: activeSector === sec.key ? '#f8fafc' : '#a1a1aa',
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
          background: 'rgba(13, 16, 23, 0.94)',
          border: '1px solid var(--border-subtle, #27272a)',
          borderRadius: '2px',
          padding: '4px 6px',
          display: 'flex',
          gap: '6px'
        }}>
          {[
            { key: 'radarSweep' as const, label: 'RADAR' },
            { key: 'sensorCones' as const, label: 'FOV CONES' },
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
                color: layers[item.key] ? '#e0f2fe' : '#71717a',
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

      {/* 5. Interactive HTML Markers (Sensors & Incidents) */}
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
                background: '#0f172a',
                border: '1px solid #38bdf8',
                borderRadius: '2px',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '9px',
                color: '#e2e8f0',
                whiteSpace: 'nowrap',
                fontWeight: 600
              }}>
                <Radio size={10} color="#38bdf8" />
                <span>{station.name.split(' (')[0]}</span>
              </div>
            </div>
          );
        })}

        {/* Render Sensor Node Pins */}
        {layers.sensorCones && SENSOR_NODES.map((sensor) => {
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
                background: '#042f2e',
                border: '1px solid #14b8a6',
                borderRadius: '2px',
                padding: '2px',
                color: '#2dd4bf',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getSensorIcon(sensor.sensorType)}
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
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: `1.5px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isHighlighted ? `0 0 10px ${color}` : 'none',
                position: 'relative'
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color }}>{inc.threatLevel}</span>
              </div>

              {!compact && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.88)',
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
      {(selectedIncident || selectedStation || selectedSensor) && (
        <div style={{
          position: 'absolute',
          bottom: '34px',
          left: '10px',
          zIndex: 15,
          background: 'rgba(13, 16, 23, 0.96)',
          border: '1px solid var(--border-subtle, #27272a)',
          borderRadius: '2px',
          padding: '12px 14px',
          width: compact ? '280px' : '360px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
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
                  style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '11px' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 500 }}>
                {selectedIncident.title}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px', color: '#94a3b8' }}>
                <div>COORDS: {selectedIncident.coordinates[0].toFixed(4)}°N, {selectedIncident.coordinates[1].toFixed(4)}°E</div>
                <div>CONFIDENCE: <span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedIncident.confidence}%</span></div>
                <div>STATUS: <span style={{ color: '#fbbf24' }}>{selectedIncident.workflowStatus}</span></div>
                <div>UNCERTAINTY: {selectedIncident.uncertaintyScore}%</div>
              </div>

              <div style={{ fontSize: '10px', color: '#64748b', borderTop: '1px solid #1e293b', paddingTop: '6px' }}>
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
                  style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '11px' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {selectedStation.sector}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px', color: '#94a3b8' }}>
                <div>STATUS: <span style={{ color: '#22c55e', fontWeight: 600 }}>{selectedStation.readinessStatus}</span></div>
                <div>RADAR RADIUS: {selectedStation.radarSweepRadiusKm} KM</div>
                <div>ELEVATION: {selectedStation.elevationMeters} M</div>
                <div>DOPPLER: {selectedStation.dopplerRpm} RPM</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 7. Bottom Tactical Status Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '24px',
        background: 'rgba(9, 10, 13, 0.95)',
        borderTop: '1px solid var(--border-subtle, #1e293b)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        fontSize: '10px',
        color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>PROJECTION: WGS84 / UTM ZONE 43N</span>
          <span>DATUM: SURVEY OF INDIA 2026</span>
          {cursorCoords && (
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
              POS: {cursorCoords.lat}° N, {cursorCoords.lng}° E
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#22c55e' }}>● TEL-GRID ONLINE</span>
          <span>INCIDENTS: {ACTIVE_INCIDENTS.length} ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
