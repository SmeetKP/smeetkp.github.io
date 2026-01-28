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
