import datetime
import uuid
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.visdrone_detector import visdrone_service
from app.services.threat_engine import ThreatPolicyEngine

router = APIRouter(prefix="/cv", tags=["Computer Vision & Drone Detection"])

class DetectRequest(BaseModel):
    feed_id: str
    tripwire_armed: bool = True

class TriggerIncidentRequest(BaseModel):
    feed_id: str
    threat_level: str
    detection_summary: str
    officer_email: Optional[str] = "Meera@defence.com"

@router.get("/status")
def get_cv_status():
    """
    Returns live operational status and Hugging Face model architecture information.
    """
    return visdrone_service.get_model_info()

@router.get("/feeds")
def get_tactical_feeds():
    """
    Returns available optical, UAV, and thermal video feeds.
    """
    return [
        {
            "id": "CAM-NORTH-04",
            "name": "Perimeter Optical Checkpoint Alpha",
            "type": "Optical 4K PTZ",
            "location": "LOC-NORTH-01 (Northern Command)",
            "lat": 34.0837,
            "lng": 74.7973,
            "resolution": "3840x2160 @ 60 FPS",
            "fov_deg": 90,
            "zoom": "24x Optical",
            "thermal_capable": True,
            "tripwire_armed": True,
            "status": "STREAMING",
            "model_assigned": "keremberke/yolov8n-visdrone"
        },
        {
            "id": "UAV-FALCON-02",
            "name": "UAV Falcon-02 Aerial Recon",
            "type": "Autonomous Drone EO/IR Gimbal",
            "location": "LOC-NORTH-01 (Patrol Vector Bravo)",
            "lat": 34.0920,
            "lng": 74.8100,
            "resolution": "1920x1080 @ 60 FPS",
            "fov_deg": 120,
            "altitude_m": 420,
            "battery_pct": 84,
            "thermal_capable": True,
            "tripwire_armed": True,
            "status": "STREAMING",
            "model_assigned": "keremberke/yolov8n-visdrone"
        },
        {
            "id": "THM-NORTH-03",
            "name": "Long-Range FLIR Thermal Sentry",
            "type": "Cooled InSb MWIR Thermal Camera",
            "location": "LOC-NORTH-01 (Ridge Sentry)",
            "lat": 34.0750,
            "lng": 74.7890,
            "resolution": "1280x1024 @ 60 FPS",
            "fov_deg": 45,
            "spectral_band": "3.0 - 5.0 um",
            "thermal_capable": True,
            "tripwire_armed": True,
            "status": "STREAMING",
            "model_assigned": "keremberke/yolov8n-visdrone"
        },
        {
            "id": "CAM-WEST-01",
            "name": "Naval Harbor Barrier Surveillance",
            "type": "Maritime Long-Range Optical",
            "location": "LOC-WEST-02 (Western Naval Command)",
            "lat": 18.9220,
            "lng": 72.8347,
            "resolution": "3840x2160 @ 30 FPS",
            "fov_deg": 75,
            "zoom": "36x Optical",
            "thermal_capable": False,
            "tripwire_armed": False,
            "status": "STREAMING",
            "model_assigned": "keremberke/yolov8n-visdrone"
        }
    ]

@router.post("/detect")
def run_detection(req: DetectRequest):
    """
    Runs Hugging Face VisDrone YOLO object detection on the specified video stream.
    """
    result = visdrone_service.detect_feed_objects(feed_id=req.feed_id, tripwire_armed=req.tripwire_armed)
    return result

@router.post("/trigger-incident")
def trigger_incident_from_cv(req: TriggerIncidentRequest, db: Session = Depends(get_db)):
    """
    Converts a real-time computer vision breach detection into a VIGILANCE incident,
    routing through the 5-Tier Threat Policy Engine.
    """
    incident = ThreatPolicyEngine.evaluate_and_route(
        db=db,
        threat_level=req.threat_level,
        confidence=94.2,
        location_id="LOC-NORTH-01",
        summary=f"Automated VisDrone Detection: {req.detection_summary}",
        description=f"Hugging Face keremberke/yolov8n-visdrone detected restricted movement on feed {req.feed_id}. Optical bounding boxes confirmed breach.",
        sensors_contributing=[req.feed_id]
    )

    return {
        "success": True,
        "incident_id": incident.id,
        "threat_level": incident.threat_level,
        "workflow_status": incident.workflow_status,
        "authorization_status": incident.authorization_status,
        "message": f"Incident {incident.id} generated and routed into {incident.workflow_status} queue."
    }
