"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { PortfolioMode } from "@/app/page";
import CalmBackground from "./CalmBackground";

const Lottie = dynamic(() => import("lottie-react").then((m) => m.default), { ssr: false });

interface LandingPageProps {
  onSelectMode: (mode: PortfolioMode) => void;
}

// Flip Words Component - cycles through words with animation
function FlipWords({ words, className = "" }: { words: string[]; className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span className={`inline-block relative ${className}`}>
      <span
        className={`inline-block transition-all duration-300 ${
          isAnimating ? "opacity-0 translate-y-4 blur-sm" : "opacity-100 translate-y-0 blur-0"
        }`}
      >
        {words[currentIndex]}
      </span>
    </span>
  );
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Deterministic seeded random for sparkles
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9.8) * 10000;
  return x - Math.floor(x);
};

// Sparkles Component - uses deterministic values to avoid setState in effect
function Sparkles({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  // Pre-compute sparkles with deterministic pseudo-random values
  const sparkles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 4 + 1) * 100,
      y: seededRandom(i * 4 + 2) * 100,
      size: seededRandom(i * 4 + 3) * 3 + 1,
      delay: seededRandom(i * 4 + 4) * 2,
    })),
  []);

  return (
    <span className={`relative inline-block ${className}`}>
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="absolute pointer-events-none animate-sparkle"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </span>
      ))}
      {children}
    </span>
  );
}

