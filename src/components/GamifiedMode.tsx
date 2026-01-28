"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useContent } from "../hooks/useContent";
import { CyberGrid } from "@/components/gamified/CyberGrid";
import { DataMonolith } from "@/components/gamified/DataMonolith";
import { ArchitectAvatar } from "@/components/gamified/ArchitectAvatar";
import { CodeRainBackground } from "@/components/gamified/CodeRainBackground";
import MiniMap, { type MapItem } from "@/components/gamified/MiniMap";
import { AnimatePresence, motion } from "framer-motion";
import { useCyberSound } from "../hooks/useCyberSound";

interface GamifiedModeProps {
  onSwitchMode: () => void;
  onBack: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Zone {
  id: string;
  name: string;
  x: number;
  y: number;
  content: {
    title: string;
    subtitle: string;
    items: string[];
  };
}

export default function GamifiedMode({ onSwitchMode, onBack }: GamifiedModeProps) {
  const { content } = useContent();

  const MIN_X = 5;
  const MAX_X = 95;
  const MIN_Y = 10;
  const MAX_Y = 90;

  // Define the Network Nodes (Zones)
  const ZONES: Zone[] = useMemo(() => [
    {
      id: "about",
      name: "Identity Core",
      x: 50,
      y: 50,
      content: {
        title: "System Identity",
        subtitle: content.profile.role,
        items: content.profile.attributes,
      },
    },
    {
      id: "experience",
      name: "Ops History",
      x: 20,
      y: 30,
      content: {
        title: "Operations History",
        subtitle: "Execution Logs",
        items: content.experience.slice(0, 4).map(exp => `${exp.company} // ${exp.role}`),
      },
    },
    {
      id: "projects",
      name: "Output Array",
      x: 80,
      y: 30,
      content: {
        title: "Output Array",
        subtitle: "Deployed Solutions",
        items: content.projects.map(p => `${p.title} :: ${p.subtitle}`),
      },
    },
    {
      id: "skills",
      name: "Tech Stack",
      x: 20,
      y: 70,
      content: {
        title: "Technical Stack",
        subtitle: "Capabilities",
        items: content.skills.map(s => `${s.category} [${s.items.slice(0, 3).join(", ")}]`),
      },
    },
    {
      id: "contact",
      name: "Uplink",
      x: 80,
      y: 70,
      content: {
        title: "Comm Uplink",
        subtitle: "Open Channels",
        items: [
          content.contact.email,
          content.contact.linkedin,
          content.contact.location,
        ],
      },
    },
  ], [content]);

  const [position, setPosition] = useState<Position>({ x: 50, y: 80 });
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const [visitedZones, setVisitedZones] = useState<Set<string>>(new Set(["about"])); // Start with Identity unlocked
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { play } = useCyberSound();
  
  // Movement State
  const [isMoving, setIsMoving] = useState(false);
  const [droneAngle, setDroneAngle] = useState(0);
  
  // Refs for loop
  const positionRef = useRef<Position>({ x: 50, y: 80 });
  const velocityRef = useRef<Position>({ x: 0, y: 0 });
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrame = useRef<number>(0);
  const activeZoneRef = useRef<Zone | null>(null);

  // Sync refs
  useEffect(() => {
    activeZoneRef.current = activeZone;
  }, [activeZone]);

  // Mobile Detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMobilePress = useCallback((key: string) => {
    keysPressed.current.add(key);
  }, []);

  const handleMobileRelease = useCallback((key: string) => {
    keysPressed.current.delete(key);
  }, []);

  const teleportTo = useCallback((target: Position) => {
    play("warp");
    positionRef.current = target;
    setPosition(target);
  }, [play]);

  // Game Loop - The Neural Engine
  useEffect(() => {
    const SPEED = 35; // Slightly slower base speed for "weight"
    const FRICTION = 0.92; // Low friction for "gliding" feel (drift)
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      if (activeZoneRef.current || isMapOpen) {
        animationFrame.current = requestAnimationFrame(loop);
        return;
      }

      // Input handling
      let dx = 0;
      let dy = 0;
      
      if (keysPressed.current.has("ArrowLeft") || keysPressed.current.has("a")) dx -= 1;
      if (keysPressed.current.has("ArrowRight") || keysPressed.current.has("d")) dx += 1;
      if (keysPressed.current.has("ArrowUp") || keysPressed.current.has("w")) dy -= 1;
      if (keysPressed.current.has("ArrowDown") || keysPressed.current.has("s")) dy += 1;

      // Normalize input
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
        
        // Update Angle
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        setDroneAngle(angle);
      }

      // Physics (Simplified for Drone)
      let vx = velocityRef.current.x;
      let vy = velocityRef.current.y;

      // Acceleration
      if (dx !== 0 || dy !== 0) {
        vx += dx * SPEED * 2 * dt; // High accel
        vy += dy * SPEED * 2 * dt;
      }

      // Friction / Drag
      vx *= FRICTION;
      vy *= FRICTION;

      // Update Position
      let x = positionRef.current.x + vx * dt;
      let y = positionRef.current.y + vy * dt;

      // Clamp
      x = Math.max(MIN_X, Math.min(MAX_X, x));
      y = Math.max(MIN_Y, Math.min(MAX_Y, y));

      positionRef.current = { x, y };
      velocityRef.current = { x: vx, y: vy };

      // State updates (throttled/diffed)
      setPosition({ x, y });
      
      const moving = Math.hypot(vx, vy) > 0.1;
      if (moving !== isMoving) setIsMoving(moving);

      animationFrame.current = requestAnimationFrame(loop);
    };

    animationFrame.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame.current);
  }, [isMoving, isMapOpen]);

  // Input Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      keysPressed.current.add(e.key); // Handle Case sensitivity

      if (e.key === "m") {
        setIsMapOpen(prev => !prev);
        play("click");
      }
      if (e.key === "Escape") {
        if (activeZoneRef.current) play("click");
        setActiveZone(null);
        setIsMapOpen(false);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
      keysPressed.current.delete(e.key);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [play]);

  // Interaction Check
  const nearZone = useMemo(() => {
    return ZONES.find(z => {
      const dist = Math.hypot(position.x - z.x, position.y - z.y);
      return dist < 8; // Activation radius
    });
  }, [position, ZONES]);

  // Spacebar Interaction
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && nearZone && !activeZone) {
        play("success");
        setActiveZone(nearZone);
        setVisitedZones(prev => new Set([...prev, nearZone.id]));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nearZone, activeZone, play]);

  // Map Data
  const mapItems: MapItem[] = useMemo(() => ZONES.map(z => ({
    id: z.id,
    name: z.name,
    x: z.x,
    y: z.y,
    kind: "zone",
    icon: z.name.slice(0, 2).toUpperCase(),
  })), [ZONES]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-cyan-500 font-mono select-none">
      {/* 1. Environment Layer: Code Rain & Grid */}
      <div className="absolute inset-0 z-0">
        <CodeRainBackground />
        <div className="absolute inset-0 opacity-50 mix-blend-screen">
            <CyberGrid />
        </div>
      </div>
      
      {/* 2. Connection Lines (Data Streams) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-40">
        {ZONES.map((z) => {
           if (z.id === "about") return null;
           const center = ZONES.find(x => x.id === "about");
           if (!center) return null;
           
           const visited = visitedZones.has(z.id);
           
           return (
             <line 
               key={z.id}
               x1={`${center.x}%`} y1={`${center.y}%`}
               x2={`${z.x}%`} y2={`${z.y}%`}
               stroke={visited ? "#22d3ee" : "#334155"}
               strokeWidth={visited ? 2 : 1}
               strokeDasharray={visited ? "none" : "5,5"}
               className="transition-all duration-1000"
             />
           );
        })}
      </svg>

      {/* 3. Objects Layer: Data Monoliths */}
      {ZONES.map(zone => (
        <DataMonolith
          key={zone.id}
          id={zone.id}
          name={zone.name}
          x={zone.x}
          y={zone.y}
          isActive={activeZone?.id === zone.id}
          isVisited={visitedZones.has(zone.id)}
          playerPos={position}
          onClick={() => {
            play("success");
            // Teleport slightly below to face the monolith
            teleportTo({ x: zone.x, y: zone.y + 8 });
            setActiveZone(zone);
            setVisitedZones(prev => new Set([...prev, zone.id]));
          }}
        />
      ))}

      {/* 4. Player Layer: The Architect */}
      <ArchitectAvatar 
        x={position.x} 
        y={position.y} 
        isMoving={isMoving} 
        angle={droneAngle}
      />

      {/* 5. HUD Layer */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-40 pointer-events-none">
        {/* Top Left: System Status */}
        <div className="bg-slate-950/40 border-l-2 border-cyan-500 pl-4 py-2 backdrop-blur-sm pointer-events-auto">
          <div className="text-[10px] text-cyan-500/60 tracking-widest uppercase mb-1">Construct Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]" />
            <span className="text-white font-bold tracking-wider text-sm">ARCHITECT ONLINE</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 font-mono">
            SECTOR: {Math.floor(position.x / 10)}-{Math.floor(position.y / 10)} :: NODES: {visitedZones.size}/{ZONES.length}
          </div>
        </div>

        {/* Top Right: Controls */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <button 
            onClick={() => {
              play("click");
              onBack();
            }}
            onMouseEnter={() => play("hover")}
            className="group px-4 py-2 bg-transparent hover:bg-slate-900/50 border border-transparent hover:border-slate-500/30 text-slate-500 hover:text-white transition-all text-xs tracking-widest uppercase"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">←</span>
            <span className="group-hover:ml-2 transition-all">Back</span>
          </button>
          <button 
            onClick={() => {
              play("click");
              onSwitchMode();
            }}
            onMouseEnter={() => play("hover")}
            className="group px-4 py-2 bg-transparent hover:bg-slate-900/50 border border-transparent hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-all text-xs tracking-widest uppercase"
          >
            <span className="group-hover:mr-2 transition-all">Professional Mode</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
          <a 
            href="/resume/Smeet_Kumar_Patel_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => play("click")}
            onMouseEnter={() => play("hover")}
            className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-white transition-all text-xs tracking-widest uppercase backdrop-blur-sm flex items-center gap-2"
            aria-label="View or download resume"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Resume
          </a>
          <button 
             onClick={() => {
               play("click");
               setIsMapOpen(true);
             }}
             onMouseEnter={() => play("hover")}
             className="px-4 py-2 bg-slate-900/50 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all text-xs tracking-widest uppercase backdrop-blur-sm"
          >
            Topology [M]
          </button>
        </div>
      </div>

      {/* Mobile Controls */}
      {isMobile && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 pointer-events-auto">
          <div className="flex flex-col items-center gap-2">
            <button
              className="w-16 h-16 bg-slate-900/50 border-2 border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 text-2xl active:bg-cyan-500/20 backdrop-blur-md shadow-lg"
              onPointerDown={() => handleMobilePress("ArrowUp")}
              onPointerUp={() => handleMobileRelease("ArrowUp")}
              onPointerLeave={() => handleMobileRelease("ArrowUp")}
            >
              ▲
            </button>
            <div className="flex gap-10">
              <button
                className="w-16 h-16 bg-slate-900/50 border-2 border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 text-2xl active:bg-cyan-500/20 backdrop-blur-md shadow-lg"
                onPointerDown={() => handleMobilePress("ArrowLeft")}
                onPointerUp={() => handleMobileRelease("ArrowLeft")}
                onPointerLeave={() => handleMobileRelease("ArrowLeft")}
              >
                ◀
              </button>
              <button
                className="w-16 h-16 bg-slate-900/50 border-2 border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 text-2xl active:bg-cyan-500/20 backdrop-blur-md shadow-lg"
                onPointerDown={() => handleMobilePress("ArrowRight")}
                onPointerUp={() => handleMobileRelease("ArrowRight")}
                onPointerLeave={() => handleMobileRelease("ArrowRight")}
              >
                ▶
              </button>
            </div>
            <button
              className="w-16 h-16 bg-slate-900/50 border-2 border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 text-2xl active:bg-cyan-500/20 backdrop-blur-md shadow-lg"
              onPointerDown={() => handleMobilePress("ArrowDown")}
              onPointerUp={() => handleMobileRelease("ArrowDown")}
              onPointerLeave={() => handleMobileRelease("ArrowDown")}
            >
              ▼
            </button>
          </div>
          
          {/* Action Button */}
          <div className="flex gap-4">
             <button
               className={`px-8 py-4 rounded-full font-bold tracking-wider border transition-all backdrop-blur-md ${
                 nearZone 
                   ? "bg-cyan-500 text-slate-900 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)]" 
                   : "bg-slate-900/50 text-slate-500 border-slate-700"
               }`}
               onClick={() => {
                 play("click");
                 if (nearZone && !activeZone) {
                    play("success");
                    setActiveZone(nearZone);
                    setVisitedZones(prev => new Set([...prev, nearZone.id]));
                 }
               }}
             >
               ACCESS DATA
             </button>
          </div>
        </div>
      )}

      {/* Bottom Center: Interaction Prompt */}
      <AnimatePresence>
        {nearZone && !activeZone && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
             <div className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 px-8 py-3 font-bold tracking-wider shadow-[0_0_30px_rgba(34,211,238,0.2)] backdrop-blur-md animate-pulse">
               PRESS [SPACE] TO ACCESS
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Modal / Terminal Interface */}
      <AnimatePresence>
        {activeZone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="w-full max-w-3xl bg-slate-900/90 border border-cyan-500/20 shadow-[0_0_100px_rgba(34,211,238,0.1)] overflow-hidden"
             >
               {/* Terminal Header */}
               <div className="h-10 bg-slate-950 border-b border-cyan-900/50 flex items-center justify-between px-6">
                 <div className="flex items-center gap-2 opacity-50">
                   <div className="w-3 h-3 rounded-full bg-slate-700" />
                   <div className="w-3 h-3 rounded-full bg-slate-700" />
                   <div className="w-3 h-3 rounded-full bg-slate-700" />
                 </div>
                 <div className="text-xs text-cyan-500/50 tracking-[0.2em]">SECURE_CONNECTION :: {activeZone.id.toUpperCase()}</div>
               </div>

               {/* Terminal Body */}
               <div className="p-8 md:p-12 relative">
                 {/* Background decoration */}
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <div className="text-9xl font-bold text-cyan-500">
                        {activeZone.name.charAt(0)}
                    </div>
                 </div>

                 <h2 className="text-4xl text-white font-light mb-2 tracking-tight">
                   {activeZone.content.title}
                 </h2>
                 <p className="text-cyan-500 mb-10 font-mono text-sm uppercase tracking-widest border-l-2 border-cyan-500 pl-4">
                   {activeZone.content.subtitle}
                 </p>

                 <div className="space-y-6">
                   {activeZone.content.items.map((item, i) => (
                     <div key={i} className="flex items-start gap-4 group">
                       <span className="text-slate-600 font-mono text-sm pt-1 group-hover:text-cyan-500 transition-colors">
                           {i.toString().padStart(2, '0')}
                       </span>
                       <p className="text-slate-300 text-lg font-light leading-relaxed group-hover:text-white transition-colors">
                           {item}
                       </p>
                     </div>
                   ))}
                 </div>

                 <div className="mt-12 pt-8 border-t border-slate-800/50 flex justify-between items-center">
                   <div className="text-xs text-slate-600 font-mono">
                       DATA_INTEGRITY: 100%
                   </div>
                   <button 
                     onClick={() => {
                       play("click");
                       setActiveZone(null);
                     }}
                     onMouseEnter={() => play("hover")}
                     className="px-8 py-3 bg-white text-slate-950 font-bold hover:bg-cyan-400 transition-colors uppercase tracking-widest text-sm"
                   >
                     Close Stream
                   </button>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MiniMap 
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        items={mapItems}
        visited={visitedZones}
        collected={new Set()}
        player={position}
        onTeleport={(t) => teleportTo({x: t.x, y: t.y})}
        allowTeleport={true}
      />
    </div>
  );
}
