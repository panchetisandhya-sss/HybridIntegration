// src/pages/QuantumVoteVis.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";

export default function QuantumVoteVis() {
  const [simData, setSimData] = useState(null);
  const [eveEnabled, setEveEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const runSimulation = async (eve) => {
    setLoading(true);
    setSimData(null);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/simulation?eve=${eve}`
      );
      const data = await response.json();
      setSimData(data);
    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    }
    setLoading(false);
  };

  // Prepare Chart Data
  const qberData = {
    labels: simData?.bb84_data?.map((_, i) => `Bit ${i + 1}`) || [],
    datasets: [
      {
        label: "QBER (Mismatch=1, Match=0)",
        data: simData?.bb84_data || [],
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const chshData = {
    labels: simData?.e91_data?.map((_, i) => `Trial ${i + 1}`) || [],
    datasets: [
      {
        label: "CHSH S Value",
        data: simData?.e91_data || [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.2)",
      },
    ],
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h2 className="text-4xl font-bold text-center text-indigo-600 mb-6">
        Hybrid Quantum Vote Simulation (BB84 + E91)
      </h2>

      {/* Controls */}
      <div className="flex justify-center space-x-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => runSimulation(false)}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded shadow-lg hover:bg-blue-700"
        >
          Run Without Eve
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => runSimulation(true)}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded shadow-lg hover:bg-red-700"
        >
          Run With Eve
        </motion.button>
      </div>

      {loading && (
        <div className="text-center text-xl text-gray-600 font-semibold mt-6">
          Running Hybrid Quantum Protocols...
        </div>
      )}

      {simData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* QBER Section */}
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-indigo-700">
              BB84: Quantum Bit Error Rate (QBER)
            </h3>
            <p className="text-sm mb-2">
              Formula: QBER = Number of mismatched bits / Total transmitted bits
            </p>
            <Bar data={qberData} />
          </div>

          {/* CHSH Section */}
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-green-600">
              E91: CHSH Inequality Test
            </h3>
            <p className="text-sm mb-2">
              Formula: S = |E(a,b) + E(a,b') + E(a',b) - E(a',b')|
            </p>
            <Line data={chshData} />
            <p className="mt-2 font-mono text-sm">
              Classical Limit: S ≤ 2, Quantum Violation: S > 2
            </p>
          </div>

          {/* Terminal / Log Output */}
          <div className="p-6 bg-gray-900 text-green-400 rounded-lg font-mono h-48 overflow-y-scroll shadow-inner">
            {simData.log_output}
          </div>

          {/* Eve Status */}
          <div className="text-center font-semibold text-lg">
            {simData.eve_enabled ? (
              <span className="text-red-600">⚠️ Eve is ON – Channel under attack</span>
            ) : (
              <span className="text-green-600">✅ Eve is OFF – Secure Channel</span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

