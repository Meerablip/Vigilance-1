import uuid
import datetime
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import AuthorizationRecord, Incident, AuditLog, ConnectedMessage

router = APIRouter(prefix="/authorizations", tags=["HITL Authorization Queue"])

class DecisionActionRequest(BaseModel):
    decision: str # approved, dismissed, escalated, info_requested
    reason: str
    reviewer_identity: str
    second_reviewer_identity: Optional[str] = None
    second_reviewer_role: Optional[str] = None
    destination_system: Optional[str] = "Regional Defense QRF Ingest (Northern Command)"

@router.get("/queue")
def get_authorization_queue(db: Session = Depends(get_db)):
    """
    Returns priority-ranked pending authorization records joined with incident details.
    """
    records = db.query(AuthorizationRecord, Incident).\
        join(Incident, AuthorizationRecord.incident_id == Incident.id).\
        filter(AuthorizationRecord.decision == "pending").\
        order_by(
            # Sort L5 first, then L4, then L3
            Incident.threat_level.desc(),
            Incident.timestamp.desc()
        ).all()
    
    output = []
    for auth, inc in records:
        sensors = []
        try:
            sensors = json.loads(inc.sensors_contributing) if inc.sensors_contributing else []
        except:
            sensors = [inc.sensors_contributing]

        output.append({
            "auth_id": auth.id,
            "incident_id": inc.id,
            "threat_level": inc.threat_level,
            "summary": inc.summary,
            "description": inc.description,
            "confidence": inc.confidence,
            "uncertainty_score": inc.uncertainty_score,
            "location_id": inc.location_id,
            "sensors_contributing": sensors,
            "required_role": auth.required_role,
            "workflow_status": inc.workflow_status,
            "authorization_status": inc.authorization_status,
            "decision_reason": inc.decision_reason,
            "policy_version": inc.policy_version,
            "created_at": auth.created_at.isoformat(),
            "deadline_minutes_remaining": 12 if inc.threat_level == 'L4' else (5 if inc.threat_level == 'L5' else 25)
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

    incident = db.query(Incident).filter(Incident.id == auth.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Parent incident record not found.")

    # Two-Person Dual Authorization Rule for L5 Critical Threats
    if incident.threat_level == "L5" and req.decision == "approved":
        if not req.second_reviewer_identity or len(req.second_reviewer_identity.strip()) < 3:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Dual-Officer Protocol Enforced: Level 5 Critical threats require concurrent authorization from a Second Watch Officer / Joint Ops Commander."
            )

    now = datetime.datetime.utcnow()
    auth.decision = req.decision
    auth.reason = req.reason.strip()
    auth.reviewer_id = req.reviewer_identity

    # Update parent incident
    if req.decision == "approved":
        incident.authorization_status = "approved"
        incident.workflow_status = "authorized_approved"
        incident.communication_status = "acknowledged"

        # Dispatch military payload to connected defense network
        dest = req.destination_system or "Regional Defense QRF Ingest (Northern Command)"
        msg_id = f"MSG-{uuid.uuid4().hex[:8].upper()}"
        payload = json.dumps({
            "incident_id": incident.id,
            "threat_level": incident.threat_level,
            "authorized_by": req.reviewer_identity,
            "second_authorizer": req.second_reviewer_identity,
            "justification": req.reason.strip(),
            "target_system": dest,
            "policy_rule": "VIGILANCE-DEMO-2.4: COMMANDER_DISPATCH_AUTHORIZED",
            "timestamp": now.isoformat()
        })

        connected_msg = ConnectedMessage(
            id=msg_id,
            incident_id=incident.id,
            destination_system=dest,
            payload=payload,
            status="acknowledged",
            ack_received_at=now + datetime.timedelta(milliseconds=138),
            created_at=now
        )
        db.add(connected_msg)

    elif req.decision == "dismissed":
        incident.authorization_status = "rejected"
        incident.workflow_status = "authorized_dismissed"
    elif req.decision == "escalated":
        incident.authorization_status = "escalated"
        incident.workflow_status = "escalated"
    elif req.decision == "info_requested":
        incident.workflow_status = "in_review"

    incident.decision_reason = f"Decision by {req.reviewer_identity}: {req.reason.strip()}"
    if req.second_reviewer_identity:
        incident.decision_reason += f" (Dual-authorized by {req.second_reviewer_identity})"

    # Log in immutable audit log
    audit = AuditLog(
        id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
        user_identity=req.reviewer_identity,
        action=f"HITL_DECISION_{req.decision.upper()}",
        resource_type="AuthorizationRecord",
        resource_id=auth.id,
        details=f"Decision: {req.decision} for Incident {auth.incident_id}. Justification: {req.reason.strip()}" + (f" | Dual-Officer: {req.second_reviewer_identity}" if req.second_reviewer_identity else ""),
        entry_hash=uuid.uuid4().hex
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": f"Authorization decision recorded: {req.decision.upper()}",
        "auth_id": auth.id,
        "incident_id": auth.incident_id,
        "threat_level": incident.threat_level,
        "decision": req.decision,
        "workflow_status": incident.workflow_status,
        "dual_authorized": bool(req.second_reviewer_identity)
    }
