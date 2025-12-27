import "./circuit.css";

export default function Circuit() {
  const qubits = JSON.parse(localStorage.getItem("qubits")) || [];

  return (
    <div className="circuit-wrapper">
      <h2 className="circuit-title">
        Quantum Circuit — BB84 + E91 (IBM Style)
      </h2>

      <div className="circuit-board">
        {qubits.map((q, i) => (
          <div key={i} className="circuit-row">
            {/* Qubit label */}
            <div className="qubit-label">q[{i}]</div>

            {/* Wire */}
            <div className="wire-line">
              {/* BB84 Encoding */}
              {q.basis === "×" && <div className="gate">H</div>}

              {/* E91 Entanglement */}
              <div className="gate entangle">●</div>
              <div className="gate">CX</div>

              {/* Eve Attack */}
              {q.eveInterfered && <div className="gate eve">X</div>}

              {/* Measurement */}
              <div className="gate measure">M</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

