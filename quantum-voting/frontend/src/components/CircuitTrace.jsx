import { motion } from 'framer-motion';

export default function CircuitTrace() {
  return (
    <div className="my-6 p-4 bg-black/50 border border-cyan-500/20 rounded-lg overflow-hidden">
      <h4 className="text-xs text-cyan-500 mb-4 tracking-widest uppercase">Quantum Circuit Active</h4>
      <div className="flex gap-4 items-center">
        {['q0', 'q1', 'q2', 'q3'].map((q, i) => (
          <div key={q} className="flex-1 h-px bg-gray-700 relative">
            <motion.div
              initial={{ left: '-10%' }}
              animate={{ left: '110%' }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400 blur-[2px] shadow-[0_0_10px_#22d3ee]"
            />
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-xs text-gray-500">{q}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
