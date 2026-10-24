import uuid
import datetime
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import ConnectedMessage, Incident, AuditLog

router = APIRouter(prefix="/connected-systems", tags=["Connected Military Systems & Dispatch"])

class PingRequest(BaseModel):
    destination_system: str

class ManualDispatchRequest(BaseModel):
    incident_id: str
    destination_system: str
    payload_summary: str
    dispatched_by: str = "Meera@defence.com"

@router.get("/status")
def get_connected_systems_status():
    """
    Returns live connectivity status, latency, and encryption protocol for mock defense networks.
    """
    return [
        {
            "id": "SYS-NET-01",
            "name": "Regional Defense HQ (Joint Ops Sector North)",
            "type": "C2 Command Net",
            "protocol": "Link-16 Tactical Data Exchange",
            "status": "ONLINE",
            "latency_ms": 28.4,
            "packets_transmitted": 1420,
            "packet_delivery_rate": "99.98%",
            "security": "Type-1 High Grade Crypto"
        },
        {
            "id": "SYS-NET-02",
            "name": "Air Defense & Radar Ground Network (AD-Net)",
            "type": "Early Warning Telemetry",
            "protocol": "ASTERIX Cat-048 / 034 Sensor Bus",
            "status": "ONLINE",
            "latency_ms": 19.8,
            "packets_transmitted": 3890,
            "packet_delivery_rate": "100.00%",
            "security": "AES-256-GCM Encrypted"
        },
        {
            "id": "SYS-NET-03",
            "name": "Quick Reaction Force (QRF Tactical Radio Mesh)",
            "type": "Mobile Response Dispatch",
            "protocol": "SINCGARS Frequency Hopping / IP Mesh",
            "status": "ONLINE",
            "latency_ms": 42.1,
            "packets_transmitted": 842,
            "packet_delivery_rate": "99.85%",
            "security": "Frequency Agile Tactical Net"
        },
        {
            "id": "SYS-NET-04",
            "name": "Naval Coastal Defense Corridor Node",
            "type": "Maritime Surveillance Ingest",
            "protocol": "Over-The-Horizon Radar & AIS Stream",
            "status": "ONLINE",
            "latency_ms": 31.6,
            "packets_transmitted": 2105,
            "packet_delivery_rate": "99.94%",
            "security": "Defense Secure Fiber"
        }
    ]

@router.get("/messages")
def get_message_ledger(db: Session = Depends(get_db)):
    """
    Returns chronological message packet receipts dispatched across connected networks.
    """
    messages = db.query(ConnectedMessage).order_by(ConnectedMessage.created_at.desc()).limit(50).all()
    output = []
    for msg in messages:
        payload_data = {}
        try:
            payload_data = json.loads(msg.payload)
        except:
            payload_data = {"raw": msg.payload}

        output.append({
            "id": msg.id,
            "incident_id": msg.incident_id,
            "destination_system": msg.destination_system,
            "status": msg.status,
            "payload": payload_data,
            "created_at": msg.created_at.isoformat(),
            "ack_received_at": msg.ack_received_at.isoformat() if msg.ack_received_at else None,
            "round_trip_ms": 142.5
        })
    return output

@router.post("/ping")
def ping_system(req: PingRequest):
    """
    Simulates round-trip packet handshake to mock defense network.
    """
    return {
        "destination_system": req.destination_system,
        "status": "ACKNOWLEDGED",
        "latency_ms": 24.8,
        "handshake_hash": uuid.uuid4().hex[:16],
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@router.post("/dispatch")
def manual_dispatch(req: ManualDispatchRequest, db: Session = Depends(get_db)):
    """
    Dispatches military instruction payload to connected network.
    """
    now = datetime.datetime.utcnow()
    msg_id = f"MSG-{uuid.uuid4().hex[:8].upper()}"

    payload = json.dumps({
        "incident_id": req.incident_id,
        "dispatched_by": req.dispatched_by,
        "summary": req.payload_summary,
        "protocol": "NATO-STANAG-5516 / Link-16",
        "timestamp": now.isoformat()
    })

    new_msg = ConnectedMessage(
        id=msg_id,
        incident_id=req.incident_id,
        destination_system=req.destination_system,
        payload=payload,
        status="acknowledged",
        ack_received_at=now + datetime.timedelta(milliseconds=142),
        created_at=now
    )
    db.add(new_msg)

    # Log in audit
    audit = AuditLog(
        id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
        user_identity=req.dispatched_by,
        action="CONNECTED_SYSTEM_DISPATCH_TRANSMITTED",
        resource_type="ConnectedMessage",
        resource_id=msg_id,
        details=f"Dispatched message {msg_id} to {req.destination_system} for Incident {req.incident_id}.",
        entry_hash=uuid.uuid4().hex
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message_id": msg_id,
        "destination_system": req.destination_system,
        "status": "acknowledged",
        "ack_received_at": new_msg.ack_received_at.isoformat(),
        "round_trip_latency_ms": 142.0
    }
