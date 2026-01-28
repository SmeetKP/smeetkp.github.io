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

export async function loadContent(): Promise<PortfolioContent> {
  return defaultContent;
}
