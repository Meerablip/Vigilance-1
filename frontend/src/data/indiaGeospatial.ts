import type { ThreatLevel } from '../types';

export interface TacticalDefenseStation {
  id: string;
  name: string;
  sector: string;
  coordinates: [number, number]; // [lat, lng]
  elevationMeters: number;
  readinessStatus: 'DEFCON 3' | 'DEFCON 2' | 'DEFCON 1' | 'ROUTINE';
  radarSweepRadiusKm: number;
  dopplerRpm: number;
}

export interface TacticalSensorNode {
  id: string;
  name: string;
  stationId: string;
  sensorType: 'radar' | 'cctv' | 'thermal' | 'acoustic';
  coordinates: [number, number]; // [lat, lng]
  status: 'online' | 'degraded' | 'offline' | 'calibrating';
  rangeKm: number;
  fovBearingDeg?: number; // Center of FOV cone (0 = North)
  fovSpreadDeg?: number;  // Width of cone (e.g., 60 deg)
  dataQuality: number;
  lastPing: string;
}

export interface TacticalIncidentMarker {
  id: string;
  threatLevel: ThreatLevel;
  title: string;
  coordinates: [number, number]; // [lat, lng]
  confidence: number;
  uncertaintyScore: number;
  timestamp: string;
  sensorSources: string[];
  workflowStatus: string;
}

export interface TacticalGeofence {
  id: string;
  name: string;
  status: 'ARMED' | 'STANDBY';
  severityOnBreach: ThreatLevel;
  polygon: [number, number][]; // Array of [lat, lng]
}

// 1. Primary Strategic Defense Hubs in India
export const DEFENSE_STATIONS: TacticalDefenseStation[] = [
  {
    id: 'STN-NORTH-01',
    name: 'Northern Frontier Command (Sector 4 HQ)',
    sector: 'Northern Command (Jammu & Kashmir / Ladakh)',
    coordinates: [34.0837, 74.7973],
    elevationMeters: 1585,
    readinessStatus: 'DEFCON 2',
    radarSweepRadiusKm: 180,
    dopplerRpm: 12
  },
  {
    id: 'STN-WEST-02',
    name: 'Western Naval Corridor Command',
    sector: 'Western Command (Mumbai / Arabian Sea)',
    coordinates: [18.9220, 72.8347],
    elevationMeters: 14,
    readinessStatus: 'DEFCON 3',
    radarSweepRadiusKm: 220,
    dopplerRpm: 15
  },
  {
    id: 'STN-EAST-03',
    name: 'Eastern Forward Perimeter Hub',
    sector: 'Eastern Command (Siliguri / Tawang Frontier)',
    coordinates: [27.5861, 91.8594],
    elevationMeters: 3048,
    readinessStatus: 'DEFCON 2',
    radarSweepRadiusKm: 160,
    dopplerRpm: 10
  },
  {
    id: 'STN-CENTRAL-04',
    name: 'Central Strategic Air Defense Depot',
    sector: 'Central Command (National Capital / Gwalior)',
    coordinates: [28.6139, 77.2090],
    elevationMeters: 216,
    readinessStatus: 'ROUTINE',
    radarSweepRadiusKm: 250,
    dopplerRpm: 12
  },
  {
    id: 'STN-SOUTH-05',
    name: 'Southern Coastal Reconnaissance Base',
    sector: 'Southern Command (Kochi / Lakshadweep Sea)',
    coordinates: [9.9312, 76.2673],
    elevationMeters: 8,
    readinessStatus: 'ROUTINE',
    radarSweepRadiusKm: 200,
    dopplerRpm: 15
  }
];

