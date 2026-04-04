# Quantum-Secure Voting System (Hybrid BB84 + E91)

A state-of-the-art quantum-secured voting application that leverages hybrid integration of the BB84 and E91 quantum key distribution (QKD) protocols. This project ensures mathematically proven security against eavesdropping during the voting process.

By combining the robustness of BB84 for secure key exchange with the entanglement-based verification of E91, this system provides unparalleled security for democratic processes or critical decision-making where data integrity and privacy are paramount.

## Features

- **Hybrid Quantum Security:** Validates both Quantum Bit Error Rate (QBER) and CHSH Inequality (S-value) to guarantee a secure channel.
- **Eavesdropper Simulation:** Intentionally simulate Eve's interference to test the quantum attack detection mechanisms at runtime.
- **Real-time Quantum Circuits:** Stores and generates OpenQASM circuit structures for every casted vote directly in the backend.
- **Immutable Vote History:** Keeps an anonymized, unalterable log of vote casting attempts and their quantum security metrics.
- **Visually Stunning Frontend:** A modern, animated React user interface that educates and displays real-time quantum data visualisations.

## Architecture

- **Frontend:** React + Vite, Framer Motion for sophisticated animations.
- **Backend:** FastAPI (Python), providing high-performance RESTful APIs to process quantum protocols.
- **Quantum Logic:** IBM Qiskit and Qiskit Aer simulator for high-fidelity quantum mechanical simulations.

## Prerequisites

Before running the application, ensure you have the following installed:
- Python 3.8+
- Node.js (v16+ recommended) & npm

## Getting Started

### 1. Setup the Backend

Open a terminal, navigate to the root repository, and install the required Python packages:

```bash
# Navigate to the appropriate folder if necessary, then run:
cd app/
# (Optional) Create a virtual environment
python -m venv venv
# Activate the environment (Windows): venv\Scripts\activate
# Activate the environment (Mac/Linux): source venv/bin/activate

# Install the backend dependencies
pip install fastapi uvicorn qiskit qiskit-aer pydantic numpy
```

Start the backend FastAPI server:

```bash
uvicorn main:app --reload --port 8000
```

The backend server will run continuously on `http://127.0.0.1:8000`.

### 2. Setup the Frontend

Open a new terminal window/tab, navigate to the `frontend` folder:

```bash
cd frontend/
```

Install the Node dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Your browser will automatically open, or you can navigate to `http://localhost:5173` to interact with the application.

## How to Use

1. **Cast a Secure Vote:** Navigate to the "Use Case" section. Select a party and decide whether to simulate an Eavesdropper ("Eve") attack.
2. **Review Metrics:** Upon casting the vote, the backend simulates the BB84 and E91 processes, responding with the security posture (QBER % and CHSH S value). If Eve is present, the vote is correctly rejected.
3. **Audit History:** Navigate to the History page to view an immutable log of all past voting attempts, verifying which ones were securely delivered and which were compromised.
4. **Learn & Simulate:** Use the visual Simulation and Circuit views on the frontend to visualize the BB84 stream traversing the quantum channel.

## License
MIT License
