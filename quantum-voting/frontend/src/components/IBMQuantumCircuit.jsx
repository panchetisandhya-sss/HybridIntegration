import React from 'react';
import './quantum-visuals.css';

export default function IBMQuantumCircuit({ circuit }) {
  if (!circuit || !circuit.qubit_lines) return null;

  // Define column positions for different types of gates to keep them aligned
  const GATE_POSITIONS = {
    'H': '10%',
    'ENTANGLE': '35%',
    'X': '55%',
    'EVE': '70%',
    'M': '90%'
  };

  return (
    <div className="ibm-circuit-wrapper">
      <h2 className="ibm-circuit-title">Quantum Circuit — BB84 + E91 (IBM Style)</h2>
      <div className="ibm-circuit-board" style={{ position: 'relative' }}>
        
        {/* Draw vertical entanglement lines first */}
        <div style={{ position: 'absolute', left: '40px', right: 0, top: 0, bottom: 0, pointerEvents: 'none' }}>
           {circuit.qubit_lines.map((ql, idx) => {
             if (idx % 2 === 0 && idx + 1 < circuit.qubit_lines.length) {
               return (
                 <div 
                   key={`line-${idx}`} 
                   className="ibm-entangle-line" 
                   style={{ 
                     left: GATE_POSITIONS.ENTANGLE, 
                     top: `${idx * 56 + 28}px`, 
                     height: '56px' 
                   }} 
                 />
               );
             }
             return null;
           })}
        </div>

        {circuit.qubit_lines.map((ql, idx) => (
          <div key={ql.qubit} className="ibm-circuit-row" style={{ height: '56px', marginBottom: 0 }}>
            <div className="ibm-qubit-label">q[{ql.qubit}]</div>
            <div className="ibm-wire-line">
              {ql.gates.map((gate, gIdx) => {
                let className = "ibm-gate";
                let style = { left: GATE_POSITIONS[gate] || `${20 + gIdx * 20}%` };
                
                if (gate === 'M') className += " ibm-gate measure";
                if (gate === 'EVE') className += " ibm-gate eve";
                
                return (
                  <div key={gIdx} className={className} style={style}>
                    {gate}
                  </div>
                );
              })}

              {/* Add Entanglement Gates */}
              {idx % 2 === 0 ? (
                <div className="ibm-gate entangle" style={{ left: GATE_POSITIONS.ENTANGLE }}></div>
              ) : (
                <div className="ibm-gate target" style={{ left: `calc(${GATE_POSITIONS.ENTANGLE} - 10px)` }}>⊕</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