// 2. Hardware Sensor Nodes across Sectors
export const SENSOR_NODES: TacticalSensorNode[] = [
  {
    id: 'CAM-NORTH-04',
    name: 'Perimeter Optical + Thermal Recon Turret',
    stationId: 'STN-NORTH-01',
    sensorType: 'cctv',
    coordinates: [34.1200, 74.7600],
    status: 'online',
    rangeKm: 8,
    fovBearingDeg: 315,
    fovSpreadDeg: 65,
    dataQuality: 98.8,
    lastPing: '2s ago'
  },
  {
    id: 'RAD-NORTH-02',
    name: 'Ground Doppler Pulse Radar GS-02',
    stationId: 'STN-NORTH-01',
    sensorType: 'radar',
    coordinates: [34.0837, 74.7973],
    status: 'online',
    rangeKm: 180,
    dataQuality: 99.4,
    lastPing: 'Live'
  },
  {
    id: 'CAM-WEST-01',
    name: 'Harbor Perimeter Optical Array',
    stationId: 'STN-WEST-02',
    sensorType: 'cctv',
    coordinates: [18.9400, 72.8200],
    status: 'online',
    rangeKm: 12,
    fovBearingDeg: 240,
    fovSpreadDeg: 75,
    dataQuality: 97.2,
    lastPing: '1s ago'
  },
  {
    id: 'RAD-WEST-01',
    name: 'Coastal Surface Search Radar CSR-01',
    stationId: 'STN-WEST-02',
    sensorType: 'radar',
    coordinates: [18.9220, 72.8347],
    status: 'online',
    rangeKm: 220,
    dataQuality: 99.1,
    lastPing: 'Live'
  },
  {
    id: 'ACS-EAST-01',
    name: 'Acoustic Seismic Tripwire Array #7',
    stationId: 'STN-EAST-03',
    sensorType: 'acoustic',
    coordinates: [27.6000, 91.8800],
    status: 'online',
    rangeKm: 5,
    dataQuality: 96.5,
    lastPing: '4s ago'
  },
  {
    id: 'THM-NORTH-03',
    name: 'High Altitude Long-Range FLIR Thermal Station',
    stationId: 'STN-NORTH-01',
    sensorType: 'thermal',
    coordinates: [34.2500, 74.9000],
    status: 'calibrating',
    rangeKm: 15,
    fovBearingDeg: 45,
    fovSpreadDeg: 50,
    dataQuality: 88.0,
    lastPing: '12s ago'
  }
];

// 3. Active 5-Level Threat Incidents on Map
export const ACTIVE_INCIDENTS: TacticalIncidentMarker[] = [
  {
    id: 'INC-2026-9041',
    threatLevel: 'L4',
    title: 'Unidentified Heavy Transport & Group Perimeter Breach',
    coordinates: [34.1450, 74.7300],
    confidence: 91.4,
    uncertaintyScore: 8.6,
    timestamp: '2m ago',
    sensorSources: ['CAM-NORTH-04', 'RAD-NORTH-02'],
    workflowStatus: 'HITL Review Pending'
  },
  {
    id: 'INC-2026-9039',
    threatLevel: 'L3',
    title: 'Unscheduled Naval Proximity Thermal Signature',
    coordinates: [18.8900, 72.7600],
    confidence: 84.2,
    uncertaintyScore: 15.8,
    timestamp: '14m ago',
    sensorSources: ['CAM-WEST-01', 'RAD-WEST-01'],
    workflowStatus: 'Awaiting Auth'
  },
  {
    id: 'INC-2026-9037',
    threatLevel: 'L2',
    title: 'Scheduled Convoy Checkpoint Verification',
    coordinates: [27.5200, 91.8100],
    confidence: 96.1,
    uncertaintyScore: 3.9,
    timestamp: '28m ago',
    sensorSources: ['ACS-EAST-01'],
    workflowStatus: 'AI-Led Dispatched'
  },
  {
    id: 'INC-2026-9032',
    threatLevel: 'L1',
    title: 'Routine Background Sensor Calibration Ping',
    coordinates: [28.5800, 77.2400],
    confidence: 98.5,
    uncertaintyScore: 1.5,
    timestamp: '41m ago',
    sensorSources: ['RAD-WEST-01'],
    workflowStatus: 'Routine Auto-Logged'
  },
  {
    id: 'INC-2026-9029',
    threatLevel: 'L5',
    title: 'High Security Strategic Vault Geofence Disruption',
    coordinates: [34.3100, 74.8200],
    confidence: 93.8,
    uncertaintyScore: 6.2,
    timestamp: '1h ago',
    sensorSources: ['CAM-NORTH-04', 'THM-NORTH-03', 'RAD-NORTH-02'],
    workflowStatus: 'Dual Sign-off Required'
  }
];

