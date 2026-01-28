"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DataMonolithProps {
  id: string;
  name: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  isActive: boolean;
  isVisited: boolean;
  onClick: () => void;
  playerPos: { x: number; y: number }; // Percentage
}

// Deterministic pseudo-random based on index
const seededValue = (index: number, seed: number) => {
  const x = Math.sin(index * 9.8 + seed) * 10000;
  return x - Math.floor(x);
};

export const DataMonolith = ({
  name,
  x,
  y,
  isActive,
  isVisited,
  onClick,
  playerPos,
}: DataMonolithProps) => {
  const [, setIsHovered] = useState(false);

  // Physics: Calculate distance to player to trigger "Parting" effect
  // Simple Euclidean distance in percentage units
  const dx = playerPos.x - x;
  const dy = playerPos.y - y;
  const distance = Math.hypot(dx, dy);

  // "Parting the Sea" Effect
  // If player is close (< 15%), the blocks float apart
  const isParting = distance < 15;

  return (
    <div
      className="absolute z-20 pointer-events-auto"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Label (always visible but fades out when close to avoid clutter) */}
      <motion.div
        className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap z-30"
        animate={{
          opacity: isParting || isActive ? 1 : 0.6,
          y: isParting ? -10 : 0,
        }}
      >
        <div className={cn(
          "px-3 py-1 text-xs font-mono tracking-widest uppercase border backdrop-blur-md transition-colors",
          isActive 
            ? "bg-cyan-500 text-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
            : isVisited
              ? "bg-slate-900/80 text-cyan-500 border-cyan-500/50"
              : "bg-slate-900/60 text-slate-500 border-slate-700"
        )}>
          {name}
        </div>
      </motion.div>

      {/* The Monolith Structure (Cluster of Cubes) */}
      <div className="relative w-24 h-24 perspective-[1000px]">
        {/* Central Core (The Reward) */}
        <motion.div
          className={cn(
            "absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-sm flex items-center justify-center transition-all duration-500",
            isActive ? "bg-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.6)]" : "bg-slate-800 border border-slate-600"
          )}
          animate={{
            scale: isActive ? 1.2 : 1,
            rotate: isActive ? 45 : 0,
          }}
        >
          {isVisited ? (
            <div className="text-2xl">💠</div>
          ) : (
            <div className="text-2xl opacity-20">🔒</div>
          )}
        </motion.div>

        {/* Floating "Shell" Blocks that Part Ways */}
        {/* Top Left */}
        <motion.div
          className="absolute w-8 h-8 bg-slate-900 border border-cyan-500/30 opacity-80 backdrop-blur-sm"
          animate={{
            x: isParting || isActive ? -40 : -20,
            y: isParting || isActive ? -40 : -20,
            rotate: isParting ? -15 : 0,
            opacity: isParting ? 0.9 : 0.8,
          }}
          transition={{ type: "spring", stiffness: 60 }}
          style={{ top: "50%", left: "50%", marginTop: -16, marginLeft: -16 }}
        />
        {/* Top Right */}
        <motion.div
          className="absolute w-8 h-8 bg-slate-900 border border-cyan-500/30 opacity-80 backdrop-blur-sm"
          animate={{
            x: isParting || isActive ? 40 : 20,
            y: isParting || isActive ? -40 : -20,
            rotate: isParting ? 15 : 0,
            opacity: isParting ? 0.9 : 0.8,
          }}
          transition={{ type: "spring", stiffness: 60, delay: 0.05 }}
          style={{ top: "50%", left: "50%", marginTop: -16, marginLeft: -16 }}
        />
        {/* Bottom Left */}
        <motion.div
          className="absolute w-8 h-8 bg-slate-900 border border-cyan-500/30 opacity-80 backdrop-blur-sm"
          animate={{
            x: isParting || isActive ? -40 : -20,
            y: isParting || isActive ? 40 : 20,
            rotate: isParting ? 15 : 0,
            opacity: isParting ? 0.9 : 0.8,
          }}
          transition={{ type: "spring", stiffness: 60, delay: 0.1 }}
          style={{ top: "50%", left: "50%", marginTop: -16, marginLeft: -16 }}
        />
        {/* Bottom Right */}
        <motion.div
          className="absolute w-8 h-8 bg-slate-900 border border-cyan-500/30 opacity-80 backdrop-blur-sm"
          animate={{
            x: isParting || isActive ? 40 : 20,
            y: isParting || isActive ? 40 : 20,
            rotate: isParting ? -15 : 0,
            opacity: isParting ? 0.9 : 0.8,
          }}
          transition={{ type: "spring", stiffness: 60, delay: 0.15 }}
          style={{ top: "50%", left: "50%", marginTop: -16, marginLeft: -16 }}
        />

        {/* Particle Effects when Parting */}
        <AnimatePresence>
          {(isParting || isActive) && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => {
                const randomX = seededValue(i, 1);
                const randomY = seededValue(i, 2);
                const randomDuration = seededValue(i, 3);
                const randomDelay = seededValue(i, 4);
                
                return (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                    initial={{ opacity: 0, scale: 0, x: "50%", y: "50%" }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1.5, 0],
                      x: `${50 + (randomX - 0.5) * 100}%`,
                      y: `${50 + (randomY - 0.5) * 100}%`,
                    }}
                    transition={{ 
                      duration: 1 + randomDuration, 
                      repeat: Infinity,
                      delay: randomDelay * 0.5 
                    }}
                  />
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
