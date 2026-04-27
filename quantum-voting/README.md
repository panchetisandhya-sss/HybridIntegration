# Quantum-Secure Voting System

A full-stack application simulating a quantum-secured voting system leveraging BB84 and E91 QKD protocols, built with Python FastAPI, React+Vite, Qiskit, and WebSockets.

## Architecture
- **Backend:** Python FastAPI, Qiskit for Quantum simulation, PyCryptodome for AES-256 encryption. Hash-chained JSON ledger.
- **Frontend:** React + Vite, Framer Motion, Tailwind CSS, Recharts. Two distinct views.

## Installation & Setup

### 1. Backend
Navigate to the `backend` directory:
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate   # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Run the backend server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend
Navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

Run the frontend server:
```bash
npm run dev -- --host
```

## How to Find Your Local IP
To allow other devices on your local network to connect:
- **Windows:** Open command prompt and run `ipconfig`. Look for `IPv4 Address` (e.g. `192.168.1.100`).
- **Mac/Linux:** Open terminal and run `ifconfig` or `ip a`.

## Usage Manual

### Admin Setup
1. On the main laptop (where the servers are running), open `http://localhost:5173/admin`.
2. Login with password `admin123`.
3. Keep this dashboard open to monitor votes and quantum channel integrity in realtime.

### Voter Experience
1. On connecting devices (phones, other laptops), navigate to `http://<YOUR-LAPTOP-IP>:5173/vote`.
2. Enter a Name and a unique Voter ID to register.
3. Observe the "Simulate Eve" toggle. If left unchecked, the channel will establish a secure connection using valid theoretical BB84/E91 thresholds. If checked, the quantum channel returns failing metrics (QBER > 11% or S-Value < 2.0). 
4. Cast a vote. The vote will be symmetrically encrypted securely, hashed, and chained on the backend.