// 4. Strategic Geofence Polygons
export const GEOFENCES: TacticalGeofence[] = [
  {
    id: 'GEO-NORTH-ZONE-B',
    name: 'Northern Frontier Restricted Zone Beta',
    status: 'ARMED',
    severityOnBreach: 'L4',
    polygon: [
      [34.10, 74.65],
      [34.22, 74.72],
      [34.20, 74.85],
      [34.08, 74.80],
      [34.10, 74.65]
    ]
  },
  {
    id: 'GEO-WEST-NAVAL',
    name: 'Naval Port Outer Anchorage Geofence',
    status: 'ARMED',
    severityOnBreach: 'L3',
    polygon: [
      [18.98, 72.78],
      [18.98, 72.86],
      [18.88, 72.85],
      [18.88, 72.75],
      [18.98, 72.78]
    ]
  }
];

// 5. Official Survey of India High-Resolution Perimeter Polygon (Simplified GeoJSON ring)
// Encompasses Kashmir, Ladakh, Aksai Chin frontier, Arunachal, Kutch, Kanyakumari
export const INDIA_SOI_BOUNDARY_COORDS: [number, number][] = [
  // J&K / Ladakh Northernmost Line
  [37.08, 74.60], [36.90, 75.40], [36.20, 76.80], [35.50, 77.80], [35.10, 78.90],
  // Ladakh - Tibet Border
  [34.30, 79.20], [33.20, 79.00], [32.50, 78.50], [31.50, 78.80], [30.80, 79.90],
  // Uttarakhand / Nepal Line
  [30.20, 80.80], [28.90, 80.20], [28.40, 81.30], [27.50, 83.20], [26.90, 85.00],
  // Bihar / West Bengal / Sikkim
  [26.60, 88.10], [27.70, 88.20], [28.00, 88.80], [27.30, 88.90], [26.80, 89.80],
  // Assam / Arunachal Pradesh (Northernmost East)
  [27.80, 92.00], [28.40, 93.50], [28.80, 94.60], [29.20, 95.50], [28.50, 96.80], [28.00, 97.40],
  // Myanmar Eastern Border
  [27.00, 96.50], [25.50, 95.00], [24.00, 94.20], [22.80, 93.30], [21.80, 92.80],
  // Bangladesh / Bay of Bengal Coast
  [22.20, 91.80], [22.50, 89.00], [21.60, 87.50], [20.00, 86.00], [18.00, 83.80],
  [16.00, 81.00], [14.00, 80.20], [13.00, 80.30], [10.80, 79.80], [9.30, 79.20],
  // Southern Tip (Kanyakumari / Indian Ocean)
  [8.08, 77.55],
  // Arabian Sea Coast (Kerala / Karnataka / Goa / Maharashtra)
  [8.50, 76.90], [10.00, 76.20], [12.00, 75.10], [14.80, 74.10], [17.00, 73.30],
  [18.90, 72.80], [20.00, 72.70], [21.20, 72.50],
  // Gujarat / Kutch / Sir Creek
  [21.60, 69.50], [22.40, 69.00], [23.70, 68.20], [24.00, 68.80],
  // Rajasthan / Punjab / J&K Western Border
  [24.50, 70.80], [26.50, 70.30], [28.00, 71.50], [29.80, 73.80], [31.50, 74.80],
  [32.80, 74.90], [33.80, 74.20], [34.80, 74.10], [35.80, 74.50], [37.08, 74.60]
];

