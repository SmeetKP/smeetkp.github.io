"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PortfolioContent } from "@/types/content";
import { loadContent } from "@/data/loader";

// Initial state matching the default imports to prevent flicker
import defaultProfile from "@/data/profile.json";
import defaultExperience from "@/data/experience.json";
import defaultProjects from "@/data/projects.json";
import defaultSkills from "@/data/skills.json";
import defaultMetrics from "@/data/metrics.json";
import defaultContact from "@/data/contact.json";

const initialContent: PortfolioContent = {
  profile: defaultProfile,
  experience: defaultExperience,
  projects: defaultProjects,
  skills: defaultSkills,
  metrics: defaultMetrics,
  contact: defaultContact,
} as PortfolioContent;

export function useContent() {
  const searchParams = useSearchParams();
  const variant = searchParams.get("v") || searchParams.get("company");
  const [content, setContent] = useState<PortfolioContent>(initialContent);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchContent() {
      if (!variant) return; // Already have default
      
      setIsLoading(true);
      try {
        const data = await loadContent(variant.toLowerCase());
        if (isMounted) {
          setContent(data);
        }
      } catch (error) {
        console.error("Failed to load content variant:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [variant]);

  return { content, isLoading, variant };
}
