"""
RECY-LINK FastAPI Backend
Architecture: FastAPI → Firebase (mock) → Blockchain (mock)
Structure allows easy swap of mock services with production services.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone
import uuid
import hashlib
import json
import random
import time
import os

app = FastAPI(
    title="RECY-LINK API",
    description="Digital Recycling Infrastructure — Material Traceability Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-Memory Store (replace with Firebase in production) ──────────────────
_users: dict = {}
_passports: dict = {}
_collection_requests: dict = {}
_pop_records: dict = {}
_blockchain_events: list = []

# ─── Models ─────────────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    user_id: str
    name: str
    role: Literal["household", "company", "collector", "recycler"]
    location: Optional[str] = None
    area: Optional[str] = None

class WasteAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    user_id: str

class WasteAnalysisResult(BaseModel):
    analysis_id: str
    material: str
    category: str
    condition: str
    contamination: str
    estimated_weight_grams: float
    recommended_pathway: Literal["REUSE", "REFURBISH", "MATERIAL RECOVERY", "RECYCLE", "SPECIALIZED HANDLING"]
    pathway_options: List[str]
    confidence: int
    is_ewaste: bool
    ewaste_details: Optional[dict] = None
    timestamp: str

class CollectionRequestCreate(BaseModel):
    passport_id: str
    user_id: str
    collector_id: str
    location: str
    notes: Optional[str] = None

class MaterialEvent(BaseModel):
    passport_id: str
    event_type: Literal[
        "material_created", "collection_requested", "collected",
        "sorted", "transferred", "received", "processed"
    ]
    actor_id: str
    location: Optional[str] = None
    weight_grams: Optional[float] = None
    notes: Optional[str] = None

class POPCreditRequest(BaseModel):
    user_id: str
    amount: int
    reason: str
    passport_id: Optional[str] = None

# ─── Mock AI Analysis Service ───────────────────────────────────────────────

MATERIAL_PROFILES = [
    {
        "material": "PET Plastic",
        "category": "Plastic",
        "condition": "Good",
        "contamination": "Low",
        "estimated_weight_grams": 42.8,
        "recommended_pathway": "RECYCLE",
        "pathway_options": ["RECYCLE", "REUSE", "MATERIAL RECOVERY"],
        "confidence": 94,
        "is_ewaste": False,
    },
    {
        "material": "HDPE Plastic",
        "category": "Plastic",
        "condition": "Good",
        "contamination": "Low",
        "estimated_weight_grams": 68.2,
        "recommended_pathway": "RECYCLE",
        "pathway_options": ["RECYCLE", "MATERIAL RECOVERY"],
        "confidence": 89,
        "is_ewaste": False,
    },
    {
        "material": "Paper/Cardboard",
        "category": "Paper",
        "condition": "Fair",
        "contamination": "Medium",
        "estimated_weight_grams": 280.0,
        "recommended_pathway": "RECYCLE",
        "pathway_options": ["RECYCLE", "MATERIAL RECOVERY"],
        "confidence": 91,
        "is_ewaste": False,
    },
    {
        "material": "Laptop Computer",
        "category": "Electronics",
        "condition": "Non-Functional",
        "contamination": "Low",
        "estimated_weight_grams": 1800.0,
        "recommended_pathway": "SPECIALIZED HANDLING",
        "pathway_options": ["REFURBISH", "MATERIAL RECOVERY", "SPECIALIZED HANDLING"],
        "confidence": 97,
        "is_ewaste": True,
        "ewaste_details": {
            "device": "Laptop Computer",
            "battery": "Li-ion (present, intact)",
            "hazardous_components": "Battery, solder, display backlighting",
            "recoverable_components": "RAM, SSD, aluminum chassis",
            "recommendation": "Route to PCB-authorized e-waste recycler",
        },
    },
    {
        "material": "Glass Bottle",
        "category": "Glass",
        "condition": "Good",
        "contamination": "None",
        "estimated_weight_grams": 320.0,
        "recommended_pathway": "REUSE",
        "pathway_options": ["REUSE", "RECYCLE", "MATERIAL RECOVERY"],
        "confidence": 96,
        "is_ewaste": False,
    },
]

def mock_analyze_waste(image_data: Optional[str] = None) -> dict:
    """
    Mock CV analysis service.
    Replace this function with a real computer vision model call.
    Interface: (image_base64: str) -> dict matching WasteAnalysisResult schema
    """
    # In production: call a real CV model API here
    # e.g., Google Vision API, custom TensorFlow model, etc.
    profile = random.choice(MATERIAL_PROFILES)
    return {
        "analysis_id": f"AN-{uuid.uuid4().hex[:8].upper()}",
        **profile,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

# ─── Mock Blockchain Service ────────────────────────────────────────────────

def mock_record_blockchain_event(event_data: dict) -> str:
    """
    Mock blockchain recording service.
    Replace with real Web3.py / Polygon contract call in production.
    
    In production:
        from web3 import Web3
        w3 = Web3(Web3.HTTPProvider(POLYGON_RPC_URL))
        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)
        tx_hash = contract.functions.recordMaterialEvent(
            event_data['passport_id'],
            event_data['event_type'],
            event_data['actor_id'],
            int(time.time())
        ).transact({'from': OPERATOR_WALLET})
        return tx_hash.hex()
    """
    # Only record non-PII event data on blockchain
    safe_data = {
        "passport_id": event_data.get("passport_id"),
        "event_type": event_data.get("event_type"),
        "actor_id": event_data.get("actor_id"),
        "timestamp": int(time.time()),
    }
    data_hash = hashlib.sha256(json.dumps(safe_data, sort_keys=True).encode()).hexdigest()
    # Simulated Polygon transaction hash
    tx_hash = "0x" + hashlib.sha256((data_hash + str(time.time())).encode()).hexdigest()
    
    blockchain_event = {
        "tx_hash": tx_hash,
        "event": safe_data,
        "block": random.randint(45000000, 46000000),
        "network": "Polygon",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    _blockchain_events.append(blockchain_event)
    return tx_hash

# ─── Routes ─────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "service": "RECY-LINK API",
        "version": "1.0.0",
        "status": "operational",
        "tagline": "Giving every waste worker an identity and every recyclable material a traceable journey.",
        "endpoints": [
            "POST /auth/profile",
            "POST /waste/analyze",
            "POST /waste/request-collection",
            "POST /material/create",
            "GET /material/{id}",
            "POST /material/{id}/handover",
            "POST /material/{id}/sort",
            "POST /material/{id}/receive",
            "POST /material/{id}/process",
            "GET /material/{id}/journey",
            "GET /collectors/nearby",
            "POST /pop/credit",
            "GET /pop/history",
            "POST /blockchain/record-event",
            "GET /blockchain/status",
        ]
    }

@app.post("/auth/profile")
def create_profile(profile: UserProfile):
    """Register or update a user profile."""
    _users[profile.user_id] = profile.dict()
    return {"status": "success", "user_id": profile.user_id, "role": profile.role}

@app.post("/waste/analyze")
async def analyze_waste(request: WasteAnalysisRequest):
    """
    AI waste analysis endpoint.
    Currently uses a mock service. Replace mock_analyze_waste() with real CV model.
    """
    # Simulate AI processing time
    analysis = mock_analyze_waste(request.image_base64)
    
    # Store analysis result (would go to Firebase in production)
    analysis["user_id"] = request.user_id
    
    return WasteAnalysisResult(**analysis)

@app.post("/waste/request-collection")
def request_collection(request: CollectionRequestCreate):
    """Create a collection request and assign a collector."""
    request_id = f"CR-{uuid.uuid4().hex[:8].upper()}"
    
    collection_request = {
        "id": request_id,
        "passport_id": request.passport_id,
        "user_id": request.user_id,
        "collector_id": request.collector_id,
        "location": request.location,
        "notes": request.notes,
        "status": "assigned",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _collection_requests[request_id] = collection_request
    
    # Record blockchain event for collection request
    tx = mock_record_blockchain_event({
        "passport_id": request.passport_id,
        "event_type": "collection_requested",
        "actor_id": request.user_id,
    })
    
    return {
        "status": "success",
        "request_id": request_id,
        "collector_id": request.collector_id,
        "blockchain_tx": tx,
    }

@app.post("/material/create")
def create_material(event: MaterialEvent):
    """Create a new Material Passport."""
    passport_id = f"MP-{random.randint(10000, 99999)}"
    
    passport = {
        "id": passport_id,
        "source_id": event.actor_id,
        "collector_id": None,
        "recycler_id": None,
        "status": "identified",
        "weight_grams": event.weight_grams,
        "location": event.location,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "timeline": [],
    }
    _passports[passport_id] = passport
    
    # Anchor on blockchain
    tx = mock_record_blockchain_event({
        "passport_id": passport_id,
        "event_type": "material_created",
        "actor_id": event.actor_id,
    })
    
    passport["timeline"].append({
        "step": "identified",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor_id": event.actor_id,
        "location": event.location,
        "blockchain_tx": tx,
    })
    
    return {"status": "success", "passport_id": passport_id, "blockchain_tx": tx}

@app.get("/material/{passport_id}")
def get_material(passport_id: str):
    """Get Material Passport details."""
    if passport_id not in _passports:
        raise HTTPException(status_code=404, detail=f"Passport {passport_id} not found")
    return _passports[passport_id]

@app.post("/material/{passport_id}/handover")
def record_handover(passport_id: str, event: MaterialEvent):
    """Record collector → recycler handover."""
    if passport_id not in _passports:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = _passports[passport_id]
    passport["status"] = "collected"
    passport["collector_id"] = event.actor_id
    if event.weight_grams:
        passport["weight_grams"] = event.weight_grams
    
    tx = mock_record_blockchain_event({
        "passport_id": passport_id,
        "event_type": "collected",
        "actor_id": event.actor_id,
    })
    
    passport["timeline"].append({
        "step": "collected",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor_id": event.actor_id,
        "location": event.location,
        "weight_grams": event.weight_grams,
        "blockchain_tx": tx,
    })
    
    return {"status": "success", "new_status": "collected", "blockchain_tx": tx}

@app.post("/material/{passport_id}/sort")
def confirm_sorting(passport_id: str, event: MaterialEvent):
    """Confirm sorting at facility."""
    if passport_id not in _passports:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = _passports[passport_id]
    passport["status"] = "sorted"
    
    tx = mock_record_blockchain_event({
        "passport_id": passport_id,
        "event_type": "sorted",
        "actor_id": event.actor_id,
    })
    
    passport["timeline"].append({
        "step": "sorted",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor_id": event.actor_id,
        "location": event.location,
        "blockchain_tx": tx,
    })
    
    return {"status": "success", "new_status": "sorted", "blockchain_tx": tx}

@app.post("/material/{passport_id}/receive")
def confirm_receipt(passport_id: str, event: MaterialEvent):
    """Recycler confirms receipt of material."""
    if passport_id not in _passports:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = _passports[passport_id]
    passport["status"] = "received"
    passport["recycler_id"] = event.actor_id
    
    tx = mock_record_blockchain_event({
        "passport_id": passport_id,
        "event_type": "received",
        "actor_id": event.actor_id,
    })
    
    passport["timeline"].append({
        "step": "received",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor_id": event.actor_id,
        "location": event.location,
        "blockchain_tx": tx,
    })
    
    return {"status": "success", "new_status": "received", "blockchain_tx": tx}

@app.post("/material/{passport_id}/process")
def confirm_processing(passport_id: str, event: MaterialEvent):
    """Recycler marks material as fully processed."""
    if passport_id not in _passports:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = _passports[passport_id]
    passport["status"] = "processed"
    
    tx = mock_record_blockchain_event({
        "passport_id": passport_id,
        "event_type": "processed",
        "actor_id": event.actor_id,
    })
    
    passport["timeline"].append({
        "step": "processed",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor_id": event.actor_id,
        "location": event.location,
        "blockchain_tx": tx,
    })
    
    return {"status": "success", "new_status": "processed", "blockchain_tx": tx}

@app.get("/material/{passport_id}/journey")
def get_journey(passport_id: str):
    """Get complete material journey."""
    if passport_id not in _passports:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = _passports[passport_id]
    return {
        "passport_id": passport_id,
        "current_status": passport["status"],
        "timeline": passport["timeline"],
        "is_complete": passport["status"] == "processed",
        "blockchain_anchored_events": [
            step for step in passport["timeline"] if step.get("blockchain_tx")
        ],
    }

@app.get("/collectors/nearby")
def get_nearby_collectors(location: Optional[str] = None, material: Optional[str] = None):
    """Return verified collectors near a location."""
    collectors = [
        {
            "id": "C-0217",
            "name": "Ramesh Kumar",
            "area": "Kothrud, Pune",
            "distance_km": 1.2,
            "materials": ["PET", "Paper", "Metal", "Glass"],
            "verified": True,
            "rating": 4.9,
            "collections": 247,
            "recovered_kg": 1284,
            "available": True,
            "experience_years": 6,
        },
        {
            "id": "C-0182",
            "name": "Sunita Devi",
            "area": "Karve Nagar, Pune",
            "distance_km": 2.4,
            "materials": ["PET", "E-Waste", "Metal"],
            "verified": True,
            "rating": 4.7,
            "collections": 189,
            "recovered_kg": 892,
            "available": True,
            "experience_years": 4,
        },
        {
            "id": "C-0301",
            "name": "Mohammed Aslam",
            "area": "Deccan, Pune",
            "distance_km": 3.1,
            "materials": ["PET", "Paper", "Cardboard", "Glass"],
            "verified": True,
            "rating": 4.6,
            "collections": 134,
            "recovered_kg": 678,
            "available": False,
            "experience_years": 3,
        },
    ]
    
    # Filter by material if specified
    if material:
        collectors = [c for c in collectors if material.upper() in c["materials"]]
    
    return {"collectors": collectors, "total": len(collectors)}

@app.post("/pop/credit")
def credit_pop(request: POPCreditRequest):
    """Award POP for a verified action."""
    pop_id = f"POP-{uuid.uuid4().hex[:8].upper()}"
    
    pop_record = {
        "id": pop_id,
        "user_id": request.user_id,
        "amount": request.amount,
        "reason": request.reason,
        "passport_id": request.passport_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    
    if request.user_id not in _pop_records:
        _pop_records[request.user_id] = []
    _pop_records[request.user_id].append(pop_record)
    
    total = sum(r["amount"] for r in _pop_records.get(request.user_id, []))
    
    return {
        "status": "success",
        "pop_id": pop_id,
        "amount_credited": request.amount,
        "new_total": total,
    }

@app.get("/pop/history")
def get_pop_history(user_id: str):
    """Get POP history for a user."""
    records = _pop_records.get(user_id, [])
    total = sum(r["amount"] for r in records)
    return {
        "user_id": user_id,
        "total_pop": total,
        "history": sorted(records, key=lambda x: x["timestamp"], reverse=True),
    }

@app.post("/blockchain/record-event")
def record_event(event: MaterialEvent):
    """Manually record a blockchain event."""
    tx = mock_record_blockchain_event({
        "passport_id": event.passport_id,
        "event_type": event.event_type,
        "actor_id": event.actor_id,
    })
    return {"status": "success", "tx_hash": tx, "network": "Polygon"}

@app.get("/blockchain/status")
def blockchain_status():
    """Get recent blockchain events."""
    return {
        "status": "connected",
        "network": "Polygon (Simulated)",
        "total_events": len(_blockchain_events),
        "recent_events": _blockchain_events[-10:][::-1],
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "RECY-LINK API", "timestamp": datetime.now(timezone.utc).isoformat()}

if __name__ == "__main__":
    import uvicorn
    print("Starting RECY-LINK API on http://localhost:8000")
    print("API docs: http://localhost:8000/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
