"use client";

import { useSyncExternalStore } from "react";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

interface CalmBackgroundProps {
  isDarkMode: boolean;
  variant?: "default" | "minimal" | "arctic";
  showShootingStars?: boolean;
  minimal?: boolean;
}

export default function CalmBackground({ 
  isDarkMode, 
  variant = "default",
  showShootingStars = true,
  minimal = false,
}: CalmBackgroundProps) {
  // Use useSyncExternalStore for hydration-safe mounted detection
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null;


  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient - very subtle */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
            : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
        }`}
      />


      {/* Aceternity UI Shooting Stars and Stars Background - disabled in minimal mode */}
      {!minimal && showShootingStars && isDarkMode && (
        <>
          <StarsBackground 
            starDensity={0.0002}
            allStarsTwinkle={true}
            twinkleProbability={0.8}
            minTwinkleSpeed={0.5}
            maxTwinkleSpeed={1.5}
          />
          <ShootingStars
            minSpeed={15}
            maxSpeed={35}
            minDelay={2000}
            maxDelay={5000}
            starColor="#FFFFFF"
            trailColor="#2EB9DF"
            starWidth={15}
            starHeight={2}
          />
        </>
      )}

      {/* Background Beams with Collision - disabled in minimal mode */}
      {!minimal && isDarkMode && (
        <div className="absolute inset-0 pointer-events-none">
          <BackgroundBeamsWithCollision className="absolute inset-0 bg-transparent">
            <></>
          </BackgroundBeamsWithCollision>
        </div>
      )}

      {/* Mesh gradient blobs - very slow, subtle movement */}
      <div className="absolute inset-0">
        {/* Primary blob - top left */}
        <div
          className={`absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] animate-mesh-1 ${
            isDarkMode
              ? "bg-gradient-to-br from-blue-900/30 to-indigo-900/20"
              : "bg-gradient-to-br from-blue-200/40 to-indigo-200/30"
          }`}
        />

        {/* Secondary blob - bottom right */}
        <div
          className={`absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full blur-[140px] animate-mesh-2 ${
            isDarkMode
              ? "bg-gradient-to-tl from-purple-900/25 to-slate-900/20"
              : "bg-gradient-to-tl from-purple-200/30 to-slate-200/20"
          }`}
        />

        {/* Tertiary blob - center */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] animate-mesh-3 ${
            isDarkMode
              ? "bg-gradient-to-r from-cyan-900/15 to-blue-900/15"
              : "bg-gradient-to-r from-cyan-200/20 to-blue-200/20"
          }`}
        />

        {/* Arctic variant - additional cool tones */}
        {variant === "arctic" && (
          <>
            <div
              className={`absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] animate-mesh-4 ${
                isDarkMode
                  ? "bg-gradient-to-b from-cyan-800/20 to-transparent"
                  : "bg-gradient-to-b from-cyan-300/25 to-transparent"
              }`}
            />
            <div
              className={`absolute bottom-1/4 left-0 w-[350px] h-[350px] rounded-full blur-[80px] animate-mesh-5 ${
                isDarkMode
                  ? "bg-gradient-to-tr from-teal-900/15 to-transparent"
                  : "bg-gradient-to-tr from-teal-200/20 to-transparent"
              }`}
            />
          </>
        )}
      </div>

      {/* Subtle dot pattern overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isDarkMode ? "opacity-[0.03]" : "opacity-[0.04]"
        }`}
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${
            isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)"
          } 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Very subtle noise texture */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isDarkMode ? "opacity-[0.015]" : "opacity-[0.02]"
        }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle vignette effect */}
      <div
        className={`absolute inset-0 ${
          isDarkMode
            ? "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]"
            : "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.05)_100%)]"
        }`}
      />

      {/* Top fade for better text readability */}
      <div
        className={`absolute top-0 left-0 right-0 h-32 ${
          isDarkMode
            ? "bg-gradient-to-b from-slate-950/50 to-transparent"
            : "bg-gradient-to-b from-white/30 to-transparent"
        }`}
      />
    </div>
  );
}
