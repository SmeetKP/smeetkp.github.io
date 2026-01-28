"use client";

import { motion } from "framer-motion";

interface ArchitectAvatarProps {
  x: number;
  y: number;
  isMoving: boolean;
  angle: number;
}

export const ArchitectAvatar = ({ x, y, isMoving, angle }: ArchitectAvatarProps) => {
  return (
    <motion.div
      className="absolute z-30 pointer-events-none will-change-transform"
      animate={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      transition={{
        type: "spring",
        stiffness: 100, // Softer spring for "glide" feel
        damping: 20,
        mass: 1,
      }}
      style={{
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* The Architect Character Container */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        
        {/* Aura / Energy Field */}
        <motion.div
          className="absolute inset-0 rounded-full bg-cyan-500/10 blur-md"
          animate={{
            scale: isMoving ? [1, 1.2, 1] : 1,
            opacity: isMoving ? 0.3 : 0.1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Character Silhouette (Stylized Neo-ish coat/body) */}
        <div className="relative z-10 w-8 h-12">
           {/* Head */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-200 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
           
           {/* Body / Trench Coat */}
           <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-8 bg-slate-900 overflow-hidden">
              {/* Digital rain on coat */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent animate-pulse" />
              {/* Coat Shape */}
              <svg viewBox="0 0 20 40" className="w-full h-full fill-slate-800 drop-shadow-lg">
                <path d="M5,0 L15,0 L18,10 L20,40 L10,35 L0,40 L2,10 Z" />
              </svg>
           </div>
           
           {/* Trail Particles (only when moving) */}
           {isMoving && (
             <motion.div 
               className="absolute top-8 left-1/2 -translate-x-1/2 w-full h-10"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
             >
                <div className="absolute w-1 h-1 bg-cyan-400 rounded-full blur-[1px] animate-[ping_1s_infinite]" style={{ left: '20%', top: '0%' }} />
                <div className="absolute w-1 h-1 bg-cyan-400 rounded-full blur-[1px] animate-[ping_1.2s_infinite]" style={{ left: '80%', top: '10%' }} />
                <div className="absolute w-1 h-1 bg-cyan-400 rounded-full blur-[1px] animate-[ping_0.8s_infinite]" style={{ left: '50%', top: '20%' }} />
             </motion.div>
           )}
        </div>

        {/* Direction Indicator (Subtle) */}
        <motion.div
            className="absolute top-1/2 left-1/2 w-12 h-12 border-t border-cyan-500/30 rounded-full"
            style={{
                x: "-50%",
                y: "-50%",
                rotate: angle - 90, // Adjust for 0deg being up
            }}
        />
      </div>
    </motion.div>
  );
};
