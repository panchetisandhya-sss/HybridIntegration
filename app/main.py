from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
# Placeholder imports for quantum logic and auth
from quantum_logic import cast_secure_vote, simulate_bb84, simulate_chsh
# from auth import authenticate_user, User # Actual auth omitted for code brevity
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import hashlib
import json

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

@app.get("/")
def home():
    return {"status": "Quantum Backend is Active", "version": "1.0"}

# In-memory "database" for users
USERS_DB = {}


# --- Pydantic Models ---
class VoteRequest(BaseModel):
    party_id: str
    voter_token: str
    eve_enabled: bool = False

class VoteResult(BaseModel):
    vote_id: str
    status: str
    qber: float
    chsh_s: float
    circuit_qasm: Optional[str] = None
    circuit_qubits: Optional[List[dict]] = None


class HistoryEntry(VoteResult):
    timestamp: str
    previous_hash: str
    hash: str
    voter_token: str

class LoginRequest(BaseModel):
    voter_id: str
    password: str

@app.post("/api/login")
async def login(req: LoginRequest):
    # Check if user exists
    if req.voter_id not in USERS_DB:
        # Auto-register (store them in 'database')
        USERS_DB[req.voter_id] = {"password": req.password}
        return {"message": "User registered and logged in successfully", "token": f"token_{req.voter_id}"}
    
    # If user exists, check password
    if USERS_DB[req.voter_id]["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials. Incorrect password for existing user.")

    return {"message": "Login successful", "token": f"token_{req.voter_id}"}

# --- 2. /api/cast-vote (USE CASE) ---
@app.post("/api/cast-vote", response_model=VoteResult)
async def cast_vote(vote_req: VoteRequest):
    """Casts and verifies the vote using simulated QKD protocols."""
    result = cast_secure_vote(vote_req.party_id, vote_req.eve_enabled)
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Blockchain hash computing
    previous_hash = VOTE_HISTORY[-1]["hash"] if len(VOTE_HISTORY) > 0 else "0" * 64
    
    block_data = {
        "timestamp": timestamp,
        "vote_id": result['vote_id'],
        "status": result['status'],
        "qber": result['qber'],
        "chsh_s": result['chsh_s'],
        "voter_token": vote_req.voter_token,
        "previous_hash": previous_hash
    }
    
    # Hash calculation
    block_string = json.dumps(block_data, sort_keys=True).encode()
    block_hash = hashlib.sha256(block_string).hexdigest()
    
    # Save the history entry (without party_id for privacy)
    block_data["circuit_qasm"] = result.get('circuit_qasm', '')
    block_data["circuit_qubits"] = result.get('circuit_qubits', [])
    block_data["hash"] = block_hash
    
    VOTE_HISTORY.append(block_data)
    
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
async def get_history(token: str = ""):
    """Returns the non-identifiable vote history for a specific user token."""
    # Filter by user token (only show to the user who cast them)
    if token:
        # User history
        return [entry for entry in VOTE_HISTORY if entry.get("voter_token") == token]
    
    # If no token passed, for security, maybe return empty or just let it return all (for demo purposes)
    return []