// Mario Welcome Animation Component
function MarioWelcome({ onComplete, isDarkMode }: { onComplete: () => void; isDarkMode: boolean }) {
  const [frame, setFrame] = useState(0);
  const [brickBroken, setBrickBroken] = useState(false);
  const [showText, setShowText] = useState(false);
  const [isCharacterHovered, setIsCharacterHovered] = useState(false);
  const [isCharacterFocused, setIsCharacterFocused] = useState(false);
  const [marioAnimationData, setMarioAnimationData] = useState<Record<string, unknown> | null>(null);
  const [marioAnimationLoadFailed, setMarioAnimationLoadFailed] = useState(false);
  const completedRef = useRef(false);
  const welcomeShownRef = useRef(false);
  const lottieRef = useRef(null);
  const characterSrc = isDarkMode ? "/darth-vader.png" : "/yoda.png";
  const characterLabel = isDarkMode ? "Darth Vader" : "Yoda";
  const hoverText = isDarkMode ? "Welcome to the dark side" : "Welcome light side you will";
  const showHoverText = isCharacterHovered || isCharacterFocused;

  // Calculate Mario position based on frame
  const marioX = Math.min(frame * 1.2, 42);
  const isJumpPhase = frame > 40;
  const jumpProgress = isJumpPhase ? Math.min((frame - 40) * 4, 100) : 0;
  const marioY = isJumpPhase 
    ? (jumpProgress <= 50 ? jumpProgress * 1.2 : (100 - jumpProgress) * 1.2)
    : 0;
  const runWobbleDeg = !isJumpPhase ? (frame % 10 < 5 ? -6 : 6) : 0;
  const showExplosion = brickBroken && frame < 70;
  const showMarioLottie = marioAnimationData && !marioAnimationLoadFailed;
  const useLottieIntro = showMarioLottie;

  useEffect(() => {
    if (!showText) return;
    const t = window.setTimeout(() => {
      setShowText(false);
    }, 1100);
    return () => {
      window.clearTimeout(t);
    };
  }, [showText]);

  const handleLottieEnterFrame = useCallback(
    (e: unknown) => {
      if (!useLottieIntro) return;
      if (welcomeShownRef.current) return;

      const currentTime = (e as { currentTime?: number } | null)?.currentTime;
      if (typeof currentTime !== "number") return;

      const ip = Number((marioAnimationData as { ip?: number } | null)?.ip ?? 0);
      const op = Number((marioAnimationData as { op?: number } | null)?.op ?? 150);
      const showAt = ip + (op - ip) * 0.6;

      if (currentTime >= showAt) {
        welcomeShownRef.current = true;
        setShowText(true);
      }
    },
    [marioAnimationData, useLottieIntro]
  );

  const handleLottieComplete = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;

    fetch("/Lottie/Super%20Mario.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load animation");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setMarioAnimationData(data);
      })
      .catch(() => {
        if (cancelled) return;
        setMarioAnimationLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (useLottieIntro) return;

    const interval = setInterval(() => {
      setFrame((prev) => {
        const next = prev + 1;

        if (next === 50 && !brickBroken) {
          setBrickBroken(true);
          setShowText(true);
        }

        if (next >= 100) {
          clearInterval(interval);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
          return 100;
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete, useLottieIntro, brickBroken]);

  return (
    <div className="relative w-full h-[375px]">
      {showMarioLottie && (
        <div className="relative z-20 w-full h-full flex items-end justify-center">
          <div className="w-[90vw] max-w-[510px] md:max-w-[840px] aspect-[560/350] pointer-events-none drop-shadow-2xl">
            <Lottie
              animationData={marioAnimationData}
              loop={false}
              autoplay
              lottieRef={lottieRef}
              onEnterFrame={handleLottieEnterFrame}
              onComplete={handleLottieComplete}
              onDOMLoaded={() => {
                // Speed up animation 1.8x without cutting content
                if (lottieRef.current) {
                  (lottieRef.current as { setSpeed?: (speed: number) => void }).setSpeed?.(1.8);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Mario Character */}
      {!showMarioLottie && (
        <div
          className="absolute z-20"
          style={{
            left: `${marioX}%`,
            bottom: `${50 + marioY}px`,
          }}
        >
          <div
            className="relative select-none"
            onMouseEnter={() => setIsCharacterHovered(true)}
            onMouseLeave={() => setIsCharacterHovered(false)}
            onFocus={() => setIsCharacterFocused(true)}
            onBlur={() => setIsCharacterFocused(false)}
            tabIndex={0}
            role="img"
            aria-label={characterLabel}
            style={{
              transform: `rotate(${runWobbleDeg}deg)`,
              transformOrigin: "50% 80%",
            }}
          >
            {showHoverText && (
              <div className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-normal md:whitespace-nowrap px-3 py-1 rounded-full text-xs md:text-sm font-semibold z-40 backdrop-blur-sm shadow-lg ring-1 ring-black/10 animate-[fade-scale-in_0.2s_ease-out_forwards] bg-white/90 text-slate-900">
                {hoverText}
              </div>
            )}

            <div className="w-16 h-16 md:w-20 md:h-20">
              <picture>
                <source srcSet={isDarkMode ? "/darth-vader.webp" : "/yoda.webp"} type="image/webp" />
                <Image
                  src={characterSrc}
                  alt=""
                  aria-hidden="true"
                  width={80}
                  height={80}
                  className="rounded-full object-cover drop-shadow-lg pointer-events-none w-full h-full"
                  priority
                />
              </picture>
            </div>
          </div>
        </div>
      )}

      {/* Question Block */}
      {!useLottieIntro && !brickBroken && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-14 h-14 bg-yellow-400 border-4 border-yellow-600 rounded-lg flex items-center justify-center shadow-lg z-10">
          <span className="text-2xl font-bold text-yellow-700">?</span>
        </div>
      )}

      {/* Brick explosion */}
      {!useLottieIntro && brickBroken && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10">
          {showExplosion && (
            <>
              <div className="absolute w-4 h-4 bg-yellow-500 animate-[explode-tl_0.6s_ease-out_forwards]" />
              <div className="absolute w-4 h-4 bg-yellow-500 animate-[explode-tr_0.6s_ease-out_forwards]" />
              <div className="absolute w-4 h-4 bg-yellow-600 animate-[explode-bl_0.6s_ease-out_forwards]" />
              <div className="absolute w-4 h-4 bg-yellow-600 animate-[explode-br_0.6s_ease-out_forwards]" />
            </>
          )}
        </div>
      )}

      {/* Welcome Text */}
      {showText && (
        <div className="absolute top-12 inset-x-0 -translate-y-full z-30 flex justify-center px-4">
          <div className="max-w-[90vw] text-center whitespace-normal md:whitespace-nowrap rounded-xl px-4 py-2 md:px-5 md:py-2.5 text-base md:text-xl font-extrabold tracking-wide shadow-2xl ring-1 ring-black/20 bg-yellow-300 text-slate-900 drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] animate-pulse">
            Welcome to my portfolio website
          </div>
        </div>
      )}
    </div>
  );
}

// Glowing Card Component
function GlowingCard({ 
  children, 
  className = "", 
  glowColor = "emerald",
  onClick 
}: { 
  children: React.ReactNode; 
  className?: string; 
  glowColor?: "emerald" | "blue";
  onClick?: () => void;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const glowColors = {
    emerald: "rgba(16, 185, 129, 0.4)",
    blue: "rgba(59, 130, 246, 0.4)",
  };

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-visible ${className}`}
      style={{
        background: isHovered
          ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColors[glowColor]}, transparent 40%)`
          : undefined,
      }}
    >
      {/* Animated border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColors[glowColor]}, transparent 40%)`,
        }}
      />
      {children}
    </button>
  );
}

// Helper to read theme from localStorage (returns null on server)
const getStoredTheme = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("portfolio-theme");
};

export default function LandingPage({ onSelectMode }: LandingPageProps) {
  // Use useSyncExternalStore for hydration-safe theme state
  const isDarkMode = useSyncExternalStore(
    (onStoreChange) => {
      const handler = () => onStoreChange();
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    () => getStoredTheme() !== "light", // client: check localStorage
    () => true // server: default to dark
  );

  const [isThemeToggleHovered, setIsThemeToggleHovered] = useState(false);
  const [isThemeToggleFocused, setIsThemeToggleFocused] = useState(false);

  // Use useSyncExternalStore pattern for hydration-safe mounted state
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const setIsDarkMode = useCallback((dark: boolean) => {
    localStorage.setItem("portfolio-theme", dark ? "dark" : "light");
    window.dispatchEvent(new Event("storage"));
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const flipWords = ["Business Growth", "Strategic Insights", "AI Innovation", "Data Excellence"];

  // Welcome intro state
  const [introComplete, setIntroComplete] = useState(false);

  const handleWelcomeComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  // Check reduced motion preference (client-side only)
  const prefersReducedMotion = mounted && typeof window !== "undefined" 
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
    : false;

  useEffect(() => {
    if (!mounted) return;
    if (introComplete) return;
    // Skip timeout if user prefers reduced motion
    if (prefersReducedMotion) return;

    const timeoutId = window.setTimeout(() => {
      setIntroComplete(true);
    }, 5200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [mounted, introComplete, prefersReducedMotion]);

  // Computed flag: intro is done if state says so OR user prefers reduced motion
  const introDone = introComplete || prefersReducedMotion;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-white/60 text-sm font-medium">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 transition-colors duration-700 relative overflow-hidden">
      {/* Calm Background - minimal mode for better performance */}
      <CalmBackground isDarkMode={isDarkMode} minimal={true} />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        onMouseEnter={() => setIsThemeToggleHovered(true)}
        onMouseLeave={() => setIsThemeToggleHovered(false)}
        onFocus={() => setIsThemeToggleFocused(true)}
        onBlur={() => setIsThemeToggleFocused(false)}
        className={`absolute top-4 right-4 md:top-6 md:right-6 p-3 rounded-full transition-all duration-300 hover:scale-110 z-20 backdrop-blur-sm ${
          isDarkMode 
            ? "bg-slate-800/50 hover:bg-slate-700/50 ring-1 ring-white/10" 
            : "bg-white/80 hover:bg-white shadow-lg ring-1 ring-slate-200"
        }`}
        aria-label="Toggle theme"
      >
        {(isThemeToggleHovered || isThemeToggleFocused) && (
          <div className="absolute top-full mt-2 right-0 whitespace-nowrap px-3 py-1 rounded-full text-xs md:text-sm font-semibold z-40 backdrop-blur-sm shadow-lg ring-1 ring-black/10 animate-[fade-scale-in_0.2s_ease-out_forwards] bg-white/90 text-slate-900">
            {isDarkMode ? "Welcome light side you will" : "Welcome to the dark side"}
          </div>
        )}
        {isDarkMode ? (
          <picture>
            <source srcSet="/yoda.webp" type="image/webp" />
            <Image 
              src="/yoda.png" 
              alt="" 
              aria-hidden="true"
              width={72} 
              height={72}
              className="rounded-full object-cover w-16 h-16 md:w-[72px] md:h-[72px]"
            />
          </picture>
        ) : (
          <picture>
            <source srcSet="/darth-vader.webp" type="image/webp" />
            <Image 
              src="/darth-vader.png" 
              alt="" 
              aria-hidden="true"
              width={72} 
              height={72}
              className="rounded-full object-cover w-16 h-16 md:w-[72px] md:h-[72px]"
            />
          </picture>
        )}
      </button>

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Mario Intro Animation - 2 seconds - prominently displayed */}
        {!introDone && (
          <div className="mb-8 min-h-[420px] flex items-center justify-center w-full relative z-50">
            <MarioWelcome onComplete={handleWelcomeComplete} isDarkMode={isDarkMode} />
          </div>
        )}

        {/* Main Heading - show after intro with Sparkles, or during intro without */}
        {introDone && (
          <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight animate-fade-in-up ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}>
            <Sparkles>
              Smeet Kumar Patel
            </Sparkles>
          </h1>
        )}

        {/* Subtitle with Flip Words - only show after intro */}
        {introDone && (
          <p className={`text-lg md:text-xl lg:text-2xl mb-2 animate-fade-in-up animation-delay-200 ${
            isDarkMode ? "text-slate-300" : "text-slate-700"
          }`}>
            Manager, Data Engineering, Analytics & GenAI Implementation
          </p>
        )}
        
        {introDone && (
          <p className={`text-base md:text-lg mb-2 animate-fade-in-up animation-delay-300 ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}>
            Transforming Data into{" "}
            <FlipWords 
              words={flipWords} 
              className={`font-semibold ${isDarkMode ? "text-cyan-400" : "text-blue-600"}`}
            />
          </p>
        )}

        {introDone && (
          <p className={`text-sm mb-4 animate-fade-in-up animation-delay-350 inline-flex items-center gap-2 px-3 py-1 rounded-full ${
            isDarkMode ? "bg-amber-500/10 text-amber-300 border border-amber-500/30" : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}>
            🎓 IIT Madras — Advanced Certification in Data Science & AI
          </p>
        )}

        {/* Animated Metrics - only show after intro */}
        {introDone && (
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-6 animate-fade-in-up animation-delay-400">
          {[
            { value: 20, suffix: "", label: "Countries" },
            { value: 175, suffix: "", label: "Users Supported" },
            { value: 21, suffix: "", label: "Dashboards" },
            { value: 53, suffix: "%", label: "Daily Active" },
          ].map((metric, index) => (
            <div key={index} className="text-center">
              <div className={`text-3xl md:text-4xl font-bold tabular-nums ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}>
                <AnimatedCounter end={metric.value} suffix={metric.suffix} />
              </div>
              <div className={`text-xs md:text-sm mt-1 ${
                isDarkMode ? "text-slate-500" : "text-slate-500"
              }`}>
                {metric.label}
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Mode Selection Header - only show after intro */}
        {introDone && (
          <h2 className={`text-lg md:text-xl font-semibold mb-4 animate-fade-in-up animation-delay-500 ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}>
            Choose Your Experience
          </h2>
        )}

        {/* Mode Selection Cards - only show after intro */}
        {introDone && (
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch animate-fade-in-up animation-delay-600">
          
          {/* ========== PROFESSIONAL VIEW CARD (PRIMARY) ========== */}
          <GlowingCard
            onClick={() => onSelectMode("professional")}
            glowColor="blue"
            className={`group relative w-full md:w-[380px] p-6 pt-8 rounded-2xl transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm overflow-visible ${
              isDarkMode 
                ? "bg-gradient-to-br from-blue-600/15 to-indigo-600/10 border-2 border-blue-500/30 hover:border-blue-400/60" 
                : "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 hover:border-blue-400 shadow-xl hover:shadow-2xl"
            }`}
          >
            {/* Recommended Badge */}
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap ${
              isDarkMode 
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                : "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            }`}>
              ✓ RECOMMENDED
            </div>

            <div className="relative text-center pt-2">
              {/* Polished Icon Container */}
              <div className="mb-4 flex justify-center">
                <div className={`relative w-16 h-16 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${
                  isDarkMode 
                    ? "bg-gradient-to-br from-blue-500/30 to-indigo-500/20 border border-blue-400/30" 
                    : "bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200"
                }`}>
                  <svg className={`w-8 h-8 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  {/* Subtle glow effect */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    isDarkMode ? "bg-blue-500/10" : "bg-blue-200/50"
                  }`} />
                </div>
              </div>
              
              <h3 className={`text-xl font-bold mb-1 ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}>
                Executive Summary
              </h3>

              {/* Time estimate */}
              <p className={`text-xs font-medium mb-2 ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}>
                ⏱ 30 seconds to overview
              </p>
              
              <p className={`text-sm mb-4 leading-relaxed ${
                isDarkMode ? "text-slate-300" : "text-slate-600"
              }`}>
                Clean, data-driven layout with key metrics and achievements at a glance
              </p>
              
              {/* Feature pills - unified style */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {["Key Metrics", "Career Timeline", "Skills Matrix"].map((feature) => (
                  <span
                    key={feature}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      isDarkMode 
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
              
              {/* CTA Button - unified style */}
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 group-hover:gap-4 ${
                isDarkMode 
                  ? "bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/25" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25"
              }`}>
                <span>View Portfolio</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </GlowingCard>

          {/* ========== INTERACTIVE EXPERIENCE CARD (SECONDARY) ========== */}
          <GlowingCard
            onClick={() => onSelectMode("retro")}
            glowColor="emerald"
            className={`group relative w-full md:w-[380px] p-6 rounded-2xl transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm ${
              isDarkMode 
                ? "bg-gradient-to-br from-emerald-900/20 to-slate-900/40 border border-emerald-500/20 hover:border-emerald-400/50" 
                : "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 hover:border-emerald-300 shadow-lg hover:shadow-xl"
            }`}
          >
            <div className="relative text-center">
              {/* Polished Icon Container */}
              <div className="mb-4 flex justify-center">
                <div className={`relative w-16 h-16 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 ${
                  isDarkMode 
                    ? "bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-400/30" 
                    : "bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200"
                }`}>
                  <svg className={`w-8 h-8 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.659-.663 47.703 47.703 0 00-.31-4.82 47.646 47.646 0 00-4.086.29.64.64 0 01-.657-.643v0z" />
                  </svg>
                  {/* Subtle glow effect */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    isDarkMode ? "bg-emerald-500/10" : "bg-emerald-200/50"
                  }`} />
                </div>
              </div>
              
              <h3 className={`text-xl font-bold mb-1 ${
                isDarkMode ? "text-emerald-400" : "text-emerald-800"
              }`}>
                Interactive Journey
              </h3>

              {/* Time estimate */}
              <p className={`text-xs font-medium mb-2 ${
                isDarkMode ? "text-emerald-400/80" : "text-emerald-600"
              }`}>
                🎮 ~2 min playthrough
              </p>
              
              <p className={`text-sm mb-4 leading-relaxed ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}>
                Explore my career story through a retro-style platformer adventure
              </p>
              
              {/* Feature pills - unified style */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {["Story Mode", "Achievements", "Fun"].map((feature) => (
                  <span
                    key={feature}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      isDarkMode 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
              
              {/* CTA Button - unified style */}
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 group-hover:gap-4 ${
                isDarkMode 
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30" 
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25"
              }`}>
                <span>Start Adventure</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </GlowingCard>
        </div>
        )}

        {/* Footer - only show after intro */}
        {introDone && (
        <div className={`mt-6 flex flex-col items-center gap-3 animate-fade-in-up animation-delay-700`}>
          <p className={`text-sm ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
            You can switch between modes anytime
          </p>
          
          {/* Resume & Social Links */}
          <div className="flex gap-4 items-center">
            {/* Resume Download */}
            <a
              href="/resume/Smeet_Kumar_Patel_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30" 
                  : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
              }`}
              aria-label="View or download resume"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Resume
            </a>
            
            {/* Social Links */}
            {[
              { icon: "linkedin", href: "https://linkedin.com/in/smeetkumarpatel/" },
              { icon: "email", href: "mailto:smeet3103@gmail.com" },
            ].map((social) => (
              <a
                key={social.icon}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? "bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                {social.icon === "linkedin" && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                )}
                {social.icon === "email" && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
