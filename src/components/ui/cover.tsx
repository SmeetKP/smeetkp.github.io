"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";

export const Cover = ({
  children,
  className,
  mode = "always",
}: {
  children?: React.ReactNode;
  className?: string;
  mode?: "hover" | "always";
}) => {
  const [hovered, setHovered] = useState(false);

  const active = mode === "always" ? true : hovered;

  return (
    <span
      onMouseEnter={mode === "hover" ? () => setHovered(true) : undefined}
      onMouseLeave={mode === "hover" ? () => setHovered(false) : undefined}
      className="relative inline-flex overflow-hidden rounded-md border border-white/10 bg-neutral-950/85 px-2 py-1 align-middle"
    >
      {active && (
        <span className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
          <motion.span
            animate={{ translateX: ["-50%", "0%"] }}
            transition={{
              translateX: {
                duration: 2.2,
                ease: "linear",
                repeat: Infinity,
              },
            }}
            className="flex h-full w-[200%]"
          >
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={180}
              speed={18}
              className="h-full w-full"
              particleColor="#FFFFFF"
            />
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={180}
              speed={18}
              className="h-full w-full"
              particleColor="#FFFFFF"
            />
          </motion.span>
        </span>
      )}

      <motion.span
        key={String(active)}
        animate={active ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        exit={{
          filter: "none",
          scale: 1,
          x: 0,
          y: 0,
        }}
        transition={{
          duration: 1.6,
          repeat: active ? Infinity : 0,
          ease: "easeInOut",
        }}
        className={cn(
          "relative z-10 inline-block text-slate-50",
          className
        )}
      >
        {children}
      </motion.span>

      <CircleIcon className="absolute -right-[2px] -top-[2px]" />
      <CircleIcon className="absolute -bottom-[2px] -right-[2px]" delay={0.4} />
      <CircleIcon className="absolute -left-[2px] -top-[2px]" delay={0.8} />
      <CircleIcon className="absolute -bottom-[2px] -left-[2px]" delay={1.6} />
    </span>
  );
};

export const Beam = ({
  className,
  delay = 1,
  duration = 2,
  hovered,
  ...divProps
}: {
  className?: string;
  delay?: number;
  duration?: number;
  hovered?: boolean;
} & React.ComponentProps<typeof motion.div>) => {
  return (
    <motion.div
      className={cn("absolute inset-x-0 h-px w-full", className)}
      style={{ opacity: hovered ? 0.8 : 0.35, ...divProps.style }}
      {...divProps}
    >
      <motion.div
        className="h-px w-[200%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(46,185,223,0) 0%, rgba(59,130,246,1) 50%, rgba(59,130,246,0) 100%)",
        }}
        animate={{ x: ["-50%", "0%"] }}
        transition={{
          duration: hovered ? 0.5 : duration,
          ease: "linear",
          repeat: Infinity,
          delay: hovered ? 0.2 : delay,
          repeatDelay: hovered ? 0.8 : delay,
        }}
      />
    </motion.div>
  );
};

export const CircleIcon = ({
  className,
}: {
  className?: string;
  delay?: number;
}) => {
  return (
    <span
      className={cn(
        "pointer-events-none h-2 w-2 animate-pulse rounded-full bg-neutral-600 opacity-20 dark:bg-white",
        className
      )}
    ></span>
  );
};
