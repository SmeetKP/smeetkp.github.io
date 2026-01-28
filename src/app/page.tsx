"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import LandingPage from "../components/LandingPage";

export type PortfolioMode = "landing" | "professional" | "retro";

// Dynamic imports with loading states for code splitting
const ProfessionalMode = dynamic(() => import("../components/ProfessionalMode"), {
  loading: () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
        <p className="text-white/60 text-sm font-medium">Loading Professional Mode...</p>
      </div>
    </div>
  ),
  ssr: false,
});

const RetroMode = dynamic(() => import("../components/RetroMode"), {
  loading: () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        <p className="text-white/60 text-sm font-medium">Loading Interactive Mode...</p>
      </div>
    </div>
  ),
  ssr: false,
});

export default function Home() {
  const [mode, setMode] = useState<PortfolioMode>("landing");

  if (mode === "landing") {
    return <LandingPage onSelectMode={setMode} />;
  }

  if (mode === "retro") {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
        <RetroMode onSwitchMode={() => setMode("professional")} onBack={() => setMode("landing")} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <ProfessionalMode onSwitchMode={() => setMode("retro")} onBack={() => setMode("landing")} />
    </Suspense>
  );
}
