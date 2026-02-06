"use client";

import { useContent } from "../hooks/useContent";
import { useEffect, useRef, useState, useMemo, useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import ExperienceSection from "./ExperienceSection";
import { useHighlights } from "@/hooks/useHighlights";
import HighlightsFloatingBadge from "./HighlightsFloatingBadge";
import HighlightsDrawer from "./HighlightsDrawer";
import { exportHighlightsToPDF, copyHighlightsToClipboard, generateShareLink } from "@/utils/exportHighlights";

// Helper to read theme from localStorage (returns null on server)
const getStoredTheme = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("portfolio-theme");
};

interface ProfessionalModeProps {
  onSwitchMode: () => void;
  onBack: () => void;
}

const TRUST_LOGOS = [
  { name: "JPMorgan Chase", industry: "Banking", color: "from-slate-500/20 to-blue-500/20" },
  { name: "Sonova", industry: "MedTech", color: "from-blue-500/20 to-cyan-500/20" },
  { name: "Phonak", industry: "Hearing", color: "from-blue-500/20 to-blue-600/20" },
  { name: "Unitron", industry: "Hearing", color: "from-cyan-500/20 to-blue-500/20" },
  { name: "Advanced Bionics", industry: "Cochlear", color: "from-blue-600/20 to-cyan-500/20" },
  { name: "Sennheiser", industry: "Audio", color: "from-cyan-500/20 to-blue-600/20" },
];

const NAV_SECTIONS = [
  { id: "hero", label: "Overview", icon: "◉" },
  { id: "about", label: "About", icon: "◎" },
  { id: "experience", label: "Experience", icon: "◈" },
  { id: "skills", label: "Skills", icon: "◇" },
  { id: "contact", label: "Contact", icon: "◆" },
];

const SKILL_LEVELS: Record<string, "expert" | "advanced" | "proficient"> = {
  "Python": "expert",
  "SQL": "expert",
  "Power BI": "expert",
  "Tableau": "expert",
  "Azure": "advanced",
  "AWS": "advanced",
  "Machine Learning": "advanced",
  "Data Engineering": "advanced",
  "Leadership": "expert",
  "Strategy": "expert",
  "A/B Testing": "expert",
  "Uplift Modeling": "advanced",
  "RFM Analysis": "expert",
  "Propensity Modeling": "expert",
  "Causal Inference": "advanced",
  "Hadoop/Hive": "advanced",
  "Spark": "advanced",
  "Pandas/NumPy": "expert",
  "SciPy/StatsModels": "advanced",
  "Retail Banking": "expert",
  "Wealth Management": "advanced",
  "Customer Analytics": "expert",
  "Marketing Science": "expert",
  "MedTech / Audiological Care": "expert",
  "Databricks": "expert",
  "ML Models": "advanced",
  "Statistical Modeling": "advanced",
  "RAG Architecture": "expert",
  "LangChain": "advanced",
  "Vector Databases": "advanced",
  "FastAPI": "advanced",
  "Prompt Engineering": "advanced",
  "AI Governance": "expert",
  "Medallion Architecture": "expert",
};

