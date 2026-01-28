"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExperienceItemDetailed } from "@/types/content";
import { HighlightItem } from "@/types/highlights";

interface ExperienceCardDetailedProps {
  experience: ExperienceItemDetailed;
  isDarkMode: boolean;
  index: number;
  onAddHighlight?: (item: HighlightItem) => void;
  onRemoveHighlight?: (company: string, sectionId: string) => void;
  isHighlighted?: (company: string, sectionId: string) => boolean;
}

export default function ExperienceCardDetailed({
  experience,
  isDarkMode,
  index,
  onAddHighlight,
  onRemoveHighlight,
  isHighlighted,
}: ExperienceCardDetailedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const expandAllSections = () => {
    const allSectionIds = experience.sections.map((s) => s.id);
    setExpandedSections(new Set(allSectionIds));
  };

  const collapseAllSections = () => {
    setExpandedSections(new Set());
  };

  const proficiencyColors = {
    expert: isDarkMode
      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
      : "bg-blue-100 text-blue-700 border-blue-300",
    advanced: isDarkMode
      ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
      : "bg-cyan-100 text-cyan-700 border-cyan-300",
    proficient: isDarkMode
      ? "bg-slate-500/15 text-slate-300 border-slate-500/30"
      : "bg-slate-100 text-slate-700 border-slate-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-2xl border transition-all duration-300 ${
        isDarkMode
          ? "bg-slate-800/40 border-slate-700/50 hover:border-blue-500/30"
          : "bg-white border-slate-200 hover:border-blue-400 shadow-sm"
      }`}
    >
      {/* Level 1: Card Header (Always Visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              {experience.company}
            </h3>
            <p className={`font-medium ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
              {experience.role}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2 md:mt-0">
            <div className={`text-sm md:text-right ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              <div className={`font-medium ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                {experience.period}
              </div>
              <div>
                {experience.location}
                {experience.locationType && ` (${experience.locationType})`}
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={`text-2xl ${isDarkMode ? "text-blue-400" : "text-blue-500"}`}
            >
              ⌄
            </motion.div>
          </div>
        </div>

        {/* Quick Stats (Level 1) */}
        {!isExpanded && (
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              {experience.quickStats.scale.map((stat, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-1 rounded ${
                    isDarkMode
                      ? "bg-blue-500/10 text-blue-300"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {stat}
                </span>
              ))}
            </div>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              {experience.quickStats.impactAreas} impact areas • {experience.quickStats.achievements}
            </p>
            <p className={`text-sm font-medium ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
              Click to expand full experience ↓
            </p>
          </div>
        )}
      </button>

      {/* Level 2 & 3: Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="max-h-[600px] overflow-y-auto"
          >
            {/* Sticky Bulk Actions */}
            <div className={`sticky top-0 z-20 px-6 py-3 border-b ${
              isDarkMode 
                ? "bg-slate-800/98 border-slate-700/30 backdrop-blur-md shadow-lg" 
                : "bg-white/98 border-slate-200 backdrop-blur-md shadow-sm"
            }`}>
              <div className="flex gap-2">
                <button
                  onClick={expandAllSections}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  Expand All Sections
                </button>
                <button
                  onClick={collapseAllSections}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Sections Container */}
            <div className="px-6 pb-6 pt-3 space-y-3">

              {/* Sections */}
              {experience.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => {
                  const isSectionExpanded = expandedSections.has(section.id);

                  return (
                    <div
                      key={section.id}
                      className={`rounded-xl border transition-all ${
                        isDarkMode
                          ? "bg-slate-900/40 border-slate-700/30"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      {/* Level 2: Section Header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="flex-1 text-left"
                            aria-expanded={isSectionExpanded}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{section.icon}</span>
                              <h4
                                className={`font-bold text-base ${
                                  isDarkMode ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {section.title}
                              </h4>
                            </div>
                            {/* Preview Metrics */}
                            <div className="space-y-1">
                              {section.preview.topMetrics.map((metric, i) => (
                                <div
                                  key={i}
                                  className={`text-sm flex items-center gap-2 ${
                                    isDarkMode ? "text-slate-300" : "text-slate-600"
                                  }`}
                                >
                                  <span className={isDarkMode ? "text-blue-400" : "text-blue-500"}>
                                    •
                                  </span>
                                  {metric}
                                </div>
                              ))}
                              <p
                                className={`text-xs mt-2 ${
                                  isDarkMode ? "text-slate-500" : "text-slate-500"
                                }`}
                              >
                                {section.preview.bulletCount} detailed points
                              </p>
                            </div>
                          </button>
                          <div className="flex items-center gap-2">
                            {/* Star Button for Highlighting */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Star button clicked!', {
                                  company: experience.company,
                                  sectionId: section.id,
                                  hasAddHighlight: !!onAddHighlight,
                                  hasRemoveHighlight: !!onRemoveHighlight,
                                  hasIsHighlighted: !!isHighlighted
                                });
                                
                                if (!onAddHighlight || !onRemoveHighlight || !isHighlighted) {
                                  console.error('Highlight functions not provided!');
                                  return;
                                }
                                
                                const highlighted = isHighlighted(experience.company, section.id);
                                console.log('Current highlight state:', highlighted);
                                
                                if (highlighted) {
                                  onRemoveHighlight(experience.company, section.id);
                                } else {
                                  onAddHighlight({
                                    company: experience.company,
                                    role: experience.role,
                                    sectionId: section.id,
                                    sectionTitle: section.title,
                                    sectionIcon: section.icon,
                                    content: section.content,
                                  });
                                }
                              }}
                              className={`text-xl px-2 py-1 rounded transition-all ${
                                isHighlighted && isHighlighted(experience.company, section.id)
                                  ? isDarkMode
                                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                  : isDarkMode
                                  ? "bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-slate-700"
                                  : "bg-white text-slate-400 hover:text-blue-600 hover:bg-slate-50"
                              }`}
                              title={isHighlighted && isHighlighted(experience.company, section.id) ? "Remove from highlights" : "Add to highlights"}
                            >
                              {isHighlighted && isHighlighted(experience.company, section.id) ? "★" : "☆"}
                            </button>
                            {/* Expand/Collapse Button */}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSection(section.id);
                              }}
                              animate={{ rotate: isSectionExpanded ? 0 : 0 }}
                              className={`text-xl px-2 py-1 rounded transition-colors ${
                                isDarkMode
                                  ? "bg-slate-800 text-blue-400 hover:bg-slate-700"
                                  : "bg-white text-blue-500 hover:bg-slate-50"
                              }`}
                              title={isSectionExpanded ? "Collapse section" : "Expand section"}
                            >
                              {isSectionExpanded ? "−" : "+"}
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Level 3: Section Content */}
                      <AnimatePresence>
                        {isSectionExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-4">
                              {/* Bullets */}
                              <ul className="space-y-3">
                                {section.content.bullets.map((bullet, i) => (
                                  <li
                                    key={i}
                                    className={`flex items-start gap-3 text-sm leading-relaxed ${
                                      isDarkMode ? "text-slate-300" : "text-slate-600"
                                    }`}
                                  >
                                    <span
                                      className={`mt-1.5 text-xs ${
                                        isDarkMode ? "text-blue-400" : "text-blue-500"
                                      }`}
                                    >
                                      ●
                                    </span>
                                    <span>{bullet}</span>
                                  </li>
                                ))}
                              </ul>

                              {/* Metrics Cards */}
                              {section.content.metrics && section.content.metrics.length > 0 && (
                                <div>
                                  <h5
                                    className={`text-sm font-bold mb-3 ${
                                      isDarkMode ? "text-white" : "text-slate-900"
                                    }`}
                                  >
                                    📊 IMPACT METRICS
                                  </h5>
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {section.content.metrics.map((metric, i) => (
                                      <div
                                        key={i}
                                        className={`p-3 rounded-lg border ${
                                          isDarkMode
                                            ? "bg-slate-800/60 border-slate-700/50"
                                            : "bg-white border-slate-200"
                                        }`}
                                      >
                                        <div className="text-xl mb-1">{metric.icon}</div>
                                        <div
                                          className={`text-lg font-bold ${
                                            isDarkMode ? "text-white" : "text-slate-900"
                                          }`}
                                        >
                                          {metric.value}
                                        </div>
                                        <div
                                          className={`text-xs ${
                                            isDarkMode ? "text-slate-400" : "text-slate-600"
                                          }`}
                                        >
                                          {metric.label}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Sub-sections */}
                              {section.content.subSections &&
                                section.content.subSections.length > 0 && (
                                  <div className="space-y-3">
                                    {section.content.subSections.map((subSection, i) => (
                                      <div
                                        key={i}
                                        className={`p-3 rounded-lg border ${
                                          isDarkMode
                                            ? "bg-slate-800/40 border-slate-700/30"
                                            : "bg-white border-slate-200"
                                        }`}
                                      >
                                        <h6
                                          className={`text-sm font-bold mb-2 ${
                                            isDarkMode ? "text-white" : "text-slate-900"
                                          }`}
                                        >
                                          {subSection.title}
                                        </h6>
                                        <ul className="space-y-1.5">
                                          {subSection.bullets.map((bullet, j) => (
                                            <li
                                              key={j}
                                              className={`text-xs flex items-start gap-2 ${
                                                isDarkMode ? "text-slate-400" : "text-slate-600"
                                              }`}
                                            >
                                              <span
                                                className={
                                                  isDarkMode ? "text-blue-400" : "text-blue-500"
                                                }
                                              >
                                                →
                                              </span>
                                              {bullet}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

              {/* Tech Stack Section */}
              {experience.techStack && (
                <div
                  className={`rounded-xl border p-4 ${
                    isDarkMode
                      ? "bg-slate-900/40 border-slate-700/30"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🛠️</span>
                    <h4 className={`font-bold text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      Tech Stack & Skills
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {experience.techStack.categories.map((category, i) => (
                      <div key={i}>
                        <h5
                          className={`text-sm font-semibold mb-2 ${
                            isDarkMode ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          {category.name}
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {category.technologies.map((tech, j) => (
                            <span
                              key={j}
                              className={`text-xs px-3 py-1.5 rounded-lg border ${
                                tech.proficiency
                                  ? proficiencyColors[tech.proficiency]
                                  : isDarkMode
                                  ? "bg-slate-700/50 text-slate-300 border-slate-600"
                                  : "bg-slate-100 text-slate-700 border-slate-300"
                              }`}
                            >
                              {tech.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
