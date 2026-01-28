"use client";

import { useEffect, useState } from "react";
import { loadDetailedExperience } from "@/data/loader";
import { ExperienceItemDetailed } from "@/types/content";
import { HighlightItem } from "@/types/highlights";
import ExperienceCardDetailed from "./ExperienceCardDetailed";

interface ExperienceSectionProps {
  isDarkMode: boolean;
  onAddHighlight?: (item: HighlightItem) => void;
  onRemoveHighlight?: (company: string, sectionId: string) => void;
  isHighlighted?: (company: string, sectionId: string) => boolean;
}

export default function ExperienceSection({ 
  isDarkMode, 
  onAddHighlight,
  onRemoveHighlight,
  isHighlighted
}: ExperienceSectionProps) {
  const [detailedExperience, setDetailedExperience] = useState<ExperienceItemDetailed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDetailedExperience().then((data) => {
      setDetailedExperience(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-32 rounded-2xl animate-pulse ${
              isDarkMode ? "bg-slate-800/40" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {detailedExperience.map((exp, i) => (
        <ExperienceCardDetailed
          key={i}
          experience={exp}
          isDarkMode={isDarkMode}
          index={i}
          onAddHighlight={onAddHighlight}
          onRemoveHighlight={onRemoveHighlight}
          isHighlighted={isHighlighted}
        />
      ))}
    </div>
  );
}
