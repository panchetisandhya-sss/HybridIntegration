import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [isBegun, setIsBegun] = useState(false);
  const navigate = useNavigate();

  const handleBegin = () => {
    setIsBegun(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center font-serif">
      {/* Background Image */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isBegun ? 'blur-md scale-105' : 'blur-0 scale-100'}`}
        style={{
          backgroundImage: `url("C:/Users/hp/Downloads/Any_Booth_Voting.webp")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-1000 ${isBegun ? 'opacity-60' : 'opacity-30'}`} style={{ zIndex: -1 }}></div>

      {!isBegun ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white px-4"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 drop-shadow-2xl uppercase">
            <span className="text-[#FF9933]">Quantum</span> <span className="text-white">Indian</span> <span className="text-[#128807]">Elections</span>
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-widest uppercase mb-12 opacity-80">
            Securing the World's Largest Democracy with Quantum Cryptography
          </p>
          <button 
            onClick={handleBegin}
            className="group relative px-12 py-4 bg-white text-black font-bold text-xl uppercase tracking-widest overflow-hidden transition-all hover:pr-16 rounded-full shadow-2xl"
          >
            <span className="relative z-10">Begin</span>
            <div className="absolute right-0 top-0 h-full w-0 bg-orange-500 transition-all group-hover:w-full" style={{ zIndex: 0 }}></div>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">→</span>
          </button>
        </motion.div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          {/* Scrolling Text */}
          <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
            <div className="whitespace-nowrap animate-marquee text-[10vw] font-black text-white/10 uppercase italic">
              Democratic Sovereignty • Quantum Integrity • Zero Knowledge • Secure Enclave • Digital Empowerment • 
              Democratic Sovereignty • Quantum Integrity • Zero Knowledge • Secure Enclave • Digital Empowerment • 
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-3xl text-center text-white px-8 relative z-10"
          >
            <h2 className="text-4xl font-bold mb-8 border-b border-orange-500/50 pb-4 inline-block">Q-Secure Vote</h2>
            <div className="space-y-6 text-lg md:text-xl leading-relaxed text-gray-200">
              <p>
                India, the world's largest democracy, is evolving. In an era of digital threats and computational supremacy, 
                we are integrating the laws of physics to protect your voice.
              </p>
              <p>
                Our <strong>Hybrid Integration</strong> system combines Blockchain transparency with <strong>Quantum Key Distribution (QKD)</strong>. 
                Using the BB84 and E91 protocols, we ensure that your vote is not just counted, but remains unobserved and untamperable.
              </p>
              <p className="text-orange-400 font-semibold italic">
                "Physics is the ultimate encryption."
              </p>
            </div>
            
            <div className="mt-12 flex gap-4 justify-center">
              <button 
                onClick={() => navigate('/vote')}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded shadow-lg hover:shadow-orange-500/40 transition-all uppercase tracking-widest"
              >
                Go to Terminal
              </button>
              <button 
                onClick={() => setIsBegun(false)}
                className="px-8 py-3 border border-white/30 text-white font-bold rounded hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                Back
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
