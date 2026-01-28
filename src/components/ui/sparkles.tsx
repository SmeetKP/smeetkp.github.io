"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

export const SparklesCore = (props: ParticlesProps) => {
  const {
    className,
    background,
    minSize = 0.4,
    maxSize = 1,
    speed = 4,
    particleColor = "#ffffff",
    particleDensity = 120,
  } = props;

  const particles = useMemo(() => {
    const count = Math.max(12, Math.min(240, particleDensity));
    const sizeRange = Math.max(0.01, maxSize - minSize);

    return Array.from({ length: count }, (_, i) => {
      const x = (i * 37) % 100;
      const y = (i * 53) % 100;
      const s = minSize + (((i * 19) % 100) / 100) * sizeRange;
      const d = (((i * 29) % 100) / 100) * 2;
      const o = 0.35 + (((i * 11) % 100) / 100) * 0.65;

      return { x, y, s, d, o };
    });
  }, [particleDensity, minSize, maxSize]);

  const duration = Math.max(0.35, 2.8 - speed * 0.12);

  return (
    <span
      className={cn("relative block h-full w-full overflow-hidden", className)}
      style={{ background: background ?? "transparent" }}
    >
      {particles.map((p, idx) => (
        <motion.span
          key={idx}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.s * 2}px`,
            height: `${p.s * 2}px`,
            background: particleColor,
            opacity: p.o,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            opacity: [0, p.o, 0],
            scale: [0.6, 1, 0.6],
          }}
          transition={{
            duration,
            delay: p.d,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
};
