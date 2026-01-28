"use client";

import { cn } from "@/lib/utils";

interface HolographicOverlayProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export function HolographicOverlay({ children, active = true, className }: HolographicOverlayProps) {
  return (
    <div className={cn("relative overflow-hidden group", className)}>
      {/* Scanline Effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-10"
        style={{
          background: "linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 51%)",
          backgroundSize: "100% 4px"
        }}
      />
      
      {/* Moving Scan Bar */}
      {active && (
        <div 
          className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[20%] w-full animate-[scan_3s_linear_infinite]" 
        />
      )}

      {/* CRT Flicker (Subtle) */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-cyan-500/5 opacity-0 animate-[flicker_0.1s_infinite]" />

      {/* Content */}
      <div className="relative z-0">
        {children}
      </div>

      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-sm" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-sm" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-sm" />
    </div>
  );
}
