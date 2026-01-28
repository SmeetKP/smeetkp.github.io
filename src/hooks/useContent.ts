"use client";

import { PortfolioContent } from "@/types/content";

import defaultProfile from "@/data/profile.json";
import defaultExperience from "@/data/experience.json";
import defaultProjects from "@/data/projects.json";
import defaultSkills from "@/data/skills.json";
import defaultMetrics from "@/data/metrics.json";
import defaultContact from "@/data/contact.json";

const content: PortfolioContent = {
  profile: defaultProfile,
  experience: defaultExperience,
  projects: defaultProjects,
  skills: defaultSkills,
  metrics: defaultMetrics,
  contact: defaultContact,
} as PortfolioContent;

export function useContent() {
  return { content, isLoading: false };
}
