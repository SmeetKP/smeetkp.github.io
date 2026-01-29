import { Entity, ExperienceData, ExperienceSection } from './types';
import { PortfolioContent } from '@/types/content';
import experienceData from '@/data/experience-detailed.json';

export interface LevelData {
  entities: Entity[];
  bookmarks: Record<string, number>;
  totalAchievements: number;
  totalFlags: number;
}

// Section-specific challenge definitions - meaningful defeat messages for recruiters
const SECTION_CHALLENGES: Record<string, { label: string; defeatMessage: string }[]> = {
  'profile-summary': [
    { label: 'SCALE', defeatMessage: 'Scaled to 20 countries globally!' }
  ],
  'enterprise-bi': [
    { label: 'KPI', defeatMessage: 'Standardized KPIs across 20 markets!' },
    { label: 'ALIGN', defeatMessage: 'Aligned C-suite reporting!' }
  ],
  'data-engineering': [
    { label: 'MANUAL', defeatMessage: 'Automated pipelines, saved 75% FTE!' },
    { label: 'SLOW', defeatMessage: 'Reduced reporting cycle by 35%!' }
  ],
  'data-governance': [
    { label: 'LEAK', defeatMessage: 'Implemented Unity Catalog controls!' },
    { label: 'GDPR', defeatMessage: 'Achieved 20 jurisdiction compliance!' }
  ],
  'genai-delivery': [
    { label: 'AI RISK', defeatMessage: 'Reduced hallucinations by 90%!' },
    { label: 'PII', defeatMessage: 'Established AI Governance Board!' }
  ],
  'data-apps': [
    { label: 'SILOS', defeatMessage: 'Integrated multi-source analytics!' }
  ],
  'leadership': [
    { label: 'CHAOS', defeatMessage: 'Improved team velocity by 20%!' },
    { label: 'CHURN', defeatMessage: 'Increased retention by 15%!' }
  ],
  'advanced-analytics': [
    { label: 'COST', defeatMessage: 'Reduced workforce costs by 15%!' },
    { label: 'WASTE', defeatMessage: 'Optimized resource allocation!' }
  ]
};

// Hidden achievements for question blocks - full meaningful messages
const HIDDEN_ACHIEVEMENTS: Record<string, string> = {
  'enterprise-bi': 'Personally liaised with CEO & VP Marketing for board reporting!',
  'genai-delivery': 'Established enterprise AI Governance Board!',
  'leadership': 'Led 14 FTE Kaizen team across 6 countries!',
  'advanced-analytics': 'Developed Apple AirPods competitive strategy with R&D!'
};

// Concise content for adaptive billboards - each line fits without overflow
const SECTION_FULL_CONTENT: Record<string, { title: string; content: string }> = {
  'profile-summary': { 
    title: 'GLOBAL IMPACT',
    content: '20 countries\n175 users\n53% daily active'
  },
  'enterprise-bi': { 
    title: 'ENTERPRISE BI',
    content: '+2.1% QoQ sales\n+60% engagement\n21 dashboards'
  },
  'data-engineering': { 
    title: 'DATA ENGINEERING',
    content: '-75% FTE time\n-35% cycle time\nAutomated pipelines'
  },
  'data-governance': { 
    title: 'DATA GOVERNANCE',
    content: '99.9% reliability\n20 jurisdictions\nGDPR/PIPL/LGPD'
  },
  'genai-delivery': { 
    title: 'GENAI DELIVERY',
    content: '-90% hallucination\nAI Governance\nRAG architecture'
  },
  'data-apps': { 
    title: 'DATA APPS',
    content: 'Multi-source\nReal-time\nSelf-service'
  },
  'leadership': { 
    title: 'LEADERSHIP',
    content: '14 FTE team\n6 countries\n+20% velocity'
  },
  'advanced-analytics': { 
    title: 'ANALYTICS',
    content: '-15% cost\nPredictive models\nR&D collab'
  }
};

