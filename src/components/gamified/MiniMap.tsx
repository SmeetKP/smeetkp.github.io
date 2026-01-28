"use client";

import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

export type MapItem = {
  id: string;
  name: string;
  x: number;
  y: number;
  kind: "zone" | "artifact";
  icon: string;
};

export type MiniMapTeleportTarget = {
  x: number;
  y: number;
  focusId?: string;
};

export default function MiniMap({
  open,
  onClose,
  items,
  visited,
  collected,
  player,
  onTeleport,
  allowTeleport,
}: {
  open: boolean;
  onClose: () => void;
  items: MapItem[];
  visited: Set<string>;
  collected: Set<string>;
  player: { x: number; y: number };
  onTeleport: (target: MiniMapTeleportTarget) => void;
  allowTeleport: boolean;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const zones = useMemo(() => items.filter((i) => i.kind === "zone"), [items]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="System Topology"
    >
      <div
        className="w-full max-w-4xl border border-cyan-500/30 bg-slate-900 shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Corner Markers */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-500" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-500" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <div className="text-cyan-500 font-mono font-bold tracking-widest uppercase text-sm">
              {"// System Topology"}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              NETWORK VISUALIZATION :: INTERACTIVE
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-950 transition-colors border border-transparent hover:border-cyan-500/30"
            aria-label="Close map"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Map Container */}
          <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 overflow-hidden group">
            {/* Grid Background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #1e293b 1px, transparent 1px),
                  linear-gradient(to bottom, #1e293b 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px"
              }}
            />
            
            {/* Radar Scan Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent h-[10%] w-full animate-[scan_4s_linear_infinite] pointer-events-none border-b border-cyan-500/20" />

            <div className="absolute inset-0">
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {items.filter(i => i.kind === 'zone').map(item => {
                  if (item.id === 'about') return null;
                  const center = items.find(i => i.id === 'about');
                  if (!center) return null;
                  
                  return (
                    <line 
                      key={`line-${item.id}`}
                      x1={`${center.x}%`} y1={`${center.y}%`}
                      x2={`${item.x}%`} y2={`${item.y}%`}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>

              {items.map((item) => {
                const found = item.kind === "zone" ? visited.has(item.id) : collected.has(item.id);
                const canTeleport = allowTeleport && item.kind === "zone" && visited.has(item.id);
                
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (!canTeleport) return;
                      onTeleport({ x: item.x, y: item.y, focusId: item.id });
                    }}
                    className={cn(
                      "absolute flex flex-col items-center justify-center transition-all duration-300",
                      canTeleport ? "cursor-pointer hover:scale-110" : "cursor-default grayscale opacity-50"
                    )}
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 10
                    }}
                  >
                    {/* Node Visual */}
                    <div className={cn(
                      "w-4 h-4 border-2 rotate-45 transition-colors duration-300",
                      found 
                        ? "bg-slate-900 border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                        : "bg-slate-900 border-slate-700"
                    )}>
                      {found && <div className="absolute inset-0 bg-cyan-400/20 animate-pulse" />}
                    </div>
                    
                    {/* Label */}
                    <div className={cn(
                      "absolute top-6 whitespace-nowrap text-[10px] font-mono tracking-wider px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm border",
                      found ? "text-cyan-400 border-cyan-500/30" : "text-slate-600 border-slate-800"
                    )}>
                      {item.name.toUpperCase()}
                    </div>
                  </button>
                );
              })}

              {/* Player Position */}
              <div
                className="absolute"
                style={{
                  left: `${player.x}%`,
                  top: `${player.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 20
                }}
              >
                <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse" />
                <div className="absolute inset-0 border border-white/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <div className="flex gap-4">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 border border-cyan-500 rotate-45 bg-slate-900" />
                Active Node
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 border border-slate-700 rotate-45 bg-slate-900" />
                Inactive/Unknown
              </span>
            </div>
            <div>
              [STATUS: {visited.size}/{zones.length} NODES ONLINE]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
