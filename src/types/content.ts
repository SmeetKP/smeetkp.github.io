export interface ProfileData {
  name: string;
  role: string;
  location: string;
  summary: string;
  detailed_summary: string;
  attributes: string[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  highlights: string[];
}

export interface ExperienceMetric {
  icon: string;
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
}

export interface ExperienceSubSection {
  title: string;
  bullets: string[];
}

export interface ExperienceSectionContent {
  bullets: string[];
  metrics?: ExperienceMetric[];
  subSections?: ExperienceSubSection[];
}

export interface ExperienceSection {
  id: string;
  title: string;
  icon: string;
  order: number;
  preview: {
    topMetrics: string[];
    bulletCount: number;
  };
  content: ExperienceSectionContent;
}

export interface TechnologyItem {
  name: string;
  proficiency?: "expert" | "advanced" | "proficient";
  icon?: string;
}

export interface TechStackCategory {
  name: string;
  technologies: TechnologyItem[];
}

export interface ExperienceItemDetailed {
  company: string;
  role: string;
  period: string;
  location: string;
  locationType?: "On-site" | "Remote" | "Hybrid";
  quickStats: {
    scale: string[];
    impactAreas: number;
    achievements: string;
  };
  sections: ExperienceSection[];
  techStack?: {
    categories: TechStackCategory[];
  };
}

export interface ProjectItem {
  title: string;
  subtitle: string;
  description: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface MetricsItem {
  value: string;
  label: string;
  color: string;
}

export interface ContactData {
  email: string;
  linkedin: string;
  location: string;
  openToWork: boolean;
}

export interface PortfolioContent {
  profile: ProfileData;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  metrics: MetricsItem[];
  contact: ContactData;
}
