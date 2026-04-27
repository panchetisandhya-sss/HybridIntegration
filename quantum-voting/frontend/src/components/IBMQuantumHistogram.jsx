import React from 'react';
import './quantum-visuals.css';

export default function IBMQuantumHistogram({ histogram, isCompromised }) {
  if (!histogram) return null;

  const data = {
    "00": histogram.probabilities[0],
    "01": histogram.probabilities[1],
    "10": histogram.probabilities[2],
    "11": histogram.probabilities[3],
  };

  const HEIGHT = 180;
  const BASE_Y = 220;
  const SVG_WIDTH = 500;
  const SVG_HEIGHT = 280;

  return (
    <div className="ibm-histogram-wrapper">
      <h2 className="ibm-histogram-title">Quantum Measurement Histogram</h2>
      <p className="ibm-histogram-subtitle">BB84 + E91 | Entanglement Correlations</p>
      
      <div className="ibm-histogram-container">
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="ibm-histogram-svg">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((g, i) => (
            <line
              key={i}
              x1="50"
              x2={SVG_WIDTH - 20}
              y1={BASE_Y - g * HEIGHT}
              y2={BASE_Y - g * HEIGHT}
              className="ibm-grid-line"
            />
          ))}

          {/* Y Axis */}
          <line x1="50" y1="20" x2="50" y2={BASE_Y} className="ibm-axis" />
          <text x="10" y="30" className="ibm-axis-label">P</text>

          {/* Bars */}
          {Object.entries(data).map(([state, prob], i) => {
            const barHeight = prob * HEIGHT;
            const x = 80 + i * 100;
            const y = BASE_Y - barHeight;

            return (
              <g key={state}>
                <rect
                  x={x}
                  y={y}
                  width="60"
                  height={barHeight}
                  className={`ibm-bar ${isCompromised ? "ibm-bar-noise" : ""}`}
                />
                <text
                  x={x + 30}
                  y={BASE_Y + 20}
                  textAnchor="middle"
                  className="ibm-state-label"
                >
                  {state}
                </text>
                <text
                  x={x + 30}
                  y={y - 10}
                  textAnchor="middle"
                  className="ibm-prob-label"
                >
                  {(prob * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="ibm-legend">
        <div className="ibm-legend-item">
          <div className="ibm-legend-color" style={{ background: '#0ea5e9' }}></div>
          <span>Ideal Correlation</span>
        </div>
        <div className="ibm-legend-item">
          <div className="ibm-legend-color" style={{ background: '#f43f5e' }}></div>
          <span>Noise / Eve Effect</span>
        </div>
      </div>
    </div>
  );
}
