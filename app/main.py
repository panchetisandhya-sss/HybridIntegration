from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
# Placeholder imports for quantum logic and auth
from .quantum_logic import cast_secure_vote, simulate_bb84, simulate_chsh
# from .auth import authenticate_user, User # Actual auth omitted for code brevity
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Placeholder for vote history (In-memory storage for demo)
VOTE_HISTORY = []

# --- Pydantic Models ---
class VoteRequest(BaseModel):
    party_id: str
    eve_enabled: bool = False

class VoteResult(BaseModel):
    vote_id: str
    status: str
    qber: float
    chsh_s: float

class HistoryEntry(VoteResult):
    timestamp: str

# --- 1. /api/auth (Simplified) ---
@app.post("/api/login")
async def login():
    # Placeholder for actual hashed password check and JWT token generation
    return {"message": "Login successful", "token": "dummy_jwt_token"}

# --- 2. /api/cast-vote (USE CASE) ---
@app.post("/api/cast-vote", response_model=VoteResult)
async def cast_vote(vote_req: VoteRequest):
    """Casts and verifies the vote using simulated QKD protocols."""
    result = cast_secure_vote(vote_req.party_id, vote_req.eve_enabled)
    
    # Save the history entry (without party_id for privacy)
    VOTE_HISTORY.append({
        "timestamp": "2025-12-14 12:08",
        "vote_id": result['vote_id'],
        "status": result['status'],
        "qber": result['qber'],
        "chsh_s": result['chsh_s']
    })
    
    # Terminal Log (for the frontend console view)
    print(f"\n>>> QUANTUM VOTE CAST: ID={result['vote_id']}, Status={result['status']}")
    print(f"BB84 QBER: {result['qber']*100:.2f}%. E91 CHSH S: {result['chsh_s']:.4f}")
    
    return result

# --- 3. /api/simulation (SIMULATION PAGE) ---
@app.get("/api/simulation")
async def get_simulation(eve: bool = False):
    """Runs a single simulation and returns all visualization data."""
    qber, bb84_log = simulate_bb84(key_length=50, include_eve=eve)
    chsh_s, e91_log = simulate_chsh(noise_level=0.2 if eve else 0.01)
    
    # In a real app, Qiskit visualization outputs (circuit.draw(), histograms)
    # would be converted to base64 images/JSON data and returned here.
    
    return {
        "status": "Simulated",
        "eve_enabled": eve,
        "metrics": {"qber": qber, "chsh_s": chsh_s},
        "bb84_data": bb84_log,
        "e91_data": e91_log,
        "log_output": f"BB84 QBER: {qber*100:.2f}%. CHSH S: {chsh_s:.4f}. Eve={'ON' if eve else 'OFF'}"
    }

# --- 4. /api/history (HISTORY PAGE) ---
@app.get("/api/history", response_model=List[HistoryEntry])
async def get_history():
    """Returns the non-identifiable vote history."""
    # Note: Party ID is NOT returned to preserve privacy.
    return VOTE_HISTORY
