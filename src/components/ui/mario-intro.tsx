"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MarioIntroProps {
  onComplete: () => void;
  className?: string;
}

export const MarioIntro: React.FC<MarioIntroProps> = ({ onComplete, className }) => {
  const [frame, setFrame] = useState(0);
  const [brickBroken, setBrickBroken] = useState(false);
  const [showText, setShowText] = useState(false);

  // Calculate Mario position based on frame
  const marioX = Math.min(frame * 1.2, 42);
  const isJumpPhase = frame > 40;
  const jumpProgress = isJumpPhase ? Math.min((frame - 40) * 4, 100) : 0;
  const marioY = isJumpPhase 
    ? (jumpProgress <= 50 ? jumpProgress * 1.2 : (100 - jumpProgress) * 1.2)
    : 0;

  useEffect(() => {
    // Single animation loop - 100 frames over 5 seconds (50ms per frame)
    const interval = setInterval(() => {
      setFrame(prev => {
        const next = prev + 1;
        
        // Break brick at frame 50 (peak of jump)
        if (next === 50 && !brickBroken) {
          setBrickBroken(true);
          setShowText(true);
        }
        
        // Complete at frame 100 (5 seconds)
        if (next >= 100) {
          clearInterval(interval);
          onComplete();
          return 100;
        }
        
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete, brickBroken]);

  return (
    <div className={cn("relative w-full h-[250px]", className)}>
      {/* Mario Character */}
      <div
        className="absolute z-20"
        style={{
          left: `${marioX}%`,
          bottom: `${50 + marioY}px`,
          transition: "none",
        }}
      >
        <span className="text-5xl md:text-6xl block select-none">🏃</span>
      </div>

      {/* Question Block */}
      {!brickBroken && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-14 h-14 bg-yellow-400 border-4 border-yellow-600 rounded-lg flex items-center justify-center shadow-lg z-10">
          <span className="text-2xl font-bold text-yellow-700">?</span>
        </div>
      )}

      {/* Brick explosion */}
      {brickBroken && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10">
          <div className="absolute w-4 h-4 bg-yellow-500 animate-[explode-tl_0.6s_ease-out_forwards]" />
          <div className="absolute w-4 h-4 bg-yellow-500 animate-[explode-tr_0.6s_ease-out_forwards]" />
          <div className="absolute w-4 h-4 bg-yellow-600 animate-[explode-bl_0.6s_ease-out_forwards]" />
          <div className="absolute w-4 h-4 bg-yellow-600 animate-[explode-br_0.6s_ease-out_forwards]" />
        </div>
      )}

      {/* Welcome Text */}
      {showText && (
        <h1 
          className="absolute top-8 left-1/2 -translate-x-1/2 z-30 text-xl md:text-3xl lg:text-4xl font-bold text-white whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-[fade-scale-in_0.5s_ease-out_forwards]"
        >
          Welcome to my portfolio website
        </h1>
      )}
    </div>
  );
};

export default MarioIntro;
