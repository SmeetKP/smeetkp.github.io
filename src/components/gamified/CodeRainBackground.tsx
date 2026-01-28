"use client";

import { useEffect, useRef } from "react";

export const CodeRainBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId: number;

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$<>[]{}";
    const fontSize = 14;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      columns = Math.floor(width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        // Random start positions to avoid "curtain" effect on resize
        drops[i] = Math.random() * -100;
      }
    };

    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      // Trail effect: minimal opacity fade for "ghosting"
      ctx.fillStyle = "rgba(2, 6, 23, 0.05)"; // slate-950 with very low opacity
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        
        // Color variation: mostly dim cyan, occasionally bright white/cyan
        const isBright = Math.random() > 0.975;
        if (isBright) {
          ctx.fillStyle = "#fff"; // White tip
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#22d3ee"; // Cyan glow
        } else {
          ctx.fillStyle = "#0e7490"; // Cyan-700 (dimmer)
          ctx.shadowBlur = 0;
        }

        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        // Reset drop to top randomly or if off screen
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0"
    />
  );
};
