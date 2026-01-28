import { Entity } from './types';
import { PortfolioContent } from '@/types/content';

export interface LevelData {
  entities: Entity[];
  bookmarks: Record<string, number>;
}

export class LevelGenerator {
  static generate(content: PortfolioContent): LevelData {
    const entities: Entity[] = [];
    const bookmarks: Record<string, number> = {};
    const groundY = 500;
    const levelLength = 3200;

    // --- SCENERY: Clouds (deterministic) ---
    for (let i = 0; i < levelLength; i += 300) {
      entities.push({
        id: `cloud_${i}`, type: 'scenery',
        x: i + 80, y: 50 + (i % 4) * 25, w: 150, h: 80,
        vx: 0, vy: 0,
        color: '#fff', active: true, solid: false, gravity: false, textureId: 'cloud'
      });
    }

    // --- CONTINUOUS GROUND ---
    for (let i = 0; i < levelLength; i += 50) {
      entities.push({
        id: `g_${i}`, type: 'ground',
        x: i, y: groundY, w: 50, h: 50,
        vx: 0, vy: 0, color: '#9C4A00',
        active: true, solid: true, gravity: false, textureId: 'ground'
      });
      entities.push({
        id: `g_deep_${i}`, type: 'scenery',
        x: i, y: groundY + 50, w: 50, h: 300,
        vx: 0, vy: 0, color: '#703500',
        active: true, solid: false, gravity: false
      });
    }

    // Left wall
    entities.push({
      id: 'wall_left', type: 'ground', x: -50, y: 0, w: 50, h: 1000,
      vx: 0, vy: 0, color: '#000', active: true, solid: true, gravity: false
    });

    let cursorX = 120;

    // ================================================================
    // THE CAREER QUEST STORY
    // Each zone represents a chapter in Smeet's professional journey
    // Coins = Real achievements | Enemies = Challenges overcome
    // ================================================================

    // ============================================
    // ZONE 1: ORIGIN - "Who Is This Hero?"
    // ============================================
    bookmarks['about'] = cursorX;
    
    // Hero Introduction Sign
    entities.push({
      id: 'sign_hero',
      type: 'billboard',
      x: cursorX, y: groundY - 160, w: 180, h: 100,
      vx: 0, vy: 0, color: '#1a1a2e',
      label: 'SMEET PATEL',
      content: 'Data & AI Leader\nBerlin, Germany',
      active: true, solid: false, gravity: false
    });

    // Achievement: Years of Experience
    entities.push({
      id: 'coin_exp',
      type: 'coin',
      x: cursorX + 220, y: groundY - 80, w: 32, h: 32,
      vx: 0, vy: 0, color: '#FFD700',
      label: '14+YRS',
      content: '14+ Years Experience',
      active: true, solid: false, gravity: false, textureId: 'coin'
    });

    cursorX += 380;

    // ============================================
    // ZONE 2: THE JOURNEY - Career Milestones
    // Each company = A level conquered
    // ============================================
    bookmarks['experience'] = cursorX;

    // Milestone 1: Current Role
    entities.push({
      id: 'sign_job1',
      type: 'billboard',
      x: cursorX, y: groundY - 150, w: 160, h: 90,
      vx: 0, vy: 0, color: '#1a1a2e',
      label: 'SONOVA',
      content: 'Analytics Manager\n2023 - Present',
      active: true, solid: false, gravity: false
    });

    // Pipe = Transition between roles
    entities.push({
      id: 'pipe_1', type: 'scenery',
      x: cursorX + 200, y: groundY - 100, w: 80, h: 100,
      vx: 0, vy: 0, color: '#00AA00',
      active: true, solid: false, gravity: false, textureId: 'pipe'
    });

    cursorX += 320;

    // Milestone 2: Previous Role
    entities.push({
      id: 'sign_job2',
      type: 'billboard',
      x: cursorX, y: groundY - 150, w: 160, h: 90,
      vx: 0, vy: 0, color: '#1a1a2e',
      label: 'FELMO',
      content: 'Growth Lead\n2022 - 2023',
      active: true, solid: false, gravity: false
    });

    // Achievement: Global Impact
    entities.push({
      id: 'coin_global',
      type: 'coin',
      x: cursorX + 200, y: groundY - 80, w: 32, h: 32,
      vx: 0, vy: 0, color: '#FFD700',
      label: '11',
      content: '11 Countries Impact',
      active: true, solid: false, gravity: false, textureId: 'coin'
    });

    // Pipe
    entities.push({
      id: 'pipe_2', type: 'scenery',
      x: cursorX + 260, y: groundY - 100, w: 80, h: 100,
      vx: 0, vy: 0, color: '#00AA00',
      active: true, solid: false, gravity: false, textureId: 'pipe'
    });

    cursorX += 380;

    // Milestone 3: Earlier Role
    entities.push({
      id: 'sign_job3',
      type: 'billboard',
      x: cursorX, y: groundY - 150, w: 160, h: 90,
      vx: 0, vy: 0, color: '#1a1a2e',
      label: 'JP MORGAN',
      content: 'Data Scientist\n2019 - 2022',
      active: true, solid: false, gravity: false
    });

    cursorX += 280;

    // ============================================
    // ZONE 3: THE ARSENAL - Skills & Powers
    // ============================================
    bookmarks['skills'] = cursorX;

    // Skills Sign
    entities.push({
      id: 'sign_skills',
      type: 'billboard',
      x: cursorX, y: groundY - 160, w: 180, h: 100,
      vx: 0, vy: 0, color: '#1a1a2e',
      label: 'SKILLS',
      content: 'Python, SQL, AI\nTableau, Power BI',
      active: true, solid: false, gravity: false
    });

    // Achievement: Speed Boost
    entities.push({
      id: 'coin_speed',
      type: 'coin',
      x: cursorX + 220, y: groundY - 80, w: 32, h: 32,
      vx: 0, vy: 0, color: '#FFD700',
      label: '70%',
      content: '70% Faster Dev Cycles',
      active: true, solid: false, gravity: false, textureId: 'coin'
    });

    // Question Block: Hidden Achievement
    entities.push({
      id: 'block_secret',
      type: 'question',
      x: cursorX + 300, y: groundY - 150, w: 50, h: 50,
      vx: 0, vy: 0, color: '#F8931D',
      label: '?',
      content: 'Gen AI Pioneer!',
      active: true, solid: true, gravity: false, textureId: 'question'
    });

    cursorX += 420;

    // ============================================
    // ZONE 4: THE DESTINATION - Contact & Victory
    // ============================================
    bookmarks['contact'] = cursorX;

    // Contact Sign
    entities.push({
      id: 'sign_contact',
      type: 'billboard',
      x: cursorX, y: groundY - 150, w: 170, h: 90,
      vx: 0, vy: 0, color: '#1a1a2e',
      label: 'HIRE ME!',
      content: 'smeet3103@gmail\nOpen to Work',
      active: true, solid: false, gravity: false
    });

    // Final Achievement: Business Impact
    entities.push({
      id: 'coin_impact',
      type: 'coin',
      x: cursorX + 210, y: groundY - 80, w: 32, h: 32,
      vx: 0, vy: 0, color: '#FFD700',
      label: '2.1%',
      content: '2.1% Sales Growth',
      active: true, solid: false, gravity: false, textureId: 'coin'
    });

    cursorX += 320;

    // Victory Castle
    entities.push({
      id: 'castle', type: 'castle',
      x: cursorX, y: groundY - 150, w: 150, h: 150,
      vx: 0, vy: 0, color: '#fff',
      active: true, solid: true, gravity: false, textureId: 'castle'
    });

    // ============================================
    // CHALLENGES OVERCOME (Goombas = Past obstacles)
    // Stomp them = Show you conquered challenges
    // ============================================
    
    // Challenge 1: "Legacy Systems" - early career obstacle
    entities.push({
      id: 'challenge_1', type: 'goomba',
      x: 380, y: groundY - 40, w: 40, h: 40,
      vx: -35, vy: 0, color: '#8B4513',
      label: 'LEGACY',
      active: true, solid: false, gravity: false, textureId: 'goomba'
    });

    // Challenge 2: "Data Silos" - mid career
    entities.push({
      id: 'challenge_2', type: 'goomba',
      x: bookmarks['experience'] + 150, y: groundY - 40, w: 40, h: 40,
      vx: -40, vy: 0, color: '#8B4513',
      label: 'SILOS',
      active: true, solid: false, gravity: false, textureId: 'goomba'
    });

    // Challenge 3: "Slow Processes" - skills section
    entities.push({
      id: 'challenge_3', type: 'goomba',
      x: bookmarks['skills'] + 350, y: groundY - 40, w: 40, h: 40,
      vx: -30, vy: 0, color: '#8B4513',
      label: 'SLOW',
      active: true, solid: false, gravity: false, textureId: 'goomba'
    });

    // ============================================
    // POWER-UPS (Mushrooms = Key strengths)
    // ============================================
    
    // Strength 1: "AI/ML" - your superpower
    entities.push({
      id: 'power_ai', type: 'mushroom',
      x: 280, y: groundY - 70, w: 40, h: 40,
      vx: 0, vy: 0, color: '#DC2626',
      label: 'AI',
      content: 'AI/ML Expertise',
      active: true, solid: false, gravity: false, textureId: 'mushroom'
    });

    // Strength 2: "Leadership" - between jobs
    entities.push({
      id: 'power_lead', type: 'mushroom',
      x: bookmarks['experience'] + 280, y: groundY - 70, w: 40, h: 40,
      vx: 0, vy: 0, color: '#DC2626',
      label: 'LEAD',
      content: 'Team Leadership',
      active: true, solid: false, gravity: false, textureId: 'mushroom'
    });

    return { entities, bookmarks };
  }
}
