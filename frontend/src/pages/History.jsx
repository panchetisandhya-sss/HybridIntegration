import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("History fetch failed:", err);

        // Demo fallback
        setHistory([
          { timestamp: "2025-12-14 12:08", vote_id: "0xf3a...6bc", status: "SECURE", qber: 0.008, chsh_s: 2.801 },
          { timestamp: "2025-12-14 12:09", vote_id: "0x1e8...d90", status: "REJECTED", qber: 0.152, chsh_s: 2.750 },
          { timestamp: "2025-12-14 12:10", vote_id: "0x5d2...1f3", status: "REJECTED", qber: 0.021, chsh_s: 1.980 },
          { timestamp: "2025-12-14 12:11", vote_id: "0x9c4...2a5", status: "SECURE", qber: 0.005, chsh_s: 2.820 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen pt-32 px-6 text-gray-100 max-w-7xl mx-auto">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
      >
        Quantum Vote History
      </motion.h1>

      <p className="text-slate-400 mb-10 max-w-3xl">
        Immutable audit trail of all quantum vote attempts.  
        No voter identity or party information is ever stored.
      </p>

      {/* Loading */}
      {loading ? (
        <p className="text-slate-400">Loading quantum audit log...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-black/60 backdrop-blur-xl">
              <tr className="text-left text-slate-400 uppercase tracking-wider text-xs">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Vote Hash</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">QBER (%)</th>
                <th className="px-6 py-4">CHSH S</th>
              </tr>
            </thead>

            <tbody>
              {history.map((entry, i) => {
                const secure = entry.status === "SECURE";

                return (
                  <motion.tr
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    className={`border-t border-white/5 ${
                      secure ? "bg-emerald-500/5" : "bg-red-500/5"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {entry.timestamp}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {entry.vote_id}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                          secure
                            ? "bg-emerald-400/20 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                            : "bg-red-400/20 text-red-300 shadow-[0_0_10px_rgba(248,113,113,0.4)]"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {(entry.qber * 100).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-300">
                      {entry.chsh_s.toFixed(4)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

