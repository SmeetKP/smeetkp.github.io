"use client";

import { useContent } from "../hooks/useContent";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import CalmBackground from "./CalmBackground";

interface ProfessionalModeProps {
  onSwitchMode: () => void;
  onBack: () => void;
}

const TRUST_LOGOS = [
  { name: "Sonova", industry: "MedTech" },
  { name: "Phonak", industry: "Hearing" },
  { name: "Unitron", industry: "Hearing" },
  { name: "Advanced Bionics", industry: "Cochlear" },
  { name: "Sennheiser", industry: "Audio" },
];

const NAV_SECTIONS = [
  { id: "hero", label: "Overview", icon: "👤" },
  { id: "about", label: "About", icon: "📋" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "skills", label: "Skills", icon: "⚡" },
  { id: "contact", label: "Contact", icon: "📬" },
];

export default function ProfessionalMode({ onSwitchMode, onBack }: ProfessionalModeProps) {
  const { content } = useContent();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
    <div className="min-h-screen relative">
      <CalmBackground isDarkMode={true} />
      
      {/* Header - Command Center Style */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-white text-sm transition-all border border-slate-700/50"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
              SP
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white hidden md:block">{content.profile.name}</h1>
          </div>
          <button
            onClick={onSwitchMode}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium uppercase transition-all border border-emerald-500/50 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] flex items-center gap-2"
          >
            <span>🎮</span> Interactive Journey
          </button>
        </div>
      </header>

      {/* Sticky Navigation Sidebar - Desktop */}
      <nav className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 flex-col gap-2">
        {NAV_SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${
              activeSection === section.id
                ? "bg-blue-500/20 border border-blue-500/50 shadow-lg shadow-blue-500/10"
                : "bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600/50"
            }`}
          >
            <span className="text-lg">{section.icon}</span>
            <span className={`text-sm font-medium transition-all duration-300 ${
              activeSection === section.id ? "text-blue-400" : "text-slate-400 group-hover:text-white"
            }`}>
              {section.label}
            </span>
            {activeSection === section.id && (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-auto animate-pulse" />
            )}
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
          <div className="absolute bottom-16 right-0 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 shadow-xl min-w-[160px]">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === section.id
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-slate-300 hover:bg-slate-800/80"
                }`}
              >
                <span>{section.icon}</span>
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-12 lg:pl-48">
        
        {/* Hero Command Center - Bento Grid */}
        <section id="section-hero" className="mb-12 md:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Main Hero Card - spans 8 cols */}
            <div className="md:col-span-8 bento-card p-6 md:p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg shadow-blue-500/20">
                  SP
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {content.profile.name}
                  </h2>
                  <p className="text-blue-400 text-lg">{content.profile.role}</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed text-base md:text-lg mb-6">
                {content.profile.summary}
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/30">📍 {content.profile.location}</span>
                <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm border border-emerald-500/30">🌍 EU Blue Card</span>
                <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-sm border border-purple-500/30">🇺🇸 US B1 Visa</span>
              </div>
            </div>
            
            {/* Metrics Stack - spans 4 cols */}
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
              {content.metrics.slice(0, 4).map((metric, i) => (
                <div 
                  key={i} 
                  className="bento-card p-4 text-center bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 transition-all group"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`text-2xl md:text-3xl font-bold ${metric.color} group-hover:scale-110 transition-transform`}>
                    {metric.value}
                  </div>
                  <div className="text-xs md:text-sm text-slate-400 mt-1">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Layer - Company Logos */}
        <section className="mb-12 md:mb-16">
          <div className="text-center mb-6">
            <p className="text-slate-500 text-sm uppercase tracking-wider">Trusted by Industry Leaders</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {TRUST_LOGOS.map((logo, i) => (
              <div 
                key={i} 
                className="px-4 py-2 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all"
              >
                <span className="text-slate-400 font-medium">{logo.name}</span>
                <span className="text-slate-600 text-xs ml-2">• {logo.industry}</span>
              </div>
            ))}
          </div>
        </section>

        {/* About Section - Enhanced */}
        <section id="section-about" className="bento-card mb-8 md:mb-12 p-6 md:p-8 bg-slate-800/60 border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-xl">👤</div>
            <h3 className="text-xl md:text-2xl font-bold text-white">About Me</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-300 leading-relaxed">
                {content.profile.detailed_summary}
              </p>
            </div>
            <div className="space-y-3">
              {content.profile.attributes.map((attr, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-xl">
                  <span className="text-cyan-400 mt-0.5">✦</span>
                  <span className="text-slate-300 text-sm">{attr}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Timeline - Scrollytelling */}
        <section id="section-experience" className="mb-8 md:mb-12" ref={timelineRef}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-xl">💼</div>
            <h3 className="text-xl md:text-2xl font-bold text-white">Experience Journey</h3>
            <div className="ml-auto text-sm text-slate-500">
              {visibleExperiences}/{content.experience.length} roles
            </div>
          </div>
          
          {/* Timeline Track */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-slate-700">
              <div 
                className="w-full bg-gradient-to-b from-blue-500 to-cyan-500 transition-all duration-300"
                style={{ height: `${scrollProgress * 100}%` }}
              />
            </div>
            
            <div className="space-y-6">
              {content.experience.map((exp, i) => {
                const isVisible = i < visibleExperiences;
                return (
                  <div 
                    key={i} 
                    className={`relative pl-12 md:pl-20 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-2 md:left-6 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                      isVisible ? 'bg-blue-500 border-blue-400 scale-100' : 'bg-slate-700 border-slate-600 scale-75'
                    }`} />
                    
                    <div className={`bento-card p-5 md:p-6 transition-all duration-300 ${
                      isVisible ? 'bg-slate-800/70 border-slate-600/50' : 'bg-slate-800/40 border-slate-700/30'
                    }`}>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-white">{exp.company}</h4>
                          <p className="text-blue-400">{exp.role}</p>
                        </div>
                        <div className="text-sm text-slate-400 mt-1 md:mt-0 md:text-right">
                          <div className="font-medium">{exp.period}</div>
                          <div>{exp.location}</div>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {exp.highlights.map((h, j) => (
                          <li key={j} className="text-slate-300 text-sm flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Skills Section - Enhanced Grid */}
        <section id="section-skills" className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-xl">⚡</div>
            <h3 className="text-xl md:text-2xl font-bold text-white">Technical Arsenal</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {content.skills.map((cat, i) => (
              <div key={i} className="bento-card p-5 bg-slate-800/60 border-slate-700/50 hover:border-slate-600/50 transition-all">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                  {cat.category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((skill, j) => (
                    <span
                      key={j}
                      className="px-3 py-1.5 bg-slate-700/60 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors border border-slate-600/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section - CTA */}
        <section id="section-contact" className="bento-card text-center p-8 md:p-10 bg-gradient-to-br from-slate-800/80 to-blue-900/30 border-blue-500/20">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-3xl">
            📬
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Let&apos;s Build Something Great</h3>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Open to discussing data leadership opportunities, AI strategy consulting, or innovative analytics projects.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <a
              href={`mailto:${content.contact.email}`}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              📧 Send Email
            </a>
            <a
              href={`https://${content.contact.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-slate-700/80 hover:bg-slate-700 text-white rounded-xl transition-all font-medium border border-slate-600/50"
            >
              💼 Connect on LinkedIn
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">
            © 2026 {content.profile.name}. All rights reserved.
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              ↑ Back to top
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
