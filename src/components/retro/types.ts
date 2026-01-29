export type GamePhase = 'intro' | 'playing' | 'victory' | 'gameOver';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Entity extends Rect {
  id: string;
  type: 'player' | 'ground' | 'brick' | 'question' | 'pipe' | 'item' | 'particle' | 'text' | 'castle' | 'cloud' | 'bush' | 'scenery' | 'billboard' | 'coin' | 'enemy' | 'goomba' | 'mushroom' | 'bowser' | 'hammer' | 'flag' | 'techPlatform' | 'sectionBoss';
  textureId?: string; // For SpriteRenderer
  vx: number;
  vy: number;
  color: string;
  label?: string; // Text on the block
  content?: string; // Content revealed on hit
  active: boolean;
  solid: boolean;
  gravity: boolean;
  life?: number; // For particles/text
  facingRight?: boolean; // For sprite flipping
  sectionId?: string; // Links entity to experience section
  metricValue?: string; // For metric coins
  metricLabel?: string; // For metric coins
  defeatMessage?: string; // Custom message when enemy defeated
  countryCode?: string; // For jurisdiction flags
  shakeTimer?: number; // For boss shake animation
}

export interface GameState {
  phase: GamePhase;
  score: number;
  coins: number;
  achievements: number;
  totalAchievements: number;
  sectionsVisited: string[];
  camera: { x: number };
  message: string | null;
  messageTimer: number;
  introTimer: number;
  hasHammer: boolean;
  bowserDefeated: boolean;
  flagsCollected: number;
  totalFlags: number;
  skillsUnlocked: string[];
  metricsCollected: string[];
  challengesOvercome: string[];
  hammerSwingTimer: number;
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
  content: {
    bullets: string[];
    metrics?: {
      icon: string;
      label: string;
      value: string;
      trend: string;
    }[];
    subSections?: {
      title: string;
      bullets: string[];
    }[];
  };
}

export interface ExperienceData {
  company: string;
  role: string;
  period: string;
  location: string;
  locationType: string;
  quickStats: {
    scale: string[];
    impactAreas: number;
    achievements: string;
  };
  sections: ExperienceSection[];
  techStack: {
    categories: {
      name: string;
      technologies: {
        name: string;
        proficiency: string;
      }[];
    }[];
  };
}

export type SoundCallback = (type: 'jump' | 'break' | 'coin' | 'powerup' | 'bump' | 'die') => void;
