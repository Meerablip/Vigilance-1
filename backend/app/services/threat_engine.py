import json
import uuid
import datetime
from sqlalchemy.orm import Session
from app.models.entities import Incident, AuthorizationRecord, ConnectedMessage, AuditLog

class ThreatPolicyEngine:
    POLICY_VERSION = "VIGILANCE-DEMO-2.4"
    CONFIDENCE_FALLBACK_THRESHOLD = 75.0

    @classmethod
    def evaluate_and_route(
        cls,
        db: Session,
        threat_level: str,
        confidence: float,
        location_id: str,
        summary: str,
        description: str,
        sensors_contributing: list,
        sensor_disagreement: bool = False
    ) -> Incident:
        incident_id = f"INC-2026-{uuid.uuid4().hex[:6].upper()}"
        now = datetime.datetime.utcnow()

        # Step 1: Check Uncertainty & Fallback Triggers
        is_uncertain = confidence < cls.CONFIDENCE_FALLBACK_THRESHOLD or sensor_disagreement
        uncertainty_score = round(100.0 - confidence, 1)

        # Step 2: Determine Workflow & Routing Path
        if is_uncertain:
            # Fallback policy: low confidence or sensor conflict overrides automation
            workflow_status = "fallback_held"
            authorization_status = "pending"
            comm_status = "queued"
            decision_reason = f"FALLBACK TRIGGERED: Confidence ({confidence}%) is below 75% or sensors conflict. Automated dispatch held for review."
            required_role = "supervisor"
        elif threat_level in ["L1", "L2"]:
            # Path A: Automated AI-led workflow
            workflow_status = "automated_dispatched"
            authorization_status = "not_required"
            comm_status = "transmitted"
            decision_reason = f"Policy {cls.POLICY_VERSION}: Level {threat_level} auto-dispatched within predefined defense telemetry bounds."
            required_role = None
        else:
            # Path B: Human-in-the-Loop review queue for L3, L4, L5
            workflow_status = "pending_authorization"
            authorization_status = "pending"
            comm_status = "queued"
            decision_reason = f"Policy {cls.POLICY_VERSION}: High consequence level {threat_level} requires verified commander sign-off."
            required_role = "administrator" if threat_level == "L5" else "supervisor"

        # Step 3: Create Incident Record
        incident = Incident(
            id=incident_id,
            timestamp=now,
            threat_level=threat_level,
            confidence=confidence,
            uncertainty_score=uncertainty_score,
            location_id=location_id,
            summary=summary,
            description=description,
            sensors_contributing=json.dumps(sensors_contributing),
            workflow_status=workflow_status,
            authorization_status=authorization_status,
            communication_status=comm_status,
            decision_reason=decision_reason,
            policy_version=cls.POLICY_VERSION,
            created_at=now
        )
        db.add(incident)

        # Step 4: If L1/L2 auto-dispatched, create simulated connected defense network message
        if workflow_status == "automated_dispatched":
            msg = ConnectedMessage(
                id=f"MSG-{uuid.uuid4().hex[:8].upper()}",
                incident_id=incident_id,
                destination_system="Regional Defense QRF Ingest",
                payload=json.dumps({
                    "incident_id": incident_id,
                    "threat_level": threat_level,
                    "summary": summary,
                    "timestamp": now.isoformat(),
                    "dispatched_by": "VIGILANCE Autonomous Policy Engine"
                }),
                status="acknowledged", # Simulated real-time defense handshake
                ack_received_at=now,
                created_at=now
            )
            db.add(msg)
            incident.communication_status = "acknowledged"

        # Step 5: If HITL required, create Authorization Record in queue
        if authorization_status == "pending":
            auth_rec = AuthorizationRecord(
                id=f"AUTH-{uuid.uuid4().hex[:8].upper()}",
                incident_id=incident_id,
                required_role=required_role,
                decision="pending",
                reason="Awaiting supervisory decision review and reason justification",
                created_at=now
            )
            db.add(auth_rec)

        # Step 6: Log in immutable audit log
        audit = AuditLog(
            id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            timestamp=now,
            user_identity="SYSTEM_AI_ENGINE",
            action="INCIDENT_CLASSIFIED_AND_ROUTED",
            resource_type="Incident",
            resource_id=incident_id,
            details=f"Classified {threat_level} with {confidence}% confidence. Workflow: {workflow_status}.",
            previous_hash="GENESIS_OR_CHAIN",
            entry_hash=uuid.uuid4().hex
        )
        db.add(audit)

        db.commit()
        db.refresh(incident)
        return incident
