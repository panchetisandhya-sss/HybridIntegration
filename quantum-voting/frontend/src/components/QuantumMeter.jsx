import { motion } from 'framer-motion';

export default function QuantumMeter({ qber, sValue }) {
  return (
    <div className="flex gap-8 my-4">
      <div className="flex-1 bg-gray-800 p-4 rounded-xl border border-blue-500/30">
        <h4 className="text-sm text-gray-400 mb-2">QBER Indicator</h4>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-mono text-cyan-400">{qber}%</span>
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(qber, 100)}%` }}
              className={`h-full ${qber > 11 ? 'bg-red-500' : 'bg-cyan-500'}`}
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-800 p-4 rounded-xl border border-purple-500/30">
        <h4 className="text-sm text-gray-400 mb-2">CHSH S-Value</h4>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-mono text-purple-400">{sValue}</span>
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((sValue/2.82)*100, 100)}%` }}
              className={`h-full ${sValue < 2.0 ? 'bg-red-500' : 'bg-purple-500'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
