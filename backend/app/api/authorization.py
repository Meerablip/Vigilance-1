import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import AuthorizationRecord, Incident, AuditLog

router = APIRouter(prefix="/authorizations", tags=["HITL Authorization Queue"])

class DecisionActionRequest(BaseModel):
    decision: str # approved, dismissed, escalated, info_requested
    reason: str
    reviewer_identity: str

@router.get("/queue")
def get_authorization_queue(db: Session = Depends(get_db)):
    # Join with Incident details
    records = db.query(AuthorizationRecord, Incident).\
        join(Incident, AuthorizationRecord.incident_id == Incident.id).\
        filter(AuthorizationRecord.decision == "pending").\
        order_by(Incident.timestamp.desc()).all()
    
    output = []
    for auth, inc in records:
        output.append({
            "auth_id": auth.id,
            "incident_id": inc.id,
            "threat_level": inc.threat_level,
            "summary": inc.summary,
            "confidence": inc.confidence,
            "uncertainty_score": inc.uncertainty_score,
            "required_role": auth.required_role,
            "workflow_status": inc.workflow_status,
            "created_at": auth.created_at.isoformat()
        })
    return output

@router.post("/{auth_id}/decide")
def submit_authorization_decision(auth_id: str, req: DecisionActionRequest, db: Session = Depends(get_db)):
    auth = db.query(AuthorizationRecord).filter(AuthorizationRecord.id == auth_id).first()
    if not auth:
        raise HTTPException(status_code=404, detail="Authorization request not found.")

    if not req.reason or len(req.reason.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mandatory justification required: You must record a reasoned explanation for your decision."
        )

    auth.decision = req.decision
    auth.reason = req.reason.strip()
    auth.reviewer_id = req.reviewer_identity

    # Update parent incident
    incident = db.query(Incident).filter(Incident.id == auth.incident_id).first()
    if incident:
        if req.decision == "approved":
            incident.authorization_status = "approved"
            incident.workflow_status = "authorized_approved"
            incident.communication_status = "transmitted"
        elif req.decision == "dismissed":
            incident.authorization_status = "rejected"
            incident.workflow_status = "authorized_dismissed"
        elif req.decision == "escalated":
            incident.authorization_status = "escalated"
            incident.workflow_status = "escalated"

        incident.decision_reason = f"Decision by {req.reviewer_identity}: {req.reason.strip()}"

    # Log in immutable audit log
    audit = AuditLog(
        id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
        user_identity=req.reviewer_identity,
        action=f"HITL_DECISION_{req.decision.upper()}",
        resource_type="AuthorizationRecord",
        resource_id=auth.id,
        details=f"Decision: {req.decision} for Incident {auth.incident_id}. Justification: {req.reason.strip()}",
        entry_hash=uuid.uuid4().hex
    )
    db.add(audit)
    db.commit()

    return {
        "message": f"Authorization decision recorded: {req.decision.upper()}",
        "auth_id": auth.id,
        "incident_id": auth.incident_id,
        "decision": req.decision
    }
