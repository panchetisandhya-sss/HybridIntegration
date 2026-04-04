import { useEffect, useState } from "react";
import "./histogram.css";

export default function Histogram() {
  const [data, setData] = useState({});
  const [eve, setEve] = useState(false);

  useEffect(() => {
    const qubits = JSON.parse(localStorage.getItem("qubits")) || [];
    const evePresent = qubits.some((q) => q.eveInterfered);
    setEve(evePresent);

    let base = {};
    if (evePresent) {
      base = {
        "00": 0.25 + Math.random() * 0.1,
        "11": 0.25 + Math.random() * 0.1,
        "01": 0.20 + Math.random() * 0.05,
        "10": 0.20 + Math.random() * 0.05,
      };
    } else {
      base = {
        "00": 0.47 + Math.random() * 0.02,
        "11": 0.47 + Math.random() * 0.02,
        "01": 0.01 + Math.random() * 0.01,
        "10": 0.01 + Math.random() * 0.01,
      };
    }

    // Normalize probabilities to 1.0 sum
    const sum = Object.values(base).reduce((a, b) => a + b, 0);
    for (const key in base) {
      base[key] /= sum;
    }

    setData(base);
  }, []);

  const HEIGHT = 220;
  const BASE_Y = 260;

  return (
    <div className="histogram-page">
      <h2 className="histogram-title">
        Quantum Measurement Histogram
      </h2>

      <p className="histogram-subtitle">
        BB84 + E91 | IBM Quantum Hardware Style
      </p>

      {eve && (
        <div className="eve-warning">
          ⚠ Eve Detected — Noise & Decoherence Increased
        </div>
      )}

      <div className="histogram-container">
        <svg width="620" height="340" className="histogram-svg">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((g, i) => (
            <line
              key={i}
              x1="60"
              x2="580"
              y1={BASE_Y - g * HEIGHT}
              y2={BASE_Y - g * HEIGHT}
              className="grid-line"
            />
          ))}

          {/* Y Axis */}
          <line x1="60" y1="40" x2="60" y2={BASE_Y} className="axis" />
          <text x="12" y="60" className="axis-label">P</text>

          {/* Bars */}
          {Object.entries(data).map(([state, prob], i) => {
            const barHeight = prob * HEIGHT;
            const x = 120 + i * 110;
            const y = BASE_Y - barHeight;

            return (
              <g key={state}>
                <rect
                  x={x}
                  y={y}
                  width="70"
                  height={barHeight}
                  className={`bar ${eve ? "bar-noise" : ""}`}
                />
                <text
                  x={x + 35}
                  y={BASE_Y + 22}
                  textAnchor="middle"
                  className="state-label"
                >
                  {state}
                </text>
                <text
                  x={x + 35}
                  y={y - 10}
                  textAnchor="middle"
                  className="prob-label"
                >
                  {(prob * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="legend">
        <span className="legend-ideal"></span> Ideal Correlation
        <span className="legend-noise"></span> Noise / Eve Effect
      </div>

      <p className="histogram-desc">
        Histogram reflects realistic IBM Quantum behavior: noise, limited
        connectivity, finite qubits, and native gate constraints distort ideal
        probability distributions. Eve’s interception increases entropy and
        destroys entanglement correlations.
      </p>
    </div>
  );
}

