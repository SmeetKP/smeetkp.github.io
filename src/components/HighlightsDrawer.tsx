"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HighlightItem } from "@/types/highlights";

interface HighlightsDrawerProps {
  isOpen: boolean;
  highlights: HighlightItem[];
  onClose: () => void;
  onRemove: (company: string, sectionId: string) => void;
  onClearAll: () => void;
  onExportPDF: () => void;
  onCopyToClipboard: () => void;
  onGenerateShareLink: () => void;
  isDarkMode: boolean;
}

export default function HighlightsDrawer({
  isOpen,
  highlights,
  onClose,
  onRemove,
  onClearAll,
  onExportPDF,
  onCopyToClipboard,
  onGenerateShareLink,
  isDarkMode,
}: HighlightsDrawerProps) {
  const groupedHighlights = highlights.reduce((acc, item) => {
    if (!acc[item.company]) {
      acc[item.company] = [];
    }
    acc[item.company].push(item);
    return acc;
  }, {} as Record<string, HighlightItem[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 bottom-0 w-full md:w-[480px] z-50 shadow-2xl ${
              isDarkMode ? "bg-slate-900" : "bg-white"
            }`}
          >
            {/* Header */}
            <div
              className={`sticky top-0 z-10 px-6 py-4 border-b ${
                isDarkMode
                  ? "bg-slate-900/95 border-slate-700 backdrop-blur-md"
                  : "bg-white/95 border-slate-200 backdrop-blur-md"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  <h2
                    className={`text-xl font-bold ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Interview Highlights
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isDarkMode
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {highlights.length}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className={`text-2xl ${
                    isDarkMode
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  ✕
                </button>
              </div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Curated sections for interview preparation
              </p>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-200px)] px-6 py-4">
              {highlights.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="text-6xl mb-4">📋</span>
                  <h3
                    className={`text-lg font-bold mb-2 ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    No highlights yet
                  </h3>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Click the ★ icon on any section to bookmark it for interview
                    prep
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedHighlights).map(
                    ([company, items]) => (
                      <div
                        key={company}
                        className={`rounded-xl border p-4 ${
                          isDarkMode
                            ? "bg-slate-800/40 border-slate-700"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3
                              className={`font-bold text-base ${
                                isDarkMode ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {company}
                            </h3>
                            <p
                              className={`text-xs ${
                                isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-600"
                              }`}
                            >
                              {items[0].role}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.sectionId}
                              className={`flex items-start justify-between gap-2 p-2 rounded-lg ${
                                isDarkMode
                                  ? "bg-slate-900/40"
                                  : "bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-lg">
                                  {item.sectionIcon}
                                </span>
                                <span
                                  className={`text-sm font-medium ${
                                    isDarkMode
                                      ? "text-slate-300"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {item.sectionTitle}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  onRemove(item.company, item.sectionId)
                                }
                                className={`text-xs px-2 py-1 rounded transition-colors ${
                                  isDarkMode
                                    ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                    : "text-slate-500 hover:text-red-600 hover:bg-red-50"
                                }`}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {highlights.length > 0 && (
              <div
                className={`sticky bottom-0 px-6 py-4 border-t ${
                  isDarkMode
                    ? "bg-slate-900/95 border-slate-700 backdrop-blur-md"
                    : "bg-white/95 border-slate-200 backdrop-blur-md"
                }`}
              >
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={onExportPDF}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      isDarkMode
                        ? "bg-blue-600 text-white hover:bg-blue-500"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    📄 Export PDF
                  </button>
                  <button
                    onClick={onCopyToClipboard}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      isDarkMode
                        ? "bg-slate-700 text-white hover:bg-slate-600"
                        : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                    }`}
                  >
                    📋 Copy Text
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onGenerateShareLink}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      isDarkMode
                        ? "bg-slate-700 text-white hover:bg-slate-600"
                        : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                    }`}
                  >
                    🔗 Share Link
                  </button>
                  <button
                    onClick={onClearAll}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      isDarkMode
                        ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    🗑️ Clear All
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