// 6. Realistic Air & Surface Defense Radar Tracks (Realistic Track Symbology with Speed/Heading Vectors)
export interface TacticalTrackPlot {
  id: string;
  callsign: string;
  type: 'air_military' | 'air_unknown' | 'air_hostile' | 'surface_naval' | 'air_aew';
  affiliation: 'friendly' | 'unknown' | 'hostile' | 'suspect';
  coordinates: [number, number]; // [lat, lng]
  headingDeg: number;
  speedKts: number;
  altitudeFt?: number;
  squawkCode: string;
  sourceRadarId: string;
  history: [number, number][]; // recent position breadcrumbs
}

export const LIVE_TRACK_PLOTS: TacticalTrackPlot[] = [
  {
    id: 'TRK-AF-302',
    callsign: 'TIGER-21 (IAF Su-30MKI CAP)',
    type: 'air_military',
    affiliation: 'friendly',
    coordinates: [34.2500, 75.1200],
    headingDeg: 140,
    speedKts: 460,
    altitudeFt: 28000,
    squawkCode: '4120',
    sourceRadarId: 'RAD-NORTH-02',
    history: [
      [34.3800, 74.9500],
      [34.3200, 75.0300],
      [34.2800, 75.0800]
    ]
  },
  {
    id: 'TRK-TG-804',
    callsign: 'UNIDENTIFIED LOW-RCS CONTACT',
    type: 'air_hostile',
    affiliation: 'hostile',
    coordinates: [34.1450, 74.7300],
    headingDeg: 215,
    speedKts: 185,
    altitudeFt: 1400,
    squawkCode: '0000',
    sourceRadarId: 'RAD-NORTH-02',
    history: [
      [34.2200, 74.7900],
      [34.1800, 74.7600],
      [34.1600, 74.7450]
    ]
  },
  {
    id: 'TRK-EW-101',
    callsign: 'NETRA-01 (IAF AEW&CS)',
    type: 'air_aew',
    affiliation: 'friendly',
    coordinates: [29.9500, 74.3000],
    headingDeg: 340,
    speedKts: 390,
    altitudeFt: 31000,
    squawkCode: '5201',
    sourceRadarId: 'RAD-NORTH-02',
    history: [
      [29.7000, 74.4000],
      [29.8200, 74.3500]
    ]
  },
  {
    id: 'TRK-NV-501',
    callsign: 'INS KOLKATA (D63)',
    type: 'surface_naval',
    affiliation: 'friendly',
    coordinates: [18.7800, 72.6200],
    headingDeg: 290,
    speedKts: 22,
    squawkCode: '3104',
    sourceRadarId: 'RAD-WEST-01',
    history: [
      [18.7200, 72.7400],
      [18.7500, 72.6800]
    ]
  },
  {
    id: 'TRK-UN-109',
    callsign: 'SKYSURFER-42 (NON-CORRELATED)',
    type: 'air_unknown',
    affiliation: 'unknown',
    coordinates: [18.9900, 72.5500],
    headingDeg: 165,
    speedKts: 230,
    altitudeFt: 4200,
    squawkCode: '7000',
    sourceRadarId: 'RAD-WEST-01',
    history: [
      [19.1000, 72.5200],
      [19.0400, 72.5350]
    ]
  }
];

// 7. Spatial Threat Density Heatmap Data Points (Weighted Kernel Clusters)
export interface HeatmapDataPoint {
  lat: number;
  lng: number;
  weight: number; // 0.1 to 1.0 (L1=0.2, L3=0.5, L4=0.85, L5=1.0)
  sector: string;
}