export default function ProfessionalMode({ onSwitchMode, onBack }: ProfessionalModeProps) {
  const { content } = useContent();
  const highlightsHook = useHighlights();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isThemeToggleHovered, setIsThemeToggleHovered] = useState(false);
  const [isThemeToggleFocused, setIsThemeToggleFocused] = useState(false);
  const [showHighlightsTip, setShowHighlightsTip] = useState(true);
  const [guidedTourStep, setGuidedTourStep] = useState<number | null>(null);

  const dismissHighlightsTip = useCallback(() => {
    setShowHighlightsTip(false);
  }, []);

  const startGuidedTour = useCallback(() => {
    setGuidedTourStep(0);
    setShowHighlightsTip(false);
    // Scroll to experience section so the star button is visible
    const el = document.getElementById("section-experience");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const advanceTour = useCallback(() => {
    setGuidedTourStep((prev) => {
      if (prev === null) return null;
      if (prev >= 2) return null; // End tour after step 3
      return prev + 1;
    });
  }, []);

  const endTour = useCallback(() => {
    setGuidedTourStep(null);
  }, []);

  // Theme state - synced with localStorage
  const isDarkMode = useSyncExternalStore(
    (onStoreChange) => {
      const handler = () => onStoreChange();
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    () => getStoredTheme() !== "light",
    () => true
  );

  const toggleTheme = useCallback(() => {
    localStorage.setItem("portfolio-theme", isDarkMode ? "light" : "dark");
    window.dispatchEvent(new Event("storage"));
  }, [isDarkMode]);

  // Scroll to section handler
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileNavOpen(false);
  }, []);

  // Scrollytelling: track scroll position for timeline animation + scroll spy
  useEffect(() => {
    const handleScroll = () => {
      // Timeline progress
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementHeight = rect.height;
        const progress = Math.max(0, Math.min(1, 
          (windowHeight - rect.top) / (windowHeight + elementHeight)
        ));
        setScrollProgress(progress);
      }

      // Scroll spy - detect active section
      const sections = NAV_SECTIONS.map(s => ({
        id: s.id,
        element: document.getElementById(`section-${s.id}`)
      })).filter(s => s.element);

      const scrollPosition = window.scrollY + 150; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element && section.element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Deep link support: scroll to section from URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    
    const params = new URLSearchParams(hash);
    const section = params.get("section");
    if (section) {
      // Use setTimeout to allow DOM to render first
      setTimeout(() => {
        const el = document.getElementById(`section-${section}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, []);

  // Calculate which experience items are visible based on scroll
  const visibleExperiences = useMemo(() => {
    const total = content.experience.length;
    const visibleCount = Math.ceil(scrollProgress * total * 1.5);
    return Math.min(total, visibleCount);
  }, [scrollProgress, content.experience.length]);

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${
      isDarkMode 
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" 
        : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
    }`}>
      {/* Simplified Background - Static gradient with subtle texture */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? "bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_50%)]" 
            : "bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%)]"
        }`} />
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? "bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.05),transparent_50%)]" 
            : "bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.1),transparent_50%)]"
        }`} />
        <div 
          className={`absolute inset-0 ${isDarkMode ? "opacity-[0.02]" : "opacity-[0.03]"}`}
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)"} 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      
      {/* Header - Clean & Professional */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
        isDarkMode 
          ? "bg-slate-950/95 border-slate-800/50" 
          : "bg-white/95 border-slate-200/50"
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              isDarkMode 
                ? "bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle - Matching Landing Page exactly */}
            <button
              onClick={toggleTheme}
              onMouseEnter={() => setIsThemeToggleHovered(true)}
              onMouseLeave={() => setIsThemeToggleHovered(false)}
              onFocus={() => setIsThemeToggleFocused(true)}
              onBlur={() => setIsThemeToggleFocused(false)}
              className={`relative p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm ${
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
                <Image 
                  src="/yoda.png" 
                  alt="" 
                  aria-hidden="true"
                  width={72} 
                  height={72}
                  className="rounded-full object-cover w-12 h-12 md:w-14 md:h-14"
                />
              ) : (
                <Image 
                  src="/darth-vader.png" 
                  alt="" 
                  aria-hidden="true"
                  width={72} 
                  height={72}
                  className="rounded-full object-cover w-12 h-12 md:w-14 md:h-14"
                />
              )}
            </button>

            {/* Availability Badge - P1 */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isDarkMode 
                ? "bg-emerald-500/10 border border-emerald-500/30" 
                : "bg-emerald-50 border border-emerald-200"
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className={`text-xs font-medium ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>Open to Opportunities</span>
            </div>
            
            {/* Resume Download - P0 */}
            <a
              href="/resume/Smeet_Kumar_Patel_Resume.pdf"
              download
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Resume
            </a>
          </div>
          
          <button
            onClick={onSwitchMode}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              isDarkMode 
                ? "bg-slate-800/60 hover:bg-slate-700/80 text-cyan-400 border border-slate-700/50" 
                : "bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border border-cyan-200"
            }`}
          >
            <span>🎮</span>
            <span className="hidden sm:inline">Play Mode</span>
          </button>
        </div>
      </header>

      {/* Sticky Navigation Sidebar - Desktop (Compact Icon-only with tooltips) */}
      <nav className={`hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-1 backdrop-blur-sm rounded-2xl p-2 border ${
        isDarkMode 
          ? "bg-slate-900/80 border-slate-800/50" 
          : "bg-white/80 border-slate-200/50 shadow-lg"
      }`}>
        {NAV_SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              activeSection === section.id
                ? "bg-blue-500/20 text-blue-400"
                : isDarkMode 
                  ? "text-slate-500 hover:text-white hover:bg-slate-800/80" 
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title={section.label}
          >
            <span className="text-sm font-medium">{section.icon}</span>
            {activeSection === section.id && (
              <div className="absolute left-0 w-0.5 h-6 bg-blue-400 rounded-full" />
            )}
            {/* Tooltip */}
            <div className={`absolute left-14 px-3 py-1.5 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border ${
              isDarkMode 
                ? "bg-slate-800 text-white border-slate-700/50" 
                : "bg-white text-slate-900 border-slate-200 shadow-lg"
            }`}>
              {section.label}
            </div>
          </button>
        ))}
      </nav>

      {/* Mobile Navigation - Floating Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center text-xl hover:bg-blue-400 transition-all"
        >
          {isMobileNavOpen ? "✕" : "☰"}
        </button>
        
        {/* Mobile Nav Menu */}
        {isMobileNavOpen && (
          <div className={`absolute bottom-16 right-0 backdrop-blur-xl border rounded-2xl p-2 shadow-xl min-w-[160px] ${
            isDarkMode 
              ? "bg-slate-900/95 border-slate-700/50" 
              : "bg-white/95 border-slate-200"
          }`}>
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === section.id
                    ? "bg-blue-500/20 text-blue-400"
                    : isDarkMode 
                      ? "text-slate-300 hover:bg-slate-800/80" 
                      : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{section.icon}</span>
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 lg:pl-24">
        
        {/* Hero Section - Redesigned with prominent metrics (P0) */}
        <section id="section-hero" className="mb-10">
          {/* Profile Photo + Name & Role */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
            {/* Profile Photo */}
            <div className={`flex-shrink-0 w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 shadow-xl ${
              isDarkMode 
                ? "border-blue-500/30 shadow-blue-500/10" 
                : "border-blue-400/50 shadow-blue-500/20"
            }`}>
              <Image
                src="/images/Smeet_Photo_400.jpg"
                alt={content.profile.name}
                width={144}
                height={144}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            
            {/* Name & Role - Large Typography */}
            <div className="flex-1">
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                {content.profile.name}
              </h1>
              <p className={`text-xl md:text-2xl font-medium mb-4 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                {content.profile.role}
              </p>
              <p className={`text-lg leading-relaxed max-w-3xl ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                {content.profile.summary}
              </p>
            </div>
          </div>

          {/* Key Metrics - Prominent Display (P0) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {content.metrics.map((metric, i) => (
              <div 
                key={i} 
                className={`relative p-5 rounded-2xl border transition-all group ${
                  isDarkMode 
                    ? "bg-slate-800/40 border-slate-700/50 hover:border-blue-500/30" 
                    : "bg-white border-slate-200 hover:border-blue-400 shadow-sm"
                }`}
              >
                <div className={`text-3xl md:text-4xl font-bold mb-1 tabular-nums ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {metric.value}
                </div>
                <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{metric.label}</div>
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500/50 group-hover:bg-blue-400 transition-colors" />
              </div>
            ))}
          </div>

          {/* Quick Info Pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${
              isDarkMode 
                ? "bg-slate-800/60 text-slate-300 border-slate-700/50" 
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}>
              <svg className={`w-4 h-4 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {content.profile.location}
            </span>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${
              isDarkMode 
                ? "bg-blue-500/10 text-blue-300 border-blue-500/30" 
                : "bg-blue-50 text-blue-600 border-blue-200"
            }`}>
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              EU Blue Card
            </span>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${
              isDarkMode 
                ? "bg-blue-500/10 text-blue-300 border-blue-500/30" 
                : "bg-blue-50 text-blue-600 border-blue-200"
            }`}>
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              US B1 Visa
            </span>
          </div>

          {/* CTA Buttons in Hero */}
          <div className="flex flex-wrap gap-4">
            <a
              href={`mailto:${content.contact.email}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Get in Touch
            </a>
            <a
              href={`https://${content.contact.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all border ${
                isDarkMode 
                  ? "bg-slate-800/60 hover:bg-slate-700/80 text-white border-slate-700/50" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        </section>

        {/* Trust Layer - Improved (P2) */}
        <section className={`mb-10 py-6 border-y ${isDarkMode ? "border-slate-800/50" : "border-slate-200"}`}>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {TRUST_LOGOS.map((logo, i) => (
              <div 
                key={i} 
                className={`px-5 py-2.5 rounded-xl border transition-all ${
                  isDarkMode 
                    ? `bg-gradient-to-r ${logo.color} border-slate-700/30 hover:border-blue-500/30` 
                    : "bg-white border-slate-200 hover:border-blue-400 shadow-sm"
                }`}
              >
                <span className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{logo.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* About Section - Redesigned with Visual Micro-Narratives */}
        <section id="section-about" className="mb-10">
          <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>About</h2>
          
          {/* Narrative Cards - Company-specific achievement stories */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Sonova Story */}
            <div className={`relative p-6 rounded-2xl border overflow-hidden group transition-all ${
              isDarkMode 
                ? "bg-gradient-to-br from-slate-800/60 to-blue-900/20 border-slate-700/50 hover:border-blue-500/30" 
                : "bg-gradient-to-br from-blue-50/80 to-white border-blue-200/60 hover:border-blue-400 shadow-sm"
            }`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${isDarkMode ? "bg-blue-500" : "bg-blue-500"}`} />
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>Sonova Group</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"}`}>Current</span>
              </div>
              <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                Pioneered <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>RAG chatbots, FastAPI analytics products</span>, and an AI-powered HR Org Chart — reducing hallucinations by <span className={`font-bold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>90%</span> and scaling to <span className={`font-bold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>1,000+</span> employees across 20 countries.
              </p>
            </div>

            {/* JPMorgan Story */}
            <div className={`relative p-6 rounded-2xl border overflow-hidden group transition-all ${
              isDarkMode 
                ? "bg-gradient-to-br from-slate-800/60 to-slate-700/20 border-slate-700/50 hover:border-cyan-500/30" 
                : "bg-gradient-to-br from-slate-50/80 to-white border-slate-200/60 hover:border-cyan-400 shadow-sm"
            }`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${isDarkMode ? "bg-cyan-500" : "bg-cyan-500"}`} />
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>JPMorgan Chase</span>
              </div>
              <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                Built <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>propensity models</span> that grew acquisitions by <span className={`font-bold ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>+16% MoM</span> and Next-Best-Action engines that improved client interactions by <span className={`font-bold ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>+2.5%</span> across Retail & Wealth Banking.
              </p>
            </div>
          </div>

          {/* Architecture & Engineering highlight */}
          <div className={`p-5 rounded-2xl border mb-6 ${
            isDarkMode 
              ? "bg-slate-800/30 border-slate-700/50" 
              : "bg-slate-50/80 border-slate-200 shadow-sm"
          }`}>
            <p className={`text-sm leading-relaxed text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Designed <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Medallion lakehouse architectures</span> achieving 
              <span className={`font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}> MTTR &lt;30 min</span> and 
              <span className={`font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}> 99.9% pipeline reliability</span> · 
              Built experimentation platforms (A/B, uplift, matched-pair) driving measurable ROI
            </p>
          </div>

          {/* Capability Tags - Visual, scannable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {[
              { icon: "🤖", text: "GenAI at Enterprise Scale", sub: "Finance, HR, Sales & Marketing" },
              { icon: "🏗️", text: "Medallion Lakehouses", sub: "99.9% reliability · 20 countries" },
              { icon: "🧪", text: "Experimentation Platforms", sub: "A/B, uplift, matched-pair" },
              { icon: "👥", text: "Cross-Functional Leadership", sub: "14+ people · 6 countries" },
              { icon: "🛡️", text: "AI Governance", sub: "GDPR, EU AI Act · 18 jurisdictions" },
              { icon: "📊", text: "Executive Analytics", sub: "21 dashboards · C-suite reporting" },
            ].map((cap, i) => (
              <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:scale-[1.02] ${
                isDarkMode 
                  ? "bg-slate-800/40 border-slate-700/40 hover:border-blue-500/30" 
                  : "bg-white border-slate-200 hover:border-blue-300 shadow-sm"
              }`}>
                <span className="text-xl flex-shrink-0">{cap.icon}</span>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>{cap.text}</div>
                  <div className={`text-xs truncate ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>{cap.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Certification Highlight - Compact */}
          <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
            isDarkMode
              ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30"
              : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm"
          }`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
              isDarkMode ? "bg-amber-500/20" : "bg-amber-100"
            }`}>
              🎓
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${isDarkMode ? "text-amber-300" : "text-amber-700"}`}>
                Advanced Certification in Data Science & AI
              </p>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                IIT Madras (CODE) · Feb 2022 – Sep 2022
              </p>
            </div>
          </div>
        </section>

        {/* Experience Section - Detailed Accordion (P1) */}
        <section id="section-experience" className="mb-10" ref={timelineRef}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Experience</h2>
          
          {/* Feature Discovery: Highlights Onboarding Tip — always visible, session-collapsible */}
          {showHighlightsTip ? (
            <div className={`mb-6 p-4 rounded-2xl border relative overflow-hidden ${
              isDarkMode 
                ? "bg-gradient-to-r from-blue-900/30 to-purple-900/20 border-blue-500/30" 
                : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
            }`}>
              <button
                onClick={dismissHighlightsTip}
                className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                  isDarkMode 
                    ? "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700" 
                    : "bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                }`}
                aria-label="Collapse tip"
              >
                ⌃
              </button>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Interview Prep Mode</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDarkMode ? "bg-blue-500/30 text-blue-300" : "bg-blue-100 text-blue-700"
                  }`}>1</span>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                    Click <span className={`font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>☆</span> on any section to bookmark it
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDarkMode ? "bg-blue-500/30 text-blue-300" : "bg-blue-100 text-blue-700"
                  }`}>2</span>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                    A <span className={`font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>📝 Highlights</span> badge appears — click to review
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDarkMode ? "bg-blue-500/30 text-blue-300" : "bg-blue-100 text-blue-700"
                  }`}>3</span>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                    Export as <span className={`font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>PDF</span>, copy, or share your curated highlights
                  </p>
                </div>
              </div>
              <button
                onClick={startGuidedTour}
                className="relative text-sm font-bold px-6 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 overflow-hidden"
              >
                <span className="absolute inset-0 animate-shimmer" />
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                <span className="relative">Take a Tour</span>
                <svg className="w-4 h-4 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowHighlightsTip(true)}
              className={`mb-6 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all inline-flex items-center gap-2 ${
                isDarkMode 
                  ? "bg-blue-900/20 border-blue-500/20 text-blue-400 hover:bg-blue-900/30 hover:border-blue-500/30" 
                  : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              💡 Interview Prep Mode — How it works
            </button>
          )}

          <ExperienceSection 
            isDarkMode={isDarkMode}
            onAddHighlight={highlightsHook.addHighlight}
            onRemoveHighlight={highlightsHook.removeHighlight}
            isHighlighted={highlightsHook.isHighlighted}
          />
        </section>

        {/* Skills Section - With Proficiency Indicators (P2) */}
        <section id="section-skills" className="mb-10">
          <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Skills</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {content.skills.map((cat, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? "bg-slate-800/40 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"}`}>
                <h3 className={`font-bold mb-4 text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}>{cat.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((skill, j) => {
                    const level = SKILL_LEVELS[skill] || "proficient";
                    const levelColors = isDarkMode ? {
                      expert: "bg-blue-500/20 text-blue-300 border-blue-500/40",
                      advanced: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
                      proficient: "bg-slate-700/60 text-slate-300 border-slate-600/30"
                    } : {
                      expert: "bg-blue-100 text-blue-700 border-blue-300",
                      advanced: "bg-cyan-50 text-cyan-700 border-cyan-200",
                      proficient: "bg-slate-100 text-slate-700 border-slate-200"
                    };
                    return (
                      <span
                        key={j}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors hover:scale-105 ${levelColors[level]}`}
                        title={`${level.charAt(0).toUpperCase() + level.slice(1)} level`}
                      >
                        {skill}
                        {level === "expert" && <span className="ml-1 text-xs">★</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className={`mt-4 flex items-center gap-6 text-xs ${isDarkMode ? "text-slate-500" : "text-slate-600"}`}>
            <span className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded border ${isDarkMode ? "bg-blue-500/20 border-blue-500/40" : "bg-blue-100 border-blue-300"}`} />
              Expert ★
            </span>
            <span className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded border ${isDarkMode ? "bg-cyan-500/15 border-cyan-500/30" : "bg-cyan-50 border-cyan-200"}`} />
              Advanced
            </span>
            <span className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded border ${isDarkMode ? "bg-slate-700/60 border-slate-600/30" : "bg-slate-100 border-slate-200"}`} />
              Proficient
            </span>
          </div>
        </section>

        {/* Contact Section - Simplified */}
        <section id="section-contact" className={`mb-10 p-8 rounded-2xl border ${
          isDarkMode 
            ? "bg-gradient-to-br from-slate-800/60 to-blue-900/20 border-blue-500/20" 
            : "bg-gradient-to-br from-blue-50 to-white border-blue-200"
        }`}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Let&apos;s Connect</h2>
          <p className={`mb-6 max-w-2xl ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Open to discussing data leadership opportunities, AI strategy consulting, or innovative analytics projects.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={`mailto:${content.contact.email}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {content.contact.email}
            </a>
            <a
              href={`https://${content.contact.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all border ${
                isDarkMode 
                  ? "bg-slate-800/60 hover:bg-slate-700/80 text-white border-slate-700/50" 
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn Profile
            </a>
            <a
              href="/resume/Smeet_Kumar_Patel_Resume.pdf"
              download
              className={`inline-flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all border ${
                isDarkMode 
                  ? "bg-slate-800/60 hover:bg-slate-700/80 text-white border-slate-700/50" 
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Resume
            </a>
          </div>
        </section>
      </main>

      {/* Footer - Built With Tech Stack */}
      <footer className={`border-t py-8 ${isDarkMode ? "border-slate-800/50" : "border-slate-200"}`}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Built With */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <span className={`text-xs font-medium uppercase tracking-widest ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}>Built with</span>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: "Next.js 16", icon: "▲", accent: isDarkMode ? "text-white" : "text-black" },
                { name: "React 19", icon: "⚛", accent: "text-cyan-400" },
                { name: "TypeScript", icon: "TS", accent: "text-blue-400" },
                { name: "Tailwind CSS 4", icon: "◆", accent: "text-cyan-300" },
                { name: "Framer Motion", icon: "◎", accent: "text-purple-400" },
                { name: "Turbopack", icon: "⚡", accent: "text-amber-400" },
                { name: "React Compiler", icon: "⟐", accent: "text-blue-300" },
              ].map((tech, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:scale-105 ${
                    isDarkMode
                      ? "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <span className={`font-bold ${tech.accent}`}>{tech.icon}</span>
                  {tech.name}
                </span>
              ))}
            </div>
            <p className={`text-xs text-center max-w-md ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}>
              Deployed on GitHub Pages · 3 interactive modes · Interview highlights system · AI-powered resume
            </p>
          </div>
          {/* Bottom bar */}
          <div className={`flex justify-between items-center pt-4 border-t text-xs ${isDarkMode ? "border-slate-800/50 text-slate-600" : "border-slate-200 text-slate-400"}`}>
            <span>© 2026 {content.profile.name}</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`transition-colors flex items-center gap-1 ${isDarkMode ? "hover:text-slate-300" : "hover:text-slate-900"}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              Back to top
            </button>
          </div>
        </div>
      </footer>

      {/* Interview Highlights System */}
      <HighlightsFloatingBadge
        count={highlightsHook.highlights.length}
        onClick={highlightsHook.toggleDrawer}
        isDarkMode={isDarkMode}
      />
      
      <HighlightsDrawer
        isOpen={highlightsHook.isDrawerOpen}
        highlights={highlightsHook.highlights}
        onClose={() => highlightsHook.setIsDrawerOpen(false)}
        onRemove={highlightsHook.removeHighlight}
        onClearAll={highlightsHook.clearAll}
        onExportPDF={() => exportHighlightsToPDF(highlightsHook.highlights, content.profile.name)}
        onCopyToClipboard={() => {
          copyHighlightsToClipboard(highlightsHook.highlights);
          alert('Highlights copied to clipboard!');
        }}
        onGenerateShareLink={() => {
          const link = generateShareLink(highlightsHook.highlights);
          navigator.clipboard.writeText(link);
          alert('Share link copied to clipboard!');
        }}
        isDarkMode={isDarkMode}
      />

      {/* Spotlight Guided Tour Overlay */}
      {guidedTourStep !== null && (
        <div className="fixed inset-0 z-[100]" onClick={endTour}>
          {/* Dimmed backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          
          {/* Tour content — positioned based on step */}
          <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
            
            {/* Step 0: Star Button */}
            {guidedTourStep === 0 && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
                {/* Spotlight ring with pulsing beacon */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-blue-400 flex items-center justify-center animate-pulse">
                    <span className="text-3xl">☆</span>
                  </div>
                  {/* Pulsing ring */}
                  <div className="absolute -inset-3 rounded-2xl border-2 border-blue-400/50 animate-ping pointer-events-none" />
                </div>
                {/* Coach mark card */}
                <div className={`max-w-sm p-5 rounded-2xl border shadow-2xl ${
                  isDarkMode 
                    ? "bg-slate-900 border-blue-500/40 shadow-blue-500/10" 
                    : "bg-white border-blue-200 shadow-blue-500/20"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>Step 1 of 3</span>
                    <div className="flex gap-1 ml-auto">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className={`w-2 h-2 rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`} />
                      <div className={`w-2 h-2 rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`} />
                    </div>
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Bookmark Sections</h3>
                  <p className={`text-sm mb-4 leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    Expand any experience card and click the <span className={`font-bold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>☆ star</span> button next to a section to save it to your interview highlights.
                  </p>
                  {/* Dashed line connector */}
                  <div className={`border-t border-dashed mb-4 ${isDarkMode ? "border-slate-700" : "border-slate-200"}`} />
                  <div className="flex items-center justify-between">
                    <button onClick={endTour} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}>
                      Skip Tour
                    </button>
                    <button onClick={advanceTour} className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-400 transition-colors flex items-center gap-1">
                      Next
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Highlights Badge */}
            {guidedTourStep === 1 && (
              <div className="absolute bottom-32 right-8 flex flex-col items-end gap-4">
                {/* Mock floating badge */}
                <div className="relative">
                  <div className={`px-4 py-3 rounded-2xl border-2 flex items-center gap-2 ${
                    isDarkMode ? "bg-blue-600 border-blue-400 text-white" : "bg-blue-600 border-blue-500 text-white"
                  }`}>
                    <span className="text-xl">📝</span>
                    <div className="text-left">
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-xs opacity-90">Highlights</div>
                    </div>
                  </div>
                  {/* Pulsing ring */}
                  <div className="absolute -inset-3 rounded-3xl border-2 border-blue-400/50 animate-ping pointer-events-none" />
                </div>
                {/* Coach mark card */}
                <div className={`max-w-sm p-5 rounded-2xl border shadow-2xl ${
                  isDarkMode 
                    ? "bg-slate-900 border-blue-500/40 shadow-blue-500/10" 
                    : "bg-white border-blue-200 shadow-blue-500/20"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>Step 2 of 3</span>
                    <div className="flex gap-1 ml-auto">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className={`w-2 h-2 rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`} />
                    </div>
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Review Your Highlights</h3>
                  <p className={`text-sm mb-4 leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    A floating <span className={`font-bold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>📝 badge</span> appears in the corner showing your saved count. Click it to open the highlights drawer.
                  </p>
                  <div className={`border-t border-dashed mb-4 ${isDarkMode ? "border-slate-700" : "border-slate-200"}`} />
                  <div className="flex items-center justify-between">
                    <button onClick={endTour} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}>
                      Skip Tour
                    </button>
                    <button onClick={advanceTour} className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-400 transition-colors flex items-center gap-1">
                      Next
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Export Actions */}
            {guidedTourStep === 2 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
                {/* Mock export buttons */}
                <div className="flex gap-3">
                  <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                  }`}>
                    📄 Export PDF
                  </div>
                  <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isDarkMode ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-900"
                  }`}>
                    📋 Copy Text
                  </div>
                  <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isDarkMode ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-900"
                  }`}>
                    🔗 Share Link
                  </div>
                </div>
                {/* Pulsing ring around buttons */}
                <div className="absolute -inset-4 rounded-2xl border-2 border-dashed border-blue-400/50 animate-pulse pointer-events-none" />
                {/* Coach mark card */}
                <div className={`max-w-sm p-5 rounded-2xl border shadow-2xl ${
                  isDarkMode 
                    ? "bg-slate-900 border-blue-500/40 shadow-blue-500/10" 
                    : "bg-white border-blue-200 shadow-blue-500/20"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>Step 3 of 3</span>
                    <div className="flex gap-1 ml-auto">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Export & Share</h3>
                  <p className={`text-sm mb-4 leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    From the drawer, <span className={`font-bold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>export as PDF</span> for interview prep, copy to clipboard, or generate a shareable link. Your highlights are saved for 7 days.
                  </p>
                  <div className={`border-t border-dashed mb-4 ${isDarkMode ? "border-slate-700" : "border-slate-200"}`} />
                  <div className="flex items-center justify-between">
                    <button onClick={endTour} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}>
                      Skip
                    </button>
                    <button onClick={endTour} className="text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 transition-colors flex items-center gap-1">
                      Got it!
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
