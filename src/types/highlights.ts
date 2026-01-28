import { ExperienceMetric } from "./content";

export interface HighlightItem {
  company: string;
  role: string;
  sectionId: string;
  sectionTitle: string;
  sectionIcon: string;
  content: {
    bullets: string[];
    metrics?: ExperienceMetric[];
  };
}

export interface HighlightsState {
  items: HighlightItem[];
  isDrawerOpen: boolean;
}