// Jurisdiction flags for governance section
const JURISDICTION_FLAGS = [
  { code: '🇬🇧', country: 'UK', law: 'UK GDPR + DPA 2018' },
  { code: '🇮🇪', country: 'Ireland', law: 'GDPR + DPA 2018' },
  { code: '🇧🇪', country: 'Belgium', law: 'GDPR + Belgian DPA' },
  { code: '🇱🇺', country: 'Luxembourg', law: 'GDPR + Law of 2018' },
  { code: '🇸🇪', country: 'Sweden', law: 'GDPR + DPA 2018:218' },
  { code: '🇦🇹', country: 'Austria', law: 'GDPR + DSG' },
  { code: '🇭🇺', country: 'Hungary', law: 'GDPR + Act CXII' },
  { code: '🇫🇷', country: 'France', law: 'GDPR + Loi Informatique' },
  { code: '🇳🇱', country: 'Netherlands', law: 'GDPR + UAVG' },
  { code: '🇮🇹', country: 'Italy', law: 'GDPR + DL 196/2003' },
  { code: '🇩🇰', country: 'Denmark', law: 'GDPR + Databeskyttelsesloven' },
  { code: '🇵🇱', country: 'Poland', law: 'GDPR + Act of 2018' },
  { code: '🇩🇪', country: 'Germany', law: 'GDPR + BDSG' },
  { code: '🇨🇦', country: 'Canada', law: 'PIPEDA' },
  { code: '🇧🇷', country: 'Brazil', law: 'LGPD' },
  { code: '🇺🇸', country: 'USA', law: 'CCPA/CPRA' },
  { code: '🇦🇺', country: 'Australia', law: 'Privacy Act 1988' },
  { code: '🇳🇿', country: 'New Zealand', law: 'Privacy Act 2020' },
  { code: '🇯🇵', country: 'Japan', law: 'APPI' },
  { code: '🇨🇳', country: 'China', law: 'PIPL' }
];

export class LevelGenerator {
  private static groundY = 500;

