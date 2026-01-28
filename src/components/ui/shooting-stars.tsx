"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
}

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}

const getRandomStartPoint = () => {
  const side = Math.floor(Math.random() * 4);
  const offset = Math.random() * window.innerWidth;

  switch (side) {
    case 0: // Top
      return { x: offset, y: 0, angle: 45 };
    case 1: // Right
      return { x: window.innerWidth, y: offset, angle: 135 };
    case 2: // Bottom
      return { x: offset, y: window.innerHeight, angle: 225 };
    case 3: // Left
      return { x: 0, y: offset, angle: 315 };
    default:
      return { x: 0, y: 0, angle: 45 };
  }
};

export const ShootingStars: React.FC<ShootingStarsProps> = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1,
  className,
}) => {
  const [star, setStar] = useState<ShootingStar | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const createStar = () => {
      const { x, y, angle } = getRandomStartPoint();
      const newStar: ShootingStar = {
        id: Date.now(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
      };
      setStar(newStar);

      // Calculate how long the star should be visible based on screen diagonal
      const maxDistance = Math.sqrt(
        Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)
      );
      const duration = maxDistance / newStar.speed;

      // Remove star after it travels across screen
      setTimeout(() => {
        setStar(null);
      }, duration * 50);
    };

    const scheduleNextStar = () => {
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      return setTimeout(() => {
        createStar();
        scheduleNextStar();
      }, delay);
    };

    // Initial star
    createStar();
    const timeoutId = scheduleNextStar();

    return () => clearTimeout(timeoutId);
  }, [minSpeed, maxSpeed, minDelay, maxDelay]);

  useEffect(() => {
    if (!star) return;

    const moveStar = () => {
      setStar((prevStar) => {
        if (!prevStar) return null;
        const newX =
          prevStar.x +
          prevStar.speed * Math.cos((prevStar.angle * Math.PI) / 180);
        const newY =
          prevStar.y +
          prevStar.speed * Math.sin((prevStar.angle * Math.PI) / 180);
        const newDistance = prevStar.distance + prevStar.speed;

        // Check if star is out of bounds
        if (
          newX < -100 ||
          newX > window.innerWidth + 100 ||
          newY < -100 ||
          newY > window.innerHeight + 100
        ) {
          return null;
        }

        return {
          ...prevStar,
          x: newX,
          y: newY,
          distance: newDistance,
        };
      });
    };

    const animationFrame = requestAnimationFrame(moveStar);
    return () => cancelAnimationFrame(animationFrame);
  }, [star]);

  return (
    <svg ref={svgRef} className={cn("w-full h-full absolute inset-0 pointer-events-none", className)}>
      {star && (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * 20}
          height={starHeight * 2}
          fill={`url(#gradient-${star.id})`}
          transform={`rotate(${star.angle}, ${star.x + (starWidth * 20) / 2}, ${star.y + starHeight})`}
        />
      )}
      {star && (
        <defs>
          <linearGradient
            id={`gradient-${star.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
            <stop offset="30%" style={{ stopColor: trailColor, stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
};

export default ShootingStars;
