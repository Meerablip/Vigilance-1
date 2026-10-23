from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import Incident
from app.services.threat_engine import ThreatPolicyEngine

router = APIRouter(prefix="/incidents", tags=["Threat Incidents"])

class EvaluateThreatRequest(BaseModel):
    threat_level: str # L1, L2, L3, L4, L5
    confidence: float
    location_id: str
    summary: str
    description: str
    sensors_contributing: List[str]
    sensor_disagreement: bool = False

@router.get("/")
def list_incidents(
    threat_level: Optional[str] = None,
    workflow_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if threat_level:
        query = query.filter(Incident.threat_level == threat_level)
    if workflow_status:
        query = query.filter(Incident.workflow_status == workflow_status)
    return query.order_by(Incident.timestamp.desc()).all()

@router.get("/{incident_id}")
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident record not found.")
    return incident

@router.post("/evaluate")
def evaluate_and_create_incident(req: EvaluateThreatRequest, db: Session = Depends(get_db)):
    incident = ThreatPolicyEngine.evaluate_and_route(
        db=db,
        threat_level=req.threat_level,
        confidence=req.confidence,
        location_id=req.location_id,
        summary=req.summary,
        description=req.description,
        sensors_contributing=req.sensors_contributing,
        sensor_disagreement=req.sensor_disagreement
    )
    return {
        "message": "Observation processed by 5-Level Threat Engine",
        "incident": incident
    }
