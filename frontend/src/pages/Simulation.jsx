import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./simulation.css";

const BASES = ["+", "×"];
const ORIENTATIONS = {
  "+": ["↕", "↔"],
  "×": ["⤢", "⤡"],
};

export default function Simulation() {
  const channelRef = useRef(null);
  const [channelWidth, setChannelWidth] = useState(0);
  const [step, setStep] = useState(0);
  const [eve, setEve] = useState(false);
  const [qubits, setQubits] = useState([]);

  useEffect(() => {
    if (channelRef.current) {
      setChannelWidth(channelRef.current.offsetWidth);
    }
  }, []);

  const generateQubits = () => {
    const q = Array.from({ length: 8 }).map((_, i) => {
      const basis = BASES[Math.floor(Math.random() * 2)];
      return {
        id: i,
        basis,
        orientation: ORIENTATIONS[basis][Math.floor(Math.random() * 2)],
        bobBasis: BASES[Math.floor(Math.random() * 2)],
        matched: false,
        eveInterfered: eve,
      };
    });

    localStorage.setItem("qubits", JSON.stringify(q));
    setQubits(q);
    setStep(1);
  };

  useEffect(() => {
    if (step === 2) {
      setQubits((prev) =>
        prev.map((q) => ({ ...q, matched: q.basis === q.bobBasis }))
      );
    }
  }, [step]);

  return (
    <div className="sim-container">
      <h1 className="sim-title">
        Hybrid BB84 + E91 Quantum Voting Simulation
      </h1>

      {/* Eve */}
      <div className="eve-box">
        <label>
          <input
            type="checkbox"
            checked={eve}
            onChange={(e) => setEve(e.target.checked)}
          />
          Eve Attack Enabled
        </label>
      </div>

      {/* COMMUNICATION FLOW */}
      <div className="flow-row">
        <div className="party-box">
          <h3>Alice</h3>
          <p>Voter</p>
        </div>

        <div className="quantum-channel" ref={channelRef}>
          {step >= 1 &&
            qubits.map((q) => (
              <motion.div
                key={q.id}
                className="photon"
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: channelWidth - 50, opacity: 1 }}
                transition={{
                  duration: 3,
                  delay: q.id * 0.25,
                  ease: "linear",
                }}
              >
                {q.orientation}
              </motion.div>
            ))}
        </div>

        <div className="party-box">
          <h3>Bob</h3>
          <p>Server</p>
        </div>
      </div>

      {/* BASIS MATCH RESULTS */}
      {step >= 2 && (
        <div className="match-section">
          <h2>Basis Comparison Result</h2>
          <div className="match-grid">
            {qubits.map((q) => (
              <div
                key={q.id}
                className={`match-bit ${q.matched ? "match" : "mismatch"}`}
              >
                {q.matched ? "MATCH" : "DROP"}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTROLS */}
      <div className="sim-controls">
        {step === 0 && (
          <button onClick={generateQubits}>
            Generate Qubits
          </button>
        )}

        {step === 1 && (
          <button onClick={() => setStep(2)}>
            Compare Bases
          </button>
        )}

        {step === 2 && (
          <div className="nav-buttons">
            <button onClick={() => (window.location.href = "/circuit")}>
              View Quantum Circuit
            </button>
            <button onClick={() => (window.location.href = "/histogram")}>
              View Measurement Histogram
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

