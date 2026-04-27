import { motion } from "framer-motion";

export default function Speedometer({ value, total, label, color = "#22c55e" }) {
  const percentage = total > 0 ? (value / total) : 0;
  const rotation = -90 + (percentage * 180); // -90deg is 0%, +90deg is 100%

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-950 border border-gray-800 rounded-3xl shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="w-16 h-16 rounded-full border-4 border-gray-100"></div>
      </div>
      
      <div className="relative w-40 h-20 overflow-hidden">
        {/* Background Arc */}
        <div className="absolute top-0 left-0 w-40 h-40 border-[12px] border-gray-900 rounded-full"></div>
        
        {/* Active Arc (Colored) */}
        <div 
          className="absolute top-0 left-0 w-40 h-40 border-[12px] rounded-full transition-all duration-1000 ease-out"
          style={{ 
            borderColor: color,
            clipPath: `inset(0 0 50% 0)`,
            transform: `rotate(${rotation - 90}deg)`,
            opacity: 0.6
          }}
        ></div>

        {/* Needle */}
        <motion.div 
          className="absolute bottom-0 left-1/2 w-1 h-20 bg-white origin-bottom rounded-full z-10"
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.5, type: "spring", stiffness: 50 }}
          style={{ marginLeft: '-2px' }}
        ></motion.div>
        
        {/* Center Pivot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-800 border-2 border-white rounded-full z-20"></div>
      </div>

      <div className="text-center">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{label}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-2xl font-black text-white">{(percentage * 100).toFixed(1)}</span>
          <span className="text-xs font-bold text-gray-400">%</span>
        </div>
        <p className="text-[10px] font-bold text-gray-600 mt-1 uppercase">{value} Votes Secured</p>
      </div>
    </div>
  );
}
