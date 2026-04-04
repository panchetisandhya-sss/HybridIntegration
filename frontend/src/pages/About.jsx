import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./about.css";

const steps = [
  {
    id: 1,
    title: "Voter Authentication",
    desc:
      "The voter is authenticated using classical credentials. Identity is verified, but vote anonymity is preserved.",
  },
  {
    id: 2,
    title: "BB84 Key Distribution",
    desc:
      "Quantum key distribution using BB84 ensures a shared secret key. Any eavesdropping increases QBER.",
  },
  {
    id: 3,
    title: "E91 Entanglement Verification",
    desc:
      "Entangled qubits are tested using CHSH inequality. S > 2 confirms quantum security.",
  },
  {
    id: 4,
    title: "Quantum Vote Encryption",
    desc:
      "The vote is encrypted using the quantum key. No plaintext vote is ever transmitted.",
  },
  {
    id: 5,
    title: "Secure Vote Acceptance",
    desc:
      "If QBER is low and entanglement is valid, the vote is securely accepted.",
  },
];

export default function About() {
  const [active, setActive] = useState(null);

  return (
    <div className="about-container">
      <h1 className="about-title">
        Hybrid BB84 + E91 Quantum Secure Voting
      </h1>

      <p className="about-subtitle">
        Step-by-step visualization of quantum-secure voting workflow
      </p>

      {/* STEP BOXES */}
      <div className="steps-grid">
        {steps.map((step) => (
          <motion.div
            key={step.id}
            className={`step-card ${active === step.id ? "active" : ""}`}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActive(step.id)}
          >
            <div className="step-number">STEP {step.id}</div>
            <h3>{step.title}</h3>
          </motion.div>
        ))}
      </div>

      {/* DESCRIPTION BOX */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="step-detail"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h2>{steps.find((s) => s.id === active).title}</h2>
            <p>{steps.find((s) => s.id === active).desc}</p>

            <button onClick={() => setActive(null)}>
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WORKFLOW */}
      <div className="workflow">
        <h2>Quantum Workflow Overview</h2>

        <div className="workflow-line">
          <span>Login</span>
          <span>BB84</span>
          <span>QBER Check</span>
          <span>E91</span>
          <span>CHSH &gt; 2</span>
          <span>Vote Accepted</span>
        </div>

        <p className="workflow-note">
          If Eve interferes → QBER increases or CHSH ≤ 2 → Vote rejected
        </p>
      </div>
    </div>
  );
}

