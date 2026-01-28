"use client";

import { useEffect, useRef } from "react";

export function CyberGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      frame++;
      ctx.fillStyle = "#020617"; // Slate-950
      ctx.fillRect(0, 0, width, height);

      // Grid settings
      const gridSize = 60;
      
      // Draw grid lines
      ctx.strokeStyle = "rgba(30, 41, 59, 0.5)"; // Slate-800
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Animated "Data Pulses" traveling along grid lines
      const pulseSpeed = 2;
      const numPulses = 15;
      
      for (let i = 0; i < numPulses; i++) {
        const offset = (frame * pulseSpeed + i * 100) % (width + height);
        
        // Randomly decide horizontal or vertical for this pulse index (deterministic per index)
        const isVertical = i % 2 === 0;
        const track = (i * gridSize * 3) % (isVertical ? width : height);
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(34, 211, 238, 0.8)"; // Cyan
        ctx.fillStyle = "rgba(34, 211, 238, 0.6)";
        
        if (isVertical) {
          const y = offset % height;
          ctx.fillRect(track - 1, y, 3, 20);
        } else {
          const x = offset % width;
          ctx.fillRect(x, track - 1, 20, 3);
        }
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(draw);
    };

    const animationId = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
    />
  );
}
