import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IBMQuantumCircuit from "./IBMQuantumCircuit";
import IBMQuantumHistogram from "./IBMQuantumHistogram";
import "../simulation.css";

const BASES = ["+", "×"];
const ORIENTATIONS = {
  "+": ["↕", "↔"],
  "×": ["⤢", "⤡"],
};

export default function SimulationView() {
  const channelRef = useRef(null);
  const [channelWidth, setChannelWidth] = useState(0);
  const [step, setStep] = useState(0); // 0: Start, 1: Quantum Flow, 2: Basis Comparison
  const [subView, setSubView] = useState("flow"); // flow, circuit, histogram
  const [eve, setEve] = useState(false);
  const [qubits, setQubits] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (channelRef.current) {
      setChannelWidth(channelRef.current.offsetWidth);
    }
  }, [step, subView]);

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
    setQubits(q);
    setStep(1);
    setSubView("flow");
    
    // Simulate metrics
    const qber = eve ? Math.random() * 15 + 10 : Math.random() * 5;
    const sValue = eve ? Math.random() * 0.8 + 1.2 : Math.random() * 0.3 + 2.5;
    setMetrics({
        qber: qber.toFixed(2),
        sValue: sValue.toFixed(2),
        secure: qber < 10,
        circuit: {
            num_qubits: 8,
            depth: 6,
            total_gates: 24,
            qubit_lines: Array.from({ length: 8 }).map((_, i) => ({
                qubit: i,
                gates: ["H", eve && Math.random() > 0.5 ? "EVE" : "X", "M"]
            })),
            intercepted_qubits: eve ? [1, 3, 5] : []
        },
        histogram: {
            states: ["|00⟩", "|01⟩", "|10⟩", "|11⟩"],
            probabilities: eve ? [0.25, 0.25, 0.25, 0.25] : [0.82, 0.08, 0.06, 0.04],
            dominant_state: eve ? "UNIFORM" : "|00⟩",
            dominant_prob: eve ? 0.25 : 0.82,
            entanglement_score: eve ? 0.12 : 0.94,
            bell_state: eve ? "COLLAPSED" : "|Φ+⟩"
        }
    });
  };

  useEffect(() => {
    if (step === 2) {
      setQubits((prev) =>
        prev.map((q) => ({ ...q, matched: q.basis === q.bobBasis }))
      );
    }
  }, [step]);

  return (
    <div className="sim-container font-mono bg-gray-900/50 rounded-3xl p-6 border border-gray-800 shadow-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
          <h1 className="sim-title">Hybrid BB84 + E91 Quantum Voting Simulation</h1>
          <div className="eve-box">
            <input
                type="checkbox"
                id="eve_sim"
                checked={eve}
                onChange={(e) => setEve(e.target.checked)}
                className="w-4 h-4 accent-yellow-500"
            />
            <label htmlFor="eve_sim">Eve Attack Enabled</label>
          </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
            {subView === "flow" && (
                <motion.div key="flow" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 h-full flex flex-col">
                    <div className="flow-row">
                        <div className="party-box">
                            <h3 className="font-black">Alice</h3>
                            <p>Voter</p>
                        </div>
                        <div className="quantum-channel" ref={channelRef}>
                            {step >= 1 &&
                                qubits.map((q) => (
                                <motion.div
                                    key={q.id}
                                    className="photon"
                                    initial={{ x: 0, opacity: 0 }}
                                    animate={{ x: channelWidth - 40, opacity: 1 }}
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
                            <h3 className="font-black">Bob</h3>
                            <p>Server</p>
                        </div>
                    </div>

                    {step >= 2 && (
                        <div className="match-section">
                            <h2 className="font-bold tracking-widest">Basis Comparison Result</h2>
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
                </motion.div>
            )}

            {subView === "circuit" && metrics && (
                <motion.div key="circuit" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full">
                    <IBMQuantumCircuit circuit={metrics.circuit} />
                </motion.div>
            )}

            {subView === "histogram" && metrics && (
                <motion.div key="histogram" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full">
                    <IBMQuantumHistogram histogram={metrics.histogram} isCompromised={!metrics.secure} />
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div className="sim-controls mt-6">
        {step === 0 && (
          <button onClick={generateQubits} className="bg-purple-600 text-white p-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition">
            Generate Qubits & Initiate Channel
          </button>
        )}
        {step === 1 && (
          <button onClick={() => setStep(2)} className="bg-blue-600 text-white p-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition">
            Compare Measurement Bases
          </button>
        )}
        {step === 2 && (
          <div className="nav-buttons">
            <button onClick={() => setSubView("flow")} className={`${subView === 'flow' ? 'active' : ''} p-4 rounded-xl font-bold transition`}>
              Quantum Flow
            </button>
            <button onClick={() => setSubView("circuit")} className={`${subView === 'circuit' ? 'active' : ''} p-4 rounded-xl font-bold transition`}>
              Quantum Circuit
            </button>
            <button onClick={() => setSubView("histogram")} className={`${subView === 'histogram' ? 'active' : ''} p-4 rounded-xl font-bold transition`}>
              Measurement Histogram
            </button>
            <button onClick={() => { setStep(0); setSubView("flow"); }} className="p-4 rounded-xl font-bold transition bg-gray-800 text-gray-400">
              Reset Simulation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
