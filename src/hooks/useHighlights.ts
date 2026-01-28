"use client";

import { useState, useEffect } from "react";
import { HighlightItem } from "@/types/highlights";

const STORAGE_KEY = "portfolio-interview-highlights";
const EXPIRY_DAYS = 7;

interface StoredHighlights {
  items: HighlightItem[];
  timestamp: number;
}

export function useHighlights() {
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredHighlights = JSON.parse(stored);
        const now = Date.now();
        const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        if (now - data.timestamp < expiryTime) {
          setHighlights(data.items);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveToStorage = (items: HighlightItem[]) => {
    if (typeof window === "undefined") return;

    const data: StoredHighlights = {
      items,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const addHighlight = (item: HighlightItem) => {
    const newHighlights = [...highlights, item];
    setHighlights(newHighlights);
    saveToStorage(newHighlights);
  };

  const removeHighlight = (company: string, sectionId: string) => {
    const newHighlights = highlights.filter(
      (h) => !(h.company === company && h.sectionId === sectionId)
    );
    setHighlights(newHighlights);
    saveToStorage(newHighlights);
  };

  const isHighlighted = (company: string, sectionId: string) => {
    return highlights.some(
      (h) => h.company === company && h.sectionId === sectionId
    );
  };

  const clearAll = () => {
    setHighlights([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return {
    highlights,
    isDrawerOpen,
    addHighlight,
    removeHighlight,
    isHighlighted,
    clearAll,
    toggleDrawer,
    setIsDrawerOpen,
  };
}