  static generate(content: PortfolioContent): LevelData {
    const entities: Entity[] = [];
    const bookmarks: Record<string, number> = {};
    let totalAchievements = 0;
    let totalFlags = 0;

    // Get Sonova experience data (first company in array)
    const sonovaData = (experienceData as ExperienceData[])[0];
    
    // Skip profile-summary (redundant with hero billboard), use next 3 sections
    const topSections = sonovaData.sections.filter(s => s.id !== 'profile-summary').slice(0, 3);

    // Left wall
    entities.push({
      id: 'wall_left', type: 'ground', x: -50, y: 0, w: 50, h: 1000,
      vx: 0, vy: 0, color: '#000', active: true, solid: true, gravity: false
    });

    let cursorX = 100;

    // ================================================================
    // ZONE 0: HERO INTRODUCTION
    // ================================================================
    bookmarks['about'] = cursorX;
    
    // Hero Introduction Billboard - adaptive size
    entities.push({
      id: 'sign_hero',
      type: 'billboard',
      x: cursorX, y: this.groundY - 120, w: 200, h: 80,
      vx: 0, vy: 0, color: '#1a1a2e',
      label: 'SMEET PATEL',
      content: 'Data & AI Leader\nBerlin, Germany\n20 Countries',
      active: true, solid: false, gravity: false
    });

    // Years of Experience coin
    entities.push({
      id: 'coin_years',
      type: 'coin',
      x: cursorX + 250, y: this.groundY - 80, w: 36, h: 36,
      vx: 0, vy: 0, color: '#FFD700',
      label: '14+',
      metricValue: '14+',
      metricLabel: 'Years Exp',
      content: '14+ Years',
      active: true, solid: false, gravity: false, textureId: 'metricCoin'
    });
    totalAchievements++;

    cursorX += 400; // More spacing for readability

    // ================================================================
    // COMPANY HEADER: SONOVA
    // ================================================================
    bookmarks['experience'] = cursorX;

    entities.push({
      id: 'sign_company',
      type: 'billboard',
      x: cursorX, y: this.groundY - 120, w: 200, h: 80,
      vx: 0, vy: 0, color: '#1a1a2e',
      label: 'SONOVA GROUP',
      content: 'May 2023 - Present\n175 users\n21 dashboards',
      active: true, solid: false, gravity: false
    });

    cursorX += 350; // More spacing between company and sections

    // ================================================================
    // GENERATE ZONES FROM TOP EXPERIENCE SECTIONS (shorter game)
    // ================================================================
    topSections.forEach((section, sectionIndex) => {
      const zoneEntities = this.generateSectionZone(
        section,
        cursorX,
        sectionIndex,
        sonovaData.techStack
      );
      
      entities.push(...zoneEntities.entities);
      totalAchievements += zoneEntities.achievementCount;
      totalFlags += zoneEntities.flagCount;
      
      bookmarks[section.id] = cursorX;
      cursorX += zoneEntities.width;
    });

    // ================================================================
    // SKIP TECH PLATFORMS - they were causing visual issues
    // ================================================================
    bookmarks['skills'] = cursorX;

    // ================================================================
    // BOSS ZONE: DATA CHAOS - The Final Challenge
    // Story: Data Chaos represents the enterprise challenges Smeet overcame:
    //        pipeline failures, compliance risks, data silos, manual processes
    // ================================================================
    bookmarks['contact'] = cursorX;

    // Story Billboard - Sets up the final challenge narrative
    entities.push({
      id: 'sign_boss_intro',
      type: 'billboard',
      x: cursorX, y: this.groundY - 120, w: 200, h: 80,
      vx: 0, vy: 0, color: '#1a1a2e',
      label: 'THE CHALLENGE',
      content: 'Data Chaos blocks\nthe path to success\nGrab the hammer!',
      active: true, solid: false, gravity: false
    });

    cursorX += 300;

    // Governance Hammer Power-up - at ground level so Mario can walk into it
    entities.push({
      id: 'governance_hammer',
      type: 'hammer',
      x: cursorX, y: this.groundY - 45, w: 40, h: 40,
      vx: 0, vy: 0, color: '#FFD700',
      label: 'HAMMER',
      content: 'Unity Catalog Governance - Your weapon against Data Chaos!',
      active: true, solid: false, gravity: false, textureId: 'hammer'
    });

    cursorX += 200;

    // Final Boss: Data Chaos - Represents all enterprise data challenges
    entities.push({
      id: 'boss_bowser',
      type: 'bowser',
      x: cursorX, y: this.groundY - 80, w: 70, h: 70,
      vx: 0, vy: 0, color: '#1B4D3E',
      label: 'DATA CHAOS',
      content: 'Pipeline failures, compliance risks, data silos',
      defeatMessage: 'DATA CHAOS DEFEATED! Achieved 99.9% reliability across 20 jurisdictions!',
      active: true, solid: false, gravity: false, textureId: 'bowser'
    });
    totalAchievements++;

    cursorX += 180;

    // Victory Castle - The goal achieved
    entities.push({
      id: 'castle', type: 'castle',
      x: cursorX, y: this.groundY - 150, w: 150, h: 150,
      vx: 0, vy: 0, color: '#fff',
      active: true, solid: true, gravity: false, textureId: 'castle'
    });

    cursorX += 180;

    // Victory Billboard - What was achieved by defeating Data Chaos
    entities.push({
      id: 'sign_victory',
      type: 'billboard',
      x: cursorX, y: this.groundY - 120, w: 200, h: 80,
      vx: 0, vy: 0, color: '#1a1a2e',
      label: 'VICTORY!',
      content: '99.9% Reliability\n20 Jurisdictions\nData Governance Master',
      active: true, solid: false, gravity: false
    });

    cursorX += 250; // End buffer

    // --- CONTINUOUS GROUND (generated AFTER knowing final level length) ---
    const levelLength = cursorX + 100;
    for (let i = 0; i < levelLength; i += 50) {
      entities.push({
        id: `g_${i}`, type: 'ground',
        x: i, y: this.groundY, w: 50, h: 50,
        vx: 0, vy: 0, color: '#9C4A00',
        active: true, solid: true, gravity: false, textureId: 'ground'
      });
      entities.push({
        id: `g_deep_${i}`, type: 'scenery',
        x: i, y: this.groundY + 50, w: 50, h: 300,
        vx: 0, vy: 0, color: '#703500',
        active: true, solid: false, gravity: false
      });
    }

    // --- SCENERY: Clouds ---
    for (let i = 0; i < levelLength; i += 400) {
      entities.push({
        id: `cloud_${i}`, type: 'scenery',
        x: i + 80, y: 50 + (i % 4) * 25, w: 150, h: 80,
        vx: 0, vy: 0,
        color: '#fff', active: true, solid: false, gravity: false, textureId: 'cloud'
      });
    }

    return { entities, bookmarks, totalAchievements, totalFlags };
  }

