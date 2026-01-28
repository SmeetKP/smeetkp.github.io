import { PortfolioContent, ProfileData, ExperienceItem, ProjectItem, SkillCategory, MetricsItem, ContactData } from "@/types/content";

import defaultProfile from "./profile.json";
import defaultExperience from "./experience.json";
import defaultProjects from "./projects.json";
import defaultSkills from "./skills.json";
import defaultMetrics from "./metrics.json";
import defaultContact from "./contact.json";

const defaultContent: PortfolioContent = {
  profile: defaultProfile as ProfileData,
  experience: defaultExperience as ExperienceItem[],
  projects: defaultProjects as ProjectItem[],
  skills: defaultSkills as SkillCategory[],
  metrics: defaultMetrics as MetricsItem[],
  contact: defaultContact as ContactData,
};

// Registry of available company variants
// In a real app, this could be dynamic, but for static bundling, we explicit imports or glob patterns
type CompanyLoader = {
  profile?: () => Promise<{ default: Partial<ProfileData> }>;
  experience?: () => Promise<{ default: ExperienceItem[] }>;
  projects?: () => Promise<{ default: ProjectItem[] }>;
  skills?: () => Promise<{ default: SkillCategory[] }>;
  metrics?: () => Promise<{ default: MetricsItem[] }>;
  contact?: () => Promise<{ default: ContactData }>;
};

const companyVariants: Record<string, CompanyLoader> = {
  google: {
    profile: () => import("./companies/google/profile.json") as Promise<{ default: Partial<ProfileData> }>,
  },
  microsoft: {
    profile: () => import("./companies/microsoft/profile.json") as Promise<{ default: Partial<ProfileData> }>,
  },
  amazon: {
    profile: () => import("./companies/amazon/profile.json") as Promise<{ default: Partial<ProfileData> }>,
  },
};

export async function loadContent(variant?: string | null): Promise<PortfolioContent> {
  if (!variant || !companyVariants[variant]) {
    return defaultContent;
  }

  const companyLoader = companyVariants[variant];
  const newContent = { ...defaultContent };

  // Helper to load and merge partial data
  // We accept that company variants might only override specific files
  
  if (companyLoader.profile) {
    try {
      const loadedModule = await companyLoader.profile();
      // Shallow merge for profile to allow overriding specific fields
      newContent.profile = { ...newContent.profile, ...loadedModule.default };
    } catch (e) {
      console.warn(`Failed to load profile for ${variant}`, e);
    }
  }

  // Add handlers for other files (experience, projects, etc.) as they are added to variants
  /*
  if (companyLoader.experience) {
    const module = await companyLoader.experience();
    newContent.experience = module.default;
  }
  */

  return newContent;
}
