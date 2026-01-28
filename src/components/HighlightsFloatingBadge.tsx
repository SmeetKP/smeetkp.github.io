"use client";

import { motion, AnimatePresence } from "framer-motion";

interface HighlightsFloatingBadgeProps {
  count: number;
  onClick: () => void;
  isDarkMode: boolean;
}

export default function HighlightsFloatingBadge({
  count,
  onClick,
  isDarkMode,
}: HighlightsFloatingBadgeProps) {
  if (count === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border-2 transition-all ${
          isDarkMode
            ? "bg-blue-600 border-blue-400 text-white hover:bg-blue-500"
            : "bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          <div className="text-left">
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs opacity-90">Highlights</div>
          </div>
        </div>
      </motion.button>
    </AnimatePresence>
  );
}