export const THREAT_HEATMAP_POINTS: HeatmapDataPoint[] = [
  // North Sector Heavy Cluster (J&K / Ladakh Frontier)
  { lat: 34.1450, lng: 74.7300, weight: 0.95, sector: 'Northern Frontier' },
  { lat: 34.1520, lng: 74.7210, weight: 0.90, sector: 'Northern Frontier' },
  { lat: 34.1380, lng: 74.7450, weight: 0.85, sector: 'Northern Frontier' },
  { lat: 34.1610, lng: 74.7100, weight: 0.80, sector: 'Northern Frontier' },
  { lat: 34.3100, lng: 74.8200, weight: 1.00, sector: 'Northern Frontier' },
  { lat: 34.2900, lng: 74.8050, weight: 0.88, sector: 'Northern Frontier' },
  { lat: 34.2200, lng: 74.7600, weight: 0.75, sector: 'Northern Frontier' },
  { lat: 34.1100, lng: 74.6800, weight: 0.70, sector: 'Northern Frontier' },
  { lat: 34.1800, lng: 74.7800, weight: 0.82, sector: 'Northern Frontier' },
  // Western Naval Anchorage Cluster
  { lat: 18.8900, lng: 72.7600, weight: 0.70, sector: 'Western Maritime' },
  { lat: 18.9100, lng: 72.7750, weight: 0.65, sector: 'Western Maritime' },
  { lat: 18.8700, lng: 72.7420, weight: 0.58, sector: 'Western Maritime' },
  { lat: 18.9300, lng: 72.7900, weight: 0.62, sector: 'Western Maritime' },
  // Eastern Line Tactical Corridor
  { lat: 27.5200, lng: 91.8100, weight: 0.55, sector: 'Eastern Forward' },
  { lat: 27.5600, lng: 91.8400, weight: 0.48, sector: 'Eastern Forward' },
  { lat: 27.6000, lng: 91.8800, weight: 0.42, sector: 'Eastern Forward' },
  // Central & Regional Points
  { lat: 28.5800, lng: 77.2400, weight: 0.25, sector: 'Central Strategic' },
  { lat: 28.6200, lng: 77.2100, weight: 0.20, sector: 'Central Strategic' },
  { lat: 9.9312, lng: 76.2673, weight: 0.15, sector: 'Southern Command' }
];

// Sector-by-Sector Threat Density Metrics
export const SECTOR_HEATMAP_STATS = [
  {
    sector: 'Northern Frontier (Sector 4)',
    densityScore: 84.6,
    status: 'CRITICAL HOTSPOT',
    color: '#ef4444',
    events24h: 18,
    l4l5Breaches: 4,
    peakHour: '02:45 IST',
    centroid: [34.145, 74.73]
  },
  {
    sector: 'Western Naval Corridor',
    densityScore: 42.1,
    status: 'ELEVATED ACTIVITY',
    color: '#f59e0b',
    events24h: 7,
    l4l5Breaches: 1,
    peakHour: '21:10 IST',
    centroid: [18.89, 72.76]
  },
  {
    sector: 'Eastern Tawang Frontier',
    densityScore: 28.4,
    status: 'GUARDED',
    color: '#10b981',
    events24h: 3,
    l4l5Breaches: 0,
    peakHour: '16:30 IST',
    centroid: [27.52, 91.81]
  },
  {
    sector: 'Central Strategic Air Depot',
    densityScore: 11.2,
    status: 'ROUTINE',
    color: '#64748b',
    events24h: 2,
    l4l5Breaches: 0,
    peakHour: '11:00 IST',
    centroid: [28.58, 77.24]
  }
];

// Sensor Coverage & Blind Spot Specs
export const SENSOR_COVERAGE_SPECS = {
  totalMonitoredAreaKm2: 184200,
  opticalCoverageKm2: 4820,
  radarVolumeKm3: 1250000,
  activeSensorNodes: 50,
  coverageEfficiencyPercent: 88.4,
  blindSpotRatioPercent: 11.6,
  blindSpots: [
    {
      id: 'BSP-NORTH-01',
      sector: 'North Sector 4 (Pir Panjal Ridge)',
      reason: 'Terrain masking below 1,200m elevation',
      severity: 'HIGH RISK',
      mitigation: 'UAV VisDrone Patrol dispatched'
    },
    {
      id: 'BSP-WEST-02',
      sector: 'Western Outer Anchorage',
      reason: 'Sea clutter & low-angle surface ducting',
      severity: 'MEDIUM',
      mitigation: 'CSR-01 Doppler filter active'
    },
    {
      id: 'BSP-EAST-03',
      sector: 'Eastern Ravine Pass',
      reason: 'Dense canopy optical obstruction',
      severity: 'GUARDED',
      mitigation: 'Acoustic Tripwire Array #7 deployed'
    }
  ]
};

