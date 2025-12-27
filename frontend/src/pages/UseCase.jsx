import { useState } from "react";
import { motion } from "framer-motion";

const parties = [
  { id: "PARTY_A", name: "Party A" },
  { id: "PARTY_B", name: "Party B" },
];

export default function UseCase() {
  const [party, setParty] = useState(null);
  const [result, setResult] = useState(null);
  const [eve, setEve] = useState(false);
  const [loading, setLoading] = useState(false);

  const castVote = async () => {
    if (!party) return;
    localStorage.setItem("selectedParty", party.name);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/cast-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          party_id: party.id,
          eve_enabled: eve,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      alert("⚠️ Backend not reachable");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Quantum-Secure Vote Casting
      </motion.h1>

      <p>
        Your vote is protected using BB84 + E91 quantum key distribution
        simulations.
      </p>

      {/* Party Selection */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "40px" }}>
        {parties.map((p) => (
          <div
            key={p.id}
            onClick={() => setParty(p)}
            className={`party-btn ${party?.id === p.id ? "selected" : ""}`}
          >
            {p.name}
          </div>
        ))}

        {/* Add Party */}
        
      </div>

      {/* Eve Toggle */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <label>
          <input
            type="checkbox"
            onChange={(e) => setEve(e.target.checked)}
            style={{ marginRight: "8px" }}
          />
          Simulate Eve (Eavesdropping Attack)
        </label>
      </div>

      {/* Vote Button */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <button
          onClick={castVote}
          disabled={!party || loading}
          className={`btn-primary ${loading || !party ? "btn-disabled" : ""}`}
        >
          {loading ? "Running Quantum Protocol…" : "Cast Secure Vote"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`card ${
            result.status === "SECURE"
              ? "result-secure"
              : "result-fail"
          }`}
        >
          <h3>
            {result.status === "SECURE"
              ? "✅ Vote Successfully Secured"
              : "❌ Vote Rejected (Channel Insecure)"}
          </h3>

          <p>QBER: {(result.qber * 100).toFixed(2)}%</p>
          <p>CHSH S: {result.chsh_s.toFixed(4)}</p>
        </motion.div>
      )}
    </div>
  );
}

