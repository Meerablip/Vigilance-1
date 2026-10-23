export type ThreatLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export type WorkflowStatus = 
  | 'automated_dispatched' 
  | 'pending_authorization' 
  | 'in_review' 
  | 'authorized_approved' 
  | 'authorized_dismissed' 
  | 'escalated' 
  | 'fallback_held';

export type AuthorizationStatus = 'not_required' | 'pending' | 'approved' | 'rejected' | 'escalated';

export type CommunicationStatus = 'queued' | 'transmitted' | 'acknowledged' | 'failed' | 'simulated';

export type UserRole = 'operator' | 'supervisor' | 'analyst' | 'administrator' | 'auditor';

export type WidgetCategory = 
  | 'situational_awareness' 
  | 'alerts_decisions' 
  | 'live_monitoring' 
  | 'data_fusion' 
  | 'analysis' 
  | 'operations';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  category: WidgetCategory;
  x: number; // grid units
  y: number; // grid units
  w: number; // grid units
  h: number; // grid units
  minW?: number;
  minH?: number;
  isMinimized?: boolean;
  isMaximized?: boolean;
  settings?: Record<string, any>;
}

export interface IncidentRecord {
  id: string;
  timestamp: string;
  threatLevel: ThreatLevel;
  confidence: number; // 0 - 100
  uncertaintyScore: number;
  locationName: string;
  coordinates: [number, number]; // [lat, lng]
  summary: string;
  description: string;
  sensorsContributing: string[];
  workflowStatus: WorkflowStatus;
  authorizationStatus: AuthorizationStatus;
  communicationStatus: CommunicationStatus;
  primaryClassDetected?: string;
  assignedOwner?: string;
  requiredRole?: string;
  decisionReason?: string;
}

export interface SensorRecord {
  id: string;
  name: string;
  type: 'cctv' | 'radar' | 'thermal' | 'acoustic' | 'drone' | 'rf';
  location: string;
  coordinates: [number, number];
  status: 'online' | 'degraded' | 'offline' | 'calibrating';
  dataQuality: number; // 0 - 100
  lastHeartbeat: string;
  streamUrl?: string;
  fovAngle?: number;
}

export type PageId =
  | 'workspace'
  | 'map'
  | 'locations'
  | 'sensors'
  | 'live_feeds'
  | 'alerts'
  | 'incident_details'
  | 'authorization_queue'
  | 'fusion'
  | 'playback'
  | 'patterns'
  | 'analytics'
  | 'reports'
  | 'models'
  | 'zones'
  | 'users'
  | 'audit_log'
  | 'system_health'
  | 'settings'
  | 'simulation'
  | 'shift_handoff'
  | 'decision_workflow'
  | 'connected_systems';
