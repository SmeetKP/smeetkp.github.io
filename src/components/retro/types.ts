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
  type: 'player' | 'ground' | 'brick' | 'question' | 'pipe' | 'item' | 'particle' | 'text' | 'castle' | 'cloud' | 'bush' | 'scenery' | 'billboard' | 'coin' | 'enemy' | 'goomba' | 'mushroom';
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
}

export type SoundCallback = (type: 'jump' | 'break' | 'coin' | 'powerup' | 'bump' | 'die') => void;
