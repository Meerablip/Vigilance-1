import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db, SessionLocal
from app.models.entities import Location, Sensor, Incident, User, AuditLog
from app.api.auth import router as auth_router
from app.api.incidents import router as incidents_router
from app.api.authorization import router as auth_queue_router
from app.api.cv_detection import router as cv_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(incidents_router, prefix=settings.API_V1_STR)
app.include_router(auth_queue_router, prefix=settings.API_V1_STR)
app.include_router(cv_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VIGILANCE Defense Core API",
        "policy_version": settings.POLICY_VERSION,
        "database": "Neon PostgreSQL (Connected)",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

def seed_demo_data():
    db = SessionLocal()
    try:
        # 1. Seed Strategic Indian Locations if empty
        if db.query(Location).count() == 0:
            locations = [
                Location(id="LOC-NORTH-01", name="Northern Frontier Outpost Alpha", location_type="Perimeter Outpost", region="Northern Command", lat=34.0837, lng=74.7973, status="Armed"),
                Location(id="LOC-WEST-02", name="Western Maritime Corridor Naval Base", location_type="Naval Perimeter", region="Western Command", lat=18.9220, lng=72.8347, status="Armed"),
                Location(id="LOC-EAST-03", name="Eastern Line Tactical Forward Base", location_type="Forward Command", region="Eastern Command", lat=27.3314, lng=88.6138, status="Armed"),
                Location(id="LOC-CENTRAL-04", name="Central Strategic Defense Depot", location_type="Strategic Depot", region="Central Command", lat=28.6139, lng=77.2090, status="Armed")
            ]
            db.add_all(locations)
            db.commit()
            print("[SEED] Strategic Indian Defense locations populated in Neon DB.")

        # 2. Seed Surveillance Sensors
        if db.query(Sensor).count() == 0:
            sensors = [
                Sensor(id="CAM-NORTH-04", name="Perimeter Optical + Thermal Recon CAM-04", sensor_type="cctv", location_id="LOC-NORTH-01", status="online", data_quality=98.8),
                Sensor(id="RAD-NORTH-02", name="Ground Doppler Pulse Radar GS-02", sensor_type="radar", location_id="LOC-NORTH-01", status="online", data_quality=99.2),
                Sensor(id="CAM-WEST-01", name="Harbor Boundary CCTV Tower 1", sensor_type="cctv", location_id="LOC-WEST-02", status="online", data_quality=97.5),
                Sensor(id="RAD-WEST-01", name="Coastal Surface Radar System 1", sensor_type="radar", location_id="LOC-WEST-02", status="online", data_quality=99.0),
                Sensor(id="ACS-EAST-01", name="Acoustic Tripwire Array #7", sensor_type="acoustic", location_id="LOC-EAST-03", status="online", data_quality=96.0)
            ]
            db.add_all(sensors)
            db.commit()
            print("[SEED] Multi-sensor nodes populated in Neon DB.")

        # 3. Seed Initial Incidents representing L1-L5
        if db.query(Incident).count() == 0:
            incidents = [
                Incident(
                    id="INC-2026-9041",
                    threat_level="L4",
                    confidence=91.4,
                    uncertainty_score=8.6,
                    location_id="LOC-NORTH-01",
                    summary="Unidentified Heavy Vehicle & Multi-Person Movement Near Zone B",
                    description="Optical sensor CAM-NORTH-04 and Radar GS-RAD-02 detected correlated movements crossing perimeter Zone B. Requires Commander Authorization.",
                    sensors_contributing='["CAM-NORTH-04", "RAD-NORTH-02"]',
                    workflow_status="pending_authorization",
                    authorization_status="pending",
                    communication_status="queued",
                    decision_reason="Policy VIGILANCE-DEMO-2.4: L4 high severity breach alert held for Chief Commander sign-off."
                ),
                Incident(
                    id="INC-2026-9039",
                    threat_level="L3",
                    confidence=84.2,
                    uncertainty_score=15.8,
                    location_id="LOC-WEST-02",
                    summary="Perimeter Proximity Thermal Signature Spike",
                    description="Thermal anomaly detected outside standard patrol schedule.",
                    sensors_contributing='["CAM-WEST-01"]',
                    workflow_status="pending_authorization",
                    authorization_status="pending",
                    communication_status="queued",
                    decision_reason="Policy VIGILANCE-DEMO-2.4: L3 requires supervisory verification."
                ),
                Incident(
                    id="INC-2026-9037",
                    threat_level="L2",
                    confidence=96.1,
                    uncertainty_score=3.9,
                    location_id="LOC-EAST-03",
                    summary="Routine Transport Convoy Checkpoint Verification",
                    description="Scheduled military supply convoy cross-referenced with flight/transport manifests.",
                    sensors_contributing='["ACS-EAST-01"]',
                    workflow_status="automated_dispatched",
                    authorization_status="not_required",
                    communication_status="acknowledged",
                    decision_reason="Policy VIGILANCE-DEMO-2.4: L2 Guarded autonomously verified and communicated to Joint Ops."
                ),
                Incident(
                    id="INC-2026-9032",
                    threat_level="L1",
                    confidence=98.5,
                    uncertainty_score=1.5,
                    location_id="LOC-CENTRAL-04",
                    summary="Perimeter Sensor Telemetry Routine Sweep",
                    description="Normal background baseline reading.",
                    sensors_contributing='["RAD-WEST-01"]',
                    workflow_status="automated_dispatched",
                    authorization_status="not_required",
                    communication_status="acknowledged",
                    decision_reason="Policy VIGILANCE-DEMO-2.4: Routine L1 observation auto-archived."
                ),
                Incident(
                    id="INC-2026-9029",
                    threat_level="L5",
                    confidence=93.8,
                    uncertainty_score=6.2,
                    location_id="LOC-NORTH-01",
                    summary="High Security Vault Perimeter Geofence Disruption",
                    description="Multiple cross-sensor acoustic and optical tripwire disruptions. Highest severity alert.",
                    sensors_contributing='["CAM-NORTH-04", "RAD-NORTH-02"]',
                    workflow_status="pending_authorization",
                    authorization_status="pending",
                    communication_status="queued",
                    decision_reason="Policy VIGILANCE-DEMO-2.4: L5 Critical requires immediate dual-officer authorization."
                )
            ]
            db.add_all(incidents)
            db.commit()
            print("[SEED] 5-Level incident seed records populated in Neon DB.")

    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    print("[STARTUP] Initializing Neon Database Tables...")
    init_db()
    seed_demo_data()
    print("[STARTUP] VIGILANCE Defense Core API is ready and listening.")
