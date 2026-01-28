"use client";

import { useEffect, useRef, useState } from "react";
import { RetroEngine } from "./retro/RetroEngine";
import { LevelGenerator } from "./retro/LevelGenerator";
import { RetroAudio } from "./retro/RetroAudio";
import { useContent } from "@/hooks/useContent";

interface RetroModeProps {
  onSwitchMode: () => void;
  onBack: () => void;
}

export default function RetroMode({ onSwitchMode, onBack }: RetroModeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RetroEngine | null>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const { content } = useContent();
  const [isMuted, setIsMuted] = useState(false);
  
  // Input state
  const keys = useRef({ left: false, right: false, jump: false, down: false });

  const handleToggleMute = () => {
    const newMuted = RetroAudio.toggleMute();
    setIsMuted(newMuted);
  };

  useEffect(() => {
    // Input Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const phase = engine.gameState.phase;

      // Intro phase: Space/Enter starts game
      if (phase === 'intro') {
        if (e.code === 'Space' || e.code === 'Enter') {
          engine.startGame();
        }
        return;
      }

      // Victory phase: 1-4 keys for CTA actions
      if (phase === 'victory') {
        if (e.code === 'Digit1' || e.code === 'Numpad1') engine.handleVictoryAction('1');
        if (e.code === 'Digit2' || e.code === 'Numpad2') engine.handleVictoryAction('2');
        if (e.code === 'Digit3' || e.code === 'Numpad3') engine.handleVictoryAction('3');
        if (e.code === 'Digit4' || e.code === 'Numpad4') engine.handleVictoryAction('4');
        return;
      }

      // Game Over phase: R to restart
      if (phase === 'gameOver') {
        if (e.code === 'KeyR' && content) {
          const levelData = LevelGenerator.generate(content);
          engine.loadLevel(levelData.entities);
        }
        return;
      }

      // Playing phase: movement controls
      switch(e.code) {
        case "ArrowLeft": case "KeyA": keys.current.left = true; break;
        case "ArrowRight": case "KeyD": keys.current.right = true; break;
        case "ArrowUp": case "KeyW": case "Space": keys.current.jump = true; break;
        case "ArrowDown": case "KeyS": keys.current.down = true; break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.code) {
        case "ArrowLeft": case "KeyA": keys.current.left = false; break;
        case "ArrowRight": case "KeyD": keys.current.right = false; break;
        case "ArrowUp": case "KeyW": case "Space": keys.current.jump = false; break;
        case "ArrowDown": case "KeyS": keys.current.down = false; break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Initialize Audio
    RetroAudio.init();

    // Initialize Engine
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new RetroEngine(canvasRef.current, (type) => {
        RetroAudio.play(type);
      });
    }

    // Load Content
    if (engineRef.current && content) {
      const levelData = LevelGenerator.generate(content);
      engineRef.current.loadLevel(levelData.entities);
      
      // Check for deep link
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.slice(1);
        const params = new URLSearchParams(hash);
        const section = params.get('section') || params.get('zone');
        if (section && levelData.bookmarks[section]) {
          // Warp player to section
          engineRef.current.player.x = levelData.bookmarks[section];
          engineRef.current.gameState.camera.x = Math.max(0, levelData.bookmarks[section] - 300);
        }
      }
    }

    // Resize Handling
    const handleResize = () => {
      if (canvasRef.current && engineRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        engineRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    // Game Loop
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      if (engineRef.current) {
        engineRef.current.handleInput(keys.current);
        engineRef.current.update(dt);
        engineRef.current.render();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [content]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-sky-400 font-mono" role="application" aria-label="Retro platformer game - Use arrow keys to move, space to jump">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 block cursor-pointer"
        aria-label="Game canvas - Interactive retro platformer"
        tabIndex={0}
        onClick={(e) => {
          const engine = engineRef.current;
          if (!engine) return;
          
          // Get click position relative to canvas
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          if (engine.gameState.phase === 'intro') {
            engine.startGame();
          } else if (engine.gameState.phase === 'victory') {
            engine.handleVictoryClick(x, y);
          }
        }}
      />
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
        <div>
          {/* Engine handles Score/Coin rendering, but we can add meta-ui here */}
        </div>
        
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={handleToggleMute}
            className="px-3 py-2 bg-gray-800/90 border-2 border-black text-white font-bold hover:bg-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all text-xl"
            title={isMuted ? "Unmute" : "Mute"}
            aria-label={isMuted ? "Unmute game audio" : "Mute game audio"}
            aria-pressed={isMuted}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <a 
            href="/resume/Smeet_Kumar_Patel_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-yellow-400/90 border-2 border-black text-black font-bold hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1"
            aria-label="View or download resume"
          >
            📄 CV
          </a>
          <button 
            onClick={onSwitchMode}
            className="px-4 py-2 bg-white/90 border-2 border-black text-black font-bold hover:bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            aria-label="Switch to Professional mode"
          >
            PROFESSIONAL
          </button>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-red-500/90 border-2 border-black text-white font-bold hover:bg-red-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            aria-label="Exit game and return to landing page"
          >
            EXIT
          </button>
        </div>
      </div>

      {/* Mobile Controls (D-Pad & Action) */}
      <div className="absolute bottom-8 left-0 right-0 px-8 flex justify-between items-end md:hidden pointer-events-auto select-none" role="group" aria-label="Mobile game controls">
        {/* D-Pad */}
        <div className="flex gap-3" role="group" aria-label="Direction controls">
          <button
            className="w-20 h-20 bg-white/30 border-3 border-white/60 rounded-full backdrop-blur-sm active:bg-white/50 active:scale-90 transition-all flex items-center justify-center shadow-lg"
            aria-label="Move left"
            onTouchStart={(e) => { 
              e.preventDefault(); 
              keys.current.left = true;
              if (navigator.vibrate) navigator.vibrate(10);
            }}
            onTouchEnd={(e) => { e.preventDefault(); keys.current.left = false; }}
          >
            <span className="text-4xl text-white font-bold">◀</span>
          </button>
          <button
            className="w-20 h-20 bg-white/30 border-3 border-white/60 rounded-full backdrop-blur-sm active:bg-white/50 active:scale-90 transition-all flex items-center justify-center shadow-lg"
            aria-label="Move right"
            onTouchStart={(e) => { 
              e.preventDefault(); 
              keys.current.right = true;
              if (navigator.vibrate) navigator.vibrate(10);
            }}
            onTouchEnd={(e) => { e.preventDefault(); keys.current.right = false; }}
          >
            <span className="text-4xl text-white font-bold">▶</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          className="w-24 h-24 bg-red-500/90 border-4 border-red-300 rounded-full shadow-xl active:scale-90 active:bg-red-400 transition-all flex items-center justify-center"
          aria-label="Jump"
          onTouchStart={(e) => { 
            e.preventDefault(); 
            keys.current.jump = true;
            if (navigator.vibrate) navigator.vibrate(15);
          }}
          onTouchEnd={(e) => { e.preventDefault(); keys.current.jump = false; }}
        >
          <span className="text-4xl text-white font-bold">▲</span>
        </button>
      </div>
    </div>
  );
}
