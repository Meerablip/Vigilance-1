import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    officer_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="operator") # administrator, supervisor, operator, analyst, auditor
    sector = Column(String, nullable=False, default="All Sectors")
    mfa_secret = Column(String, nullable=True) # Base32 secret for Google Authenticator
    is_mfa_enabled = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class InviteToken(Base):
    __tablename__ = "invite_tokens"

    id = Column(String, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    created_by_user_id = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    used_by_email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Location(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location_type = Column(String, default="Perimeter Outpost")
    region = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    status = Column(String, default="Active")
    notes = Column(Text, nullable=True)

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sensor_type = Column(String, nullable=False) # cctv, radar, thermal, acoustic
    location_id = Column(String, ForeignKey("locations.id"), nullable=True)
    status = Column(String, default="online") # online, degraded, offline, calibrating
    data_quality = Column(Float, default=98.5)
    last_heartbeat = Column(DateTime, default=datetime.datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    threat_level = Column(String, nullable=False) # L1, L2, L3, L4, L5
    confidence = Column(Float, nullable=False) # 0 - 100
    uncertainty_score = Column(Float, default=5.0)
    location_id = Column(String, ForeignKey("locations.id"), nullable=True)
    summary = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    sensors_contributing = Column(String, default="[]") # JSON list of sensor IDs
    workflow_status = Column(String, default="pending_authorization")
    authorization_status = Column(String, default="pending")
    communication_status = Column(String, default="queued")
    assigned_owner = Column(String, nullable=True)
    decision_reason = Column(Text, nullable=True)
    policy_version = Column(String, default="VIGILANCE-DEMO-2.4")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuthorizationRecord(Base):
    __tablename__ = "authorizations"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    required_role = Column(String, nullable=False)
    reviewer_id = Column(String, nullable=True)
    decision = Column(String, nullable=False) # approved, dismissed, escalated, info_requested
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ConnectedMessage(Base):
    __tablename__ = "connected_messages"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    destination_system = Column(String, nullable=False)
    payload = Column(Text, nullable=False)
    status = Column(String, default="queued") # queued, transmitted, acknowledged, failed
    ack_received_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_identity = Column(String, nullable=False)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    previous_hash = Column(String, nullable=True)
    entry_hash = Column(String, nullable=False)