  private static generateSectionZone(
    section: ExperienceSection,
    startX: number,
    sectionIndex: number,
    techStack: ExperienceData['techStack']
  ): { entities: Entity[]; width: number; achievementCount: number; flagCount: number } {
    const entities: Entity[] = [];
    let cursorX = startX;
    let achievementCount = 0;
    let flagCount = 0;

    // Section Billboard - adaptive size with concise content
    const sectionContent = SECTION_FULL_CONTENT[section.id] || { 
      title: section.title.split(',')[0].slice(0, 16), 
      content: section.preview.topMetrics[0]?.slice(0, 20) || ''
    };
    entities.push({
      id: `billboard_${section.id}`,
      type: 'billboard',
      x: cursorX, y: this.groundY - 120, w: 200, h: 80,
      vx: 0, vy: 0, color: '#1a1a2e',
      label: sectionContent.title,
      content: sectionContent.content,
      sectionId: section.id,
      active: true, solid: false, gravity: false
    });

    cursorX += 280; // Space after billboard

    // Generate metric coins from section metrics (max 2) - wider spacing
    if (section.content.metrics) {
      section.content.metrics.slice(0, 2).forEach((metric, i) => {
        // Create meaningful content for HUD display
        const fullMessage = `${metric.value} ${metric.label} achieved!`;
        entities.push({
          id: `coin_${section.id}_${i}`,
          type: 'coin',
          x: cursorX + (i * 100), y: this.groundY - 70 - (i % 2) * 30, w: 32, h: 32,
          vx: 0, vy: 0, color: '#FFD700',
          label: metric.value,
          metricValue: metric.value,
          metricLabel: metric.label,
          content: fullMessage,
          sectionId: section.id,
          active: true, solid: false, gravity: false, textureId: 'metricCoin'
        });
        achievementCount++;
      });
      cursorX += Math.min(section.content.metrics.length, 2) * 100 + 60;
    }

    // Generate section-specific challenges (goombas) - max 1 per section
    const challenges = SECTION_CHALLENGES[section.id] || [];
    if (challenges.length > 0) {
      const challenge = challenges[0];
      entities.push({
        id: `goomba_${section.id}_0`,
        type: 'goomba',
        x: cursorX, y: this.groundY - 40, w: 36, h: 36,
        vx: -25, vy: 0, color: '#8B4513',
        label: challenge.label,
        defeatMessage: challenge.defeatMessage,
        sectionId: section.id,
        active: true, solid: false, gravity: false, textureId: 'goomba'
      });
      cursorX += 120; // More space after goomba
    }

    // Add question block with hidden achievement if available
    const hiddenAchievement = HIDDEN_ACHIEVEMENTS[section.id];
    if (hiddenAchievement) {
      entities.push({
        id: `question_${section.id}`,
        type: 'question',
        x: cursorX, y: this.groundY - 120, w: 40, h: 40,
        vx: 0, vy: 0, color: '#F8931D',
        label: '?',
        content: hiddenAchievement,
        sectionId: section.id,
        active: true, solid: true, gravity: false, textureId: 'question'
      });
      cursorX += 60;
      achievementCount++;
    }

    // Special: Add jurisdiction flags in governance section (reduced to 6)
    if (section.id === 'data-governance') {
      const topFlags = JURISDICTION_FLAGS.slice(0, 6);
      topFlags.forEach((flag, i) => {
        entities.push({
          id: `flag_${flag.country}`,
          type: 'flag',
          x: cursorX + (i * 35), y: this.groundY - 70 - (i % 2) * 30, w: 20, h: 28,
          vx: 0, vy: 0, color: '#FFD700',
          label: flag.code,
          content: flag.country,
          countryCode: flag.code,
          sectionId: section.id,
          active: true, solid: false, gravity: false, textureId: 'flag'
        });
        flagCount++;
      });
      cursorX += topFlags.length * 35 + 30;
    }

    // Add power-up mushroom for first section only
    if (section.id === 'enterprise-bi') {
      entities.push({
        id: `mushroom_${section.id}`,
        type: 'mushroom',
        x: cursorX, y: this.groundY - 60, w: 32, h: 32,
        vx: 0, vy: 0, color: '#DC2626',
        label: 'BI',
        content: 'BI Power!',
        sectionId: section.id,
        active: true, solid: false, gravity: false, textureId: 'mushroom'
      });
      cursorX += 50;
    }

    // Small pipe transition
    entities.push({
      id: `pipe_${section.id}`,
      type: 'scenery',
      x: cursorX, y: this.groundY - 70, w: 50, h: 70,
      vx: 0, vy: 0, color: '#00AA00',
      active: true, solid: false, gravity: false, textureId: 'pipe'
    });

    cursorX += 70;

    return {
      entities,
      width: cursorX - startX,
      achievementCount,
      flagCount
    };
  }

  private static getSectionColor(sectionId: string): string {
    const colors: Record<string, string> = {
      'profile-summary': '#1a1a2e',
      'enterprise-bi': '#DC2626',
      'data-engineering': '#7C3AED',
      'data-governance': '#059669',
      'genai-delivery': '#0891B2',
      'data-apps': '#D97706',
      'leadership': '#DB2777',
      'advanced-analytics': '#4F46E5'
    };
    return colors[sectionId] || '#1a1a2e';
  }
}
