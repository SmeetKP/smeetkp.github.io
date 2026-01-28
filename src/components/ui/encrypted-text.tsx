"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface EncryptedTextProps {
  text: string;
  encryptedClassName?: string;
  revealedClassName?: string;
  revealDelayMs?: number;
  className?: string;
  onComplete?: () => void;
}

export const EncryptedText: React.FC<EncryptedTextProps> = ({
  text,
  encryptedClassName = "text-neutral-500",
  revealedClassName = "text-white",
  revealDelayMs = 50,
  className,
  onComplete,
}) => {
  // Use text as part of the key to reset state when text changes
  // This component should be keyed by text at the parent level for proper reset
  const [revealedCount, setRevealedCount] = useState(0);
  const [scrambleTick, setScrambleTick] = useState(0);
  const hasCompletedRef = useRef(false);

  // Scramble tick interval (triggers re-render for random chars)
  useEffect(() => {
    const intervalId = setInterval(() => {
      setScrambleTick(t => t + 1);
    }, 40);
    return () => clearInterval(intervalId);
  }, []);

  // Reveal interval
  useEffect(() => {
    if (revealedCount >= text.length) {
      if (!hasCompletedRef.current && onComplete) {
        hasCompletedRef.current = true;
        onComplete();
      }
      return;
    }

    const timeoutId = setTimeout(() => {
      setRevealedCount(c => c + 1);
    }, revealDelayMs);

    return () => clearTimeout(timeoutId);
  }, [revealedCount, text.length, revealDelayMs, onComplete]);

  // Deterministic pseudo-random based on index and tick (avoids Math.random during render)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const seededChar = (idx: number, tick: number) => {
    const x = Math.sin((idx + 1) * 9.8 + tick * 0.1) * 10000;
    const rand = x - Math.floor(x);
    return chars[Math.floor(rand * chars.length)];
  };

  const displayText = text.split("").map((char, idx) => {
    if (idx < revealedCount) return text[idx];
    if (char === " ") return " ";
    return seededChar(idx, scrambleTick);
  });

  return (
    <span className={cn("inline-block", className)}>
      {displayText.map((char, index) => (
        <span
          key={index}
          className={cn(
            "transition-all duration-150",
            index < revealedCount ? revealedClassName : encryptedClassName
          )}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default EncryptedText;
