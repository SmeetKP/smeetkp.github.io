import { Entity, GameState, GamePhase, Rect, SoundCallback } from './types';
import { TextureManager } from './TextureManager';

export class RetroEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private soundCallback: SoundCallback;
  
  public width: number = 0;
  public height: number = 0;
  public player: Entity;
  public gameState: GameState;
  private entities: Entity[] = [];
  private originalEntities: Entity[] = [];
  private particles: Entity[] = []; 
  private animTimer: number = 0;
  private victoryButtons: { x: number; y: number; w: number; h: number; action: string }[] = [];

  // Constants
  private readonly GRAVITY = 1800;
  private readonly JUMP_FORCE = -850; // Increased jump slightly
  private readonly MOVE_SPEED = 400;
  private readonly FRICTION = 0.85;

  constructor(canvas: HTMLCanvasElement, soundCallback: SoundCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.soundCallback = soundCallback;
    
    // Initialize Textures
    TextureManager.init();

    // Default State
    this.gameState = {
      phase: 'intro',
      score: 0,
      coins: 0,
      achievements: 0,
      totalAchievements: 30,
      sectionsVisited: [],
      camera: { x: 0 },
      message: null,
      messageTimer: 0,
      introTimer: 0,
      hasHammer: false,
      bowserDefeated: false,
      flagsCollected: 0,
      totalFlags: 6,
      skillsUnlocked: [],
      metricsCollected: [],
      challengesOvercome: [],
      hammerSwingTimer: 0,
      levelLength: 5000,
      zoneMarkers: [],
      messageQueue: [],
      currentZone: '',
      zoneOverlayTimer: 0,
      zoneOverlayText: ''
    };

    // Default Player (Will be repositioned by level loader)
    this.player = {
      id: "player",
      type: "player",
      x: 100, y: 100, w: 40, h: 40,
      vx: 0, vy: 0,
      color: "#ef4444",
      active: true, solid: true, gravity: true,
      textureId: "hero",
      facingRight: true
    };
    
    // Initialize Dimensions immediately
    this.width = canvas.width;
    this.height = canvas.height;
  }

  // ... (rest of input/physics code remains similar, focusing on render update)

  public loadLevel(entities: Entity[]) {
    // Store deep copy of original entities for restart
    this.originalEntities = JSON.parse(JSON.stringify(entities));
    this.entities = entities;
    this.entities.push(this.player);
    
    // Reset State
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.x = 100;
    this.player.y = 0;
    this.gameState.camera.x = 0;
    this.gameState.phase = 'intro';
    this.gameState.introTimer = 0;
    this.gameState.achievements = 0;
    this.gameState.sectionsVisited = [];
    this.gameState.hasHammer = false;
    this.gameState.bowserDefeated = false;
  }

  public restartLevel() {
    // Reload entities from stored original state
    this.entities = JSON.parse(JSON.stringify(this.originalEntities));
    this.entities.push(this.player);
    this.particles = [];
    
    // Reset all state
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.x = 100;
    this.player.y = 0;
    this.gameState.camera.x = 0;
    this.gameState.phase = 'intro';
    this.gameState.introTimer = 0;
    this.gameState.score = 0;
    this.gameState.coins = 0;
    this.gameState.achievements = 0;
    this.gameState.sectionsVisited = [];
    this.gameState.hasHammer = false;
    this.gameState.bowserDefeated = false;
    this.gameState.message = null;
    this.gameState.messageTimer = 0;
    this.gameState.flagsCollected = 0;
    this.gameState.skillsUnlocked = [];
    this.gameState.metricsCollected = [];
    this.gameState.challengesOvercome = [];
    this.gameState.messageQueue = [];
    this.gameState.currentZone = '';
    this.gameState.zoneOverlayTimer = 0;
    this.gameState.zoneOverlayText = '';
  }

  public resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    // Canvas is resized externally, we just need to ensure context is valid
    this.ctx.imageSmoothingEnabled = false; // Pixel art look
  }

  public startGame() {
    if (this.gameState.phase === 'intro') {
      this.gameState.phase = 'playing';
      this.soundCallback('coin');
    }
  }

  public handleInput(keys: { left: boolean; right: boolean; jump: boolean; down: boolean }) {
    if (this.gameState.phase !== 'playing') return;

    // Movement
    if (keys.left) {
      this.player.vx -= 50;
      this.player.facingRight = false;
    }
    if (keys.right) {
      this.player.vx += 50;
      this.player.facingRight = true;
    }
    
    // Cap Speed
    this.player.vx = Math.max(-this.MOVE_SPEED, Math.min(this.MOVE_SPEED, this.player.vx));

    // Jump
    if (keys.jump && this.player.vy === 0) { // Simple ground check
       // Check if actually on ground (simple tolerance check)
       // For better physics, we'd use a grounded flag set during collision
       this.player.vy = this.JUMP_FORCE;
       this.soundCallback('jump');
    }
  }

  public update(dt: number) {
    // Update animation timer
    this.animTimer += dt * 1000;

    // Intro phase: update timer for auto-start
    if (this.gameState.phase === 'intro') {
      this.gameState.introTimer += dt;
      if (this.gameState.introTimer >= 5.0) {
        this.startGame();
      }
      return;
    }

    // Victory phase: spawn fireworks
    if (this.gameState.phase === 'victory') {
       if (Math.random() < 0.1) {
           this.spawnFireworks(
               this.gameState.camera.x + Math.random() * this.width,
               Math.random() * (this.height / 2)
           );
       }
    }

    // Game Over phase: no updates
    if (this.gameState.phase === 'gameOver') {
      return;
    }

    // Physics Loop
    this.entities.forEach(e => {
      if (!e.active) return;
      if (!e.gravity && e.type !== 'player') return;
      if (this.gameState.phase === 'victory' && e.type === 'player') return; // Stop player physics on victory

      // Apply Gravity
      e.vy += this.GRAVITY * dt;
      e.vx *= this.FRICTION; // Ground friction

      // Apply Velocity
      e.x += e.vx * dt;
      this.checkCollisions(e, 'x');
      
      e.y += e.vy * dt;
      this.checkCollisions(e, 'y');

      // Death Plane
      if (e.y > this.canvas.height + 100) {
        if (e.type === 'player') {
          this.gameState.phase = 'gameOver';
          this.soundCallback('die');
          // Respawn logic handled by React component
        } else {
          e.active = false;
        }
      }
    });

    // Particle Life
    for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        
        // Update Life
        if (p.life) p.life -= dt;
        if (p.life !== undefined && p.life <= 0) {
            p.active = false;
            this.particles.splice(i, 1); // Remove dead particles
            continue;
        }

        // Apply Physics (Gravity & Velocity)
        if (p.gravity) {
            p.vy += this.GRAVITY * dt;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
    }

    // Coin Collection (Metric Coins with real achievement data)
    this.entities.forEach(e => {
      if (e.type === 'coin' && e.active) {
        if (this.rectIntersect(this.player, e)) {
          e.active = false;
          this.gameState.achievements++;
          this.gameState.coins++;
          this.gameState.score += 100;
          this.soundCallback('coin');
          
          // Track metric collection
          if (e.metricLabel) {
            this.gameState.metricsCollected.push(e.metricLabel);
          }
          
          // Show FULL content - use the pre-built meaningful message
          const displayText = e.content || `${e.metricValue || ''} ${e.metricLabel || 'Collected!'}`;
          this.spawnFloatingText(e.x, e.y - 10, displayText);
          this.spawnParticles(e.x + e.w/2, e.y + e.h/2, '#FFD700');
        }
      }
    });

    // Flag Collection (Jurisdiction Compliance)
    this.entities.forEach(e => {
      if (e.type === 'flag' && e.active) {
        if (this.rectIntersect(this.player, e)) {
          e.active = false;
          this.gameState.flagsCollected++;
          this.gameState.score += 25;
          this.soundCallback('coin');
          
          // Show country compliance info
          this.spawnFloatingText(e.x, e.y - 10, e.content || e.label || 'Flag!');
          this.spawnParticles(e.x + e.w/2, e.y + e.h/2, '#10B981');
          
          // Check if all flags collected
          if (this.gameState.flagsCollected === this.gameState.totalFlags) {
            this.showMessage('🌍 COMPLIANCE COMPLETE! All jurisdictions covered!');
            this.gameState.achievements++;
            this.gameState.score += 200;
          }
        }
      }
    });

    // Goomba Movement & Collision (Section-specific challenges)
    this.entities.forEach(e => {
      if (e.type === 'goomba' && e.active) {
        // Move goomba
        e.x += e.vx * dt;
        
        // Bounce at boundaries (dynamic based on level length)
        if (e.x < 50 || e.x > 8000) {
          e.vx *= -1;
        }

        // Check player collision
        if (this.rectIntersect(this.player, e)) {
          // Player stomps goomba if falling from above
          if (this.player.vy > 0 && this.player.y + this.player.h < e.y + e.h/2) {
            e.active = false;
            this.player.vy = -400; // Bounce
            this.gameState.score += 100;
            this.soundCallback('bump');
            
            // Track challenge overcome
            if (e.label) {
              this.gameState.challengesOvercome.push(e.label);
            }
            
            // Use custom defeat message if available, otherwise generate from label
            const msg = e.defeatMessage || (e.label ? `${e.label} Defeated!` : 'Challenge Overcome!');
            this.spawnFloatingText(e.x, e.y - 20, msg);
            this.spawnParticles(e.x + e.w/2, e.y + e.h/2, '#8B4513');
          } else {
            // Side collision - player gets shocked/bounced back
            this.soundCallback('die');
            
            // Determine bounce direction based on relative position
            const bounceDirection = this.player.x < e.x ? -1 : 1;
            
            // Apply knockback: horizontal bounce + small vertical pop
            this.player.vx = bounceDirection * 350;
            this.player.vy = -300;
            
            // Visual feedback (no score penalty)
            this.spawnFloatingText(this.player.x, this.player.y - 20, 'OUCH!');
            this.spawnParticles(this.player.x + this.player.w/2, this.player.y + this.player.h/2, '#EF4444');
          }
        }
      }
    });

    // Mushroom Collection (Skills/Strengths)
    this.entities.forEach(e => {
      if (e.type === 'mushroom' && e.active) {
        if (this.rectIntersect(this.player, e)) {
          e.active = false;
          this.gameState.score += 50;
          this.soundCallback('powerup');
          
          // Track skill unlocked
          if (e.label) {
            this.gameState.skillsUnlocked.push(e.label);
          }
          
          // Show skill message
          const msg = e.content || (e.label ? `${e.label} Skill Unlocked!` : 'Strength Gained!');
          this.spawnFloatingText(e.x, e.y - 20, msg);
          this.spawnParticles(e.x + e.w/2, e.y + e.h/2, '#DC2626');
        }
      }
    });

    // Hammer Collection (Governance Tool) - attaches to player
    this.entities.forEach(e => {
      if (e.type === 'hammer' && e.active) {
        if (this.rectIntersect(this.player, e)) {
          e.active = false;
          this.gameState.hasHammer = true;
          this.gameState.score += 200;
          this.soundCallback('powerup');
          this.showMessage('⚡ GOVERNANCE HAMMER ACQUIRED! Walk into Data Chaos to defeat it!');
          this.spawnParticles(e.x + e.w/2, e.y + e.h/2, '#FFD700');
        }
      }
    });

    // Update hammer swing timer
    if (this.gameState.hammerSwingTimer > 0) {
      this.gameState.hammerSwingTimer -= dt * 1000;
    }

    // Bowser Boss Collision (Data Chaos - shakes when hit with hammer)
    this.entities.forEach(e => {
      if (e.type === 'bowser' && e.active) {
        // Update shake timer
        if (e.shakeTimer && e.shakeTimer > 0) {
          e.shakeTimer -= dt * 1000;
          if (e.shakeTimer <= 0) {
            // Shake complete - defeat boss
            e.active = false;
            this.gameState.bowserDefeated = true;
            this.gameState.score += 500;
            this.gameState.achievements++;
            this.soundCallback('powerup');
            const defeatMsg = e.defeatMessage || '🛡️ DATA CHAOS DEFEATED! Data Governance Master!';
            this.showMessage(defeatMsg);
            for (let i = 0; i < 20; i++) {
              this.spawnParticles(e.x + e.w/2, e.y + e.h/2, ['#FFD700', '#10B981', '#3B82F6', '#EF4444'][i % 4]);
            }
          }
        }

        if (this.rectIntersect(this.player, e) && !e.shakeTimer) {
          if (this.gameState.hasHammer) {
            // Start shake animation - boss shakes for 1 second before defeat
            e.shakeTimer = 1000;
            this.gameState.hammerSwingTimer = 500;
            this.soundCallback('bump');
            this.showMessage('💥 STRIKING DATA CHAOS WITH GOVERNANCE HAMMER!');
          } else {
            // No hammer - bounce back!
            this.soundCallback('die');
            const bounceDirection = this.player.x < e.x ? -1 : 1;
            this.player.vx = bounceDirection * 400;
            this.player.vy = -350;
            this.showMessage('❌ You need the Governance Hammer to defeat Data Chaos!');
            this.spawnParticles(this.player.x + this.player.w/2, this.player.y + this.player.h/2, '#EF4444');
          }
        }
      }
    });

    // Message timer countdown + queue dequeue
    if (this.gameState.message && this.gameState.messageTimer > 0) {
      this.gameState.messageTimer -= dt;
      if (this.gameState.messageTimer <= 0) {
        // Current message expired — pop next from queue
        if (this.gameState.messageQueue.length > 0) {
          const next = this.gameState.messageQueue.shift()!;
          this.gameState.message = next;
          this.gameState.messageTimer = next.length > 30 ? 4.0 : 2.5;
        } else {
          this.gameState.message = null;
          this.gameState.messageTimer = 0;
        }
      }
    }

    // Zone overlay timer countdown
    if (this.gameState.zoneOverlayTimer > 0) {
      this.gameState.zoneOverlayTimer -= dt;
    }

    // Zone detection — flash overlay when entering a new zone
    const playerX = this.player.x;
    const markers = this.gameState.zoneMarkers;
    let detectedZone = 'INTRO';
    for (let i = markers.length - 1; i >= 0; i--) {
      if (playerX >= markers[i].x) {
        detectedZone = markers[i].label;
        break;
      }
    }
    if (detectedZone !== this.gameState.currentZone) {
      this.gameState.currentZone = detectedZone;
      if (detectedZone !== 'INTRO') {
        this.gameState.zoneOverlayText = `ENTERING: ${detectedZone}`;
        this.gameState.zoneOverlayTimer = 2.0;
      }
    }

    // Camera Follow
    const targetCamX = this.player.x - this.canvas.width * 0.3;
    this.gameState.camera.x += (targetCamX - this.gameState.camera.x) * 0.1;
    this.gameState.camera.x = Math.max(0, this.gameState.camera.x); // Don't show left of start
  }

  private checkCollisions(e: Entity, axis: 'x' | 'y') {
    for (const other of this.entities) {
      if (e === other || !other.active || !other.solid) continue;

      if (this.rectIntersect(e, other)) {
        if (e.type === 'player' && other.type === 'castle') {
            this.gameState.phase = 'victory';
            this.soundCallback('powerup'); // Victory fanfare (plays once)
            return;
        }

        if (axis === 'x') {
          if (e.vx > 0) e.x = other.x - e.w;
          else if (e.vx < 0) e.x = other.x + other.w;
          e.vx = 0;
        } else {
          if (e.vy > 0) { // Landing
             e.y = other.y - e.h;
             e.vy = 0;
             // Handle Bounce/Break
             if (e.type === 'player' && other.type === 'question') {
                 // Hit from bottom? No, this is landing on top.
             }
          } else if (e.vy < 0) { // Head bump
             e.y = other.y + other.h;
             e.vy = 0;
             this.handleBlockHit(other);
          }
        }
      }
    }
  }

  private handleBlockHit(block: Entity) {
    if (block.type === 'brick' || block.type === 'question') {
        this.soundCallback('bump');
        
        // Spawn particles
        this.spawnParticles(block.x + block.w/2, block.y + block.h/2, block.color);

        if (block.type === 'question') {
            block.type = 'ground'; // Used block state
            block.textureId = 'ground'; // Change texture to used (or just make it dark)
            block.color = '#78350f'; 
            this.soundCallback('coin');
            // Spawn float text
            if (block.content) {
                if (block.content.length > 15) {
                    this.showMessage(block.content);
                } else {
                    this.spawnFloatingText(block.x, block.y, block.content);
                }
            }
        } else if (block.type === 'brick') {
             block.active = false;
             this.soundCallback('break');
             if (block.content) {
                this.spawnFloatingText(block.x, block.y, block.content);
            }
        }
    }
  }

  public showMessage(text: string) {
      if (this.gameState.message) {
        // Queue the message if one is already showing
        this.gameState.messageQueue.push(text);
      } else {
        this.gameState.message = text;
        // Short messages get less time, long messages get more
        this.gameState.messageTimer = text.length > 30 ? 4.0 : 2.5;
      }
  }

  private spawnFireworks(x: number, y: number) {
      const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 * i) / 20;
          const speed = 100 + Math.random() * 200;
          this.particles.push({
              id: `fw_${Date.now()}_${i}`,
              type: 'particle',
              x: x, y: y, w: 6, h: 6,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: color,
              active: true, solid: false, gravity: true, life: 1.5
          });
      }
      // No sound on fireworks - was causing annoying loop
  }

  private spawnParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 4; i++) {
        this.particles.push({
            id: `p_${Date.now()}_${i}`,
            type: 'particle',
            x: x, y: y, w: 8, h: 8,
            vx: (Math.random() - 0.5) * 300,
            vy: -200 - Math.random() * 200,
            color: color,
            active: true, solid: false, gravity: true, life: 1.0
        });
    }
  }

  private spawnFloatingText(x: number, y: number, text: string) {
      // Show text ONLY in HUD message bar - no floating text
      // This is the standard approach in retro games (Super Mario style)
      // The HUD message bar is fixed, readable, and never overlaps
      this.showMessage(text);
  }

  private rectIntersect(r1: Rect, r2: Rect): boolean {
    return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
           r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
  }

  private getHeroTexture(): string {
    if (Math.abs(this.player.vy) > 50) return 'hero_jump';
    if (Math.abs(this.player.vx) > 10) {
      return this.animTimer % 200 < 100 ? 'hero_run_1' : 'hero_run_2';
    }
    return 'hero_idle';
  }

  private renderBillboard(e: Entity, renderX: number, renderY: number) {
    const padding = 12;
    const titleFont = 'bold 10px "Press Start 2P", monospace';
    const contentFont = '8px "Press Start 2P", monospace';
    const lineHeight = 12;
    const titleHeight = 16;
    
    // Calculate actual required dimensions based on text content
    this.ctx.font = titleFont;
    const titleWidth = e.label ? this.ctx.measureText(e.label).width : 0;
    
    this.ctx.font = contentFont;
    const contentLines = e.content ? e.content.split('\n') : [];
    let maxContentWidth = 0;
    for (const line of contentLines) {
      const lineWidth = this.ctx.measureText(line).width;
      if (lineWidth > maxContentWidth) maxContentWidth = lineWidth;
    }
    
    // Calculate adaptive billboard size
    const requiredWidth = Math.max(titleWidth, maxContentWidth) + padding * 2;
    const requiredHeight = padding + (e.label ? titleHeight : 0) + (contentLines.length * lineHeight) + padding;
    
    // Use calculated size (adaptive) - minimum 150px wide
    const billboardW = Math.max(150, Math.min(requiredWidth, 200));
    const billboardH = Math.max(60, requiredHeight);
    
    // Professional dark background - sized to content
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(renderX, renderY, billboardW, billboardH);
    
    // Inner area
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(renderX + 3, renderY + 3, billboardW - 6, billboardH - 6);
    
    // Blue accent border
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(renderX + 1, renderY + 1, billboardW - 2, billboardH - 2);

    // Clip to prevent overflow
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(renderX + padding, renderY + padding, billboardW - padding * 2, billboardH - padding * 2);
    this.ctx.clip();

    let currentY = renderY + padding;

    // Title
    if (e.label) {
      this.ctx.fillStyle = '#60a5fa';
      this.ctx.font = titleFont;
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(e.label, renderX + padding, currentY);
      currentY += titleHeight;
    }

    // Content lines
    if (e.content) {
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.font = contentFont;
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
      
      for (const line of contentLines) {
        this.ctx.fillText(line, renderX + padding, currentY);
        currentY += lineHeight;
      }
    }

    this.ctx.restore();

    // Wooden pole - centered under billboard
    const poleX = renderX + billboardW / 2 - 4;
    const poleY = renderY + billboardH;
    const poleHeight = 500 - (renderY + billboardH);
    
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(poleX, poleY, 8, Math.max(0, poleHeight));
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(poleX + 2, poleY, 3, Math.max(0, poleHeight));
  }

  public render() {
    // Ensure dimensions are synced (Failsafe for 0-width bug)
    if (this.canvas.width > 0 && this.canvas.height > 0) {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    // Intro phase: render intro screen only
    if (this.gameState.phase === 'intro') {
      this.renderIntroScreen();
      return;
    }

    // Clear Background — warm sky gradient
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    skyGrad.addColorStop(0, '#87CEEB');   // light sky blue top
    skyGrad.addColorStop(0.7, '#B0D4F1'); // soft mid
    skyGrad.addColorStop(1, '#FFE4B5');   // warm moccasin near horizon
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const camX = Math.floor(this.gameState.camera.x);

    // Parallax hills silhouette (0.3x camera speed)
    this.ctx.fillStyle = 'rgba(100, 140, 180, 0.25)';
    const hillParallax = camX * 0.3;
    for (let hx = -200; hx < this.canvas.width + 400; hx += 300) {
      const baseX = hx - (hillParallax % 300);
      this.ctx.beginPath();
      this.ctx.moveTo(baseX, this.height);
      this.ctx.quadraticCurveTo(baseX + 150, this.height - 120, baseX + 300, this.height);
      this.ctx.fill();
    }
    // Nearer hills (0.5x camera speed)
    this.ctx.fillStyle = 'rgba(80, 120, 160, 0.2)';
    const nearHillParallax = camX * 0.5;
    for (let hx = -100; hx < this.canvas.width + 400; hx += 250) {
      const baseX = hx - (nearHillParallax % 250);
      this.ctx.beginPath();
      this.ctx.moveTo(baseX, this.height);
      this.ctx.quadraticCurveTo(baseX + 125, this.height - 80, baseX + 250, this.height);
      this.ctx.fill();
    }

    // Render Entities
    for (const e of this.entities) {
      if (!e.active) continue;
      
      // Culling
      if (e.x + e.w < camX || e.x > camX + this.canvas.width) continue;

      const renderX = Math.floor(e.x - camX);
      const renderY = Math.floor(e.y);

      // Billboard Rendering
      if (e.type === 'billboard') {
        this.renderBillboard(e, renderX, renderY);
        continue;
      }

      // Coin Rendering (bob coin sprite only, text stays anchored)
      if (e.type === 'coin') {
        const bobOffset = Math.sin(this.animTimer / 200) * 5;
        const texture = TextureManager.get('coin');
        if (texture) {
          this.ctx.drawImage(texture, renderX, renderY + bobOffset, e.w, e.h);
        }
        // Draw label below coin with dark pill background (text does NOT bob)
        if (e.metricValue && e.metricLabel) {
          const shortLabel = e.metricLabel.split(' ').slice(0, 2).join(' ');
          this.ctx.font = 'bold 8px "Press Start 2P", monospace';
          const valW = this.ctx.measureText(e.metricValue).width;
          this.ctx.font = '8px "Press Start 2P", monospace';
          const lblW = this.ctx.measureText(shortLabel).width;
          const pillW = Math.max(valW, lblW) + 12;
          const pillH = 26;
          const pillX = renderX + e.w / 2 - pillW / 2;
          const pillY = renderY + e.h + 4;
          // Dark pill background
          this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
          this.ctx.beginPath();
          this.ctx.roundRect(pillX, pillY, pillW, pillH, 4);
          this.ctx.fill();
          // Value line
          this.ctx.fillStyle = '#FFF8E1';
          this.ctx.font = 'bold 8px "Press Start 2P", monospace';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(e.metricValue, renderX + e.w / 2, pillY + 10);
          // Label line
          this.ctx.font = '8px "Press Start 2P", monospace';
          this.ctx.fillText(shortLabel, renderX + e.w / 2, pillY + 22);
        } else if (e.label) {
          this.ctx.font = 'bold 10px "Press Start 2P", monospace';
          const lblW = this.ctx.measureText(e.label).width + 10;
          const pillX = renderX + e.w / 2 - lblW / 2;
          const pillY = renderY + e.h + 4;
          this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
          this.ctx.beginPath();
          this.ctx.roundRect(pillX, pillY, lblW, 16, 4);
          this.ctx.fill();
          this.ctx.fillStyle = '#FFF8E1';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(e.label, renderX + e.w / 2, pillY + 12);
        }
        continue;
      }

      // Goomba Rendering with challenge label (dark pill for readability)
      if (e.type === 'goomba') {
        const texture = TextureManager.get('goomba');
        if (texture) {
          this.ctx.drawImage(texture, renderX, renderY, e.w, e.h);
        }
        // Show challenge label above goomba with dark pill
        if (e.label) {
          this.ctx.font = 'bold 8px "Press Start 2P", monospace';
          const gLblW = this.ctx.measureText(e.label).width + 10;
          const gPillX = renderX + e.w / 2 - gLblW / 2;
          const gPillY = renderY - 20;
          this.ctx.fillStyle = 'rgba(180,30,30,0.85)';
          this.ctx.beginPath();
          this.ctx.roundRect(gPillX, gPillY, gLblW, 16, 4);
          this.ctx.fill();
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(e.label, renderX + e.w / 2, gPillY + 12);
        }
        continue;
      }

      // Mushroom Rendering (with slight bob)
      if (e.type === 'mushroom') {
        const bobOffset = Math.sin(this.animTimer / 300) * 3;
        const texture = TextureManager.get('mushroom');
        if (texture) {
          this.ctx.drawImage(texture, renderX, renderY + bobOffset, e.w, e.h);
        }
        continue;
      }

      // Hammer Rendering (with rotation/bob animation)
      if (e.type === 'hammer') {
        const bobOffset = Math.sin(this.animTimer / 200) * 4;
        const texture = TextureManager.get('hammer');
        if (texture) {
          this.ctx.drawImage(texture, renderX, renderY + bobOffset, e.w, e.h);
        }
        // Label below hammer with dark pill (text does NOT bob)
        this.ctx.font = 'bold 8px "Press Start 2P", monospace';
        const hPillW = this.ctx.measureText('GOVERNANCE').width + 12;
        const hPillX = renderX + e.w / 2 - hPillW / 2;
        const hPillY = renderY + e.h + 4;
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.beginPath();
        this.ctx.roundRect(hPillX, hPillY, hPillW, 26, 4);
        this.ctx.fill();
        this.ctx.fillStyle = '#FFF8E1';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GOVERNANCE', renderX + e.w / 2, hPillY + 10);
        this.ctx.fillText('HAMMER', renderX + e.w / 2, hPillY + 22);
        continue;
      }

      // Bowser Boss Rendering - Data Chaos (shakes when being defeated)
      if (e.type === 'bowser') {
        // Apply shake effect if shakeTimer is active
        let shakeX = 0;
        let shakeY = 0;
        if (e.shakeTimer && e.shakeTimer > 0) {
          shakeX = Math.sin(this.animTimer / 20) * 8;
          shakeY = Math.cos(this.animTimer / 15) * 4;
        }
        
        const texture = TextureManager.get('bowser');
        if (texture) {
          this.ctx.drawImage(texture, renderX + shakeX, renderY + shakeY, e.w, e.h);
        }
        // Boss name and description
        this.ctx.fillStyle = e.shakeTimer ? '#FF0000' : '#DC2626';
        this.ctx.font = 'bold 10px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(e.label || 'DATA CHAOS', renderX + e.w/2 + shakeX, renderY - 30 + shakeY);
        // What the boss represents
        this.ctx.fillStyle = '#FEF08A';
        this.ctx.font = '6px "Press Start 2P", monospace';
        this.ctx.fillText('Pipeline Failures', renderX + e.w/2 + shakeX, renderY - 18 + shakeY);
        this.ctx.fillText('Compliance Risks', renderX + e.w/2 + shakeX, renderY - 10 + shakeY);
        continue;
      }

      // Flag Rendering (Jurisdiction compliance flags)
      if (e.type === 'flag') {
        const bobOffset = Math.sin(this.animTimer / 150 + e.x * 0.01) * 3;
        const texture = TextureManager.get('flag');
        if (texture) {
          this.ctx.drawImage(texture, renderX, renderY + bobOffset, e.w, e.h);
        }
        // Draw country emoji above flag
        if (e.label) {
          this.ctx.font = '14px sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(e.label, renderX + e.w/2, renderY - 5 + bobOffset);
        }
        continue;
      }

      // Tech Platform Rendering
      if (e.type === 'techPlatform') {
        const texture = TextureManager.get('techPlatform');
        if (texture) {
          this.ctx.drawImage(texture, renderX, renderY, e.w, e.h);
        }
        // Draw tech name on platform
        if (e.label) {
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.font = 'bold 8px "Press Start 2P", monospace';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(e.label, renderX + e.w/2, renderY + e.h/2 + 3);
        }
        continue;
      }

      // Player Rendering with animation
      if (e.type === 'player') {
        const heroTexture = TextureManager.get(this.getHeroTexture());
        if (heroTexture) {
          this.ctx.save();
          if (!e.facingRight) {
            this.ctx.translate(renderX + e.w, renderY);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(heroTexture, 0, 0, e.w, e.h);
          } else {
            this.ctx.drawImage(heroTexture, renderX, renderY, e.w, e.h);
          }
          this.ctx.restore();
        }
        
        // Draw hammer if player has it
        if (this.gameState.hasHammer) {
          const hammerTexture = TextureManager.get('hammer');
          const isSwinging = this.gameState.hammerSwingTimer > 0;
          const swingProgress = isSwinging ? (500 - this.gameState.hammerSwingTimer) / 500 : 0;
          
          this.ctx.save();
          const hammerX = e.facingRight ? renderX + e.w - 5 : renderX - 20;
          const hammerY = renderY + 5;
          
          // Swing animation - rotate hammer
          if (isSwinging) {
            const pivotX = hammerX + 12;
            const pivotY = hammerY + 20;
            this.ctx.translate(pivotX, pivotY);
            // Swing arc: 0 -> -90 degrees -> back
            const swingAngle = Math.sin(swingProgress * Math.PI) * -1.5;
            this.ctx.rotate(swingAngle);
            this.ctx.translate(-pivotX, -pivotY);
          }
          
          if (hammerTexture) {
            this.ctx.drawImage(hammerTexture, hammerX, hammerY, 24, 24);
          } else {
            // Fallback hammer drawing
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(hammerX + 8, hammerY + 10, 6, 18);
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(hammerX, hammerY, 24, 12);
          }
          this.ctx.restore();
        }
        continue;
      }

      // Texture Rendering (for other entities)
      if (e.textureId) {
          const texture = TextureManager.get(e.textureId);
          if (texture) {
              this.ctx.drawImage(texture, renderX, renderY, e.w, e.h);
          } else {
              this.ctx.fillStyle = e.color;
              this.ctx.fillRect(renderX, renderY, e.w, e.h);
          }
      } else if (e.type === 'text' && e.label) {
          this.ctx.fillStyle = "#FFFFFF";
          this.ctx.font = '16px "Press Start 2P", monospace'; // Retro font
          this.ctx.strokeStyle = "#000000";
          this.ctx.lineWidth = 3;
          this.ctx.strokeText(e.label, renderX, renderY);
          this.ctx.fillText(e.label, renderX, renderY);
      } else {
          this.ctx.fillStyle = e.color;
          this.ctx.fillRect(renderX, renderY, e.w, e.h);
      }

      // Draw Labels on Bricks
      if ((e.type === 'brick' || e.type === 'question') && e.label && !e.textureId) { // If no texture, draw text (fallback)
           // Actually, we might want to overlay text on textures for bricks (like EXP)
      }
      
      // Overlay Label for Bricks if provided (e.g. "EXP", "SKILL")
      if (e.type === 'brick' && e.label) {
          this.ctx.font = 'bold 12px "Press Start 2P", monospace';
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          
          // Drop Shadow (Crisper than outline)
          this.ctx.fillStyle = "#000000";
          this.ctx.fillText(e.label, renderX + e.w/2 + 2, renderY + e.h/2 + 2);
          
          // Main Text
          this.ctx.fillStyle = "#FFFFFF";
          this.ctx.fillText(e.label, renderX + e.w/2, renderY + e.h/2);
      }
    }

    // Draw Particles
    for (const p of this.particles) {
        if (!p.active) continue;
        
        const renderX = Math.floor(p.x - camX);
        const renderY = Math.floor(p.y);

        // Calculate fade alpha based on remaining life (fade out in last 1 second)
        let alpha = 1.0;
        if (p.life !== undefined && p.life < 1.0) {
            alpha = Math.max(0, p.life);
        }

        if (p.type === 'text' && p.label) {
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = '16px "Press Start 2P", monospace';
            this.ctx.strokeStyle = "#000000";
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(p.label, renderX, renderY);
            this.ctx.fillText(p.label, renderX, renderY);
            this.ctx.globalAlpha = 1.0;
        } else {
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(renderX, renderY, p.w, p.h);
            this.ctx.globalAlpha = 1.0;
        }
    }

    this.ctx.restore();

    // HUD (Fixed on screen)
    this.renderHUD();
  }

  renderHUD() {
    this.ctx.save();
    
    // ── Score & Achievements (top-left) ──
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.shadowColor = 'black';
    this.ctx.shadowBlur = 0;
    
    this.ctx.fillText(`SCORE: ${this.gameState.score}`, 20, 35);
    
    const achieveColor = this.gameState.achievements === this.gameState.totalAchievements ? '#10B981' : '#FFD700';
    this.ctx.fillStyle = achieveColor;
    this.ctx.fillText(`★ ${this.gameState.achievements}/${this.gameState.totalAchievements}`, 20, 60);

    // ── Progress Bar (top center, below score line) ──
    const barLeftMargin = 200;
    const barRightMargin = 380; // Extra right margin to avoid overlapping CV/PROFESSIONAL/EXIT buttons
    const barX = barLeftMargin;
    const barW = this.width - barLeftMargin - barRightMargin;
    const barY = 18;
    const barH = 14;
    const progress = Math.min(1, Math.max(0, this.player.x / this.gameState.levelLength));

    // Bar background
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.beginPath();
    this.ctx.roundRect(barX, barY, barW, barH, 7);
    this.ctx.fill();

    // Bar fill — warm gradient
    if (progress > 0.005) {
      const fillW = Math.max(barH, barW * progress); // min width = bar height for rounded look
      const barGrad = this.ctx.createLinearGradient(barX, 0, barX + fillW, 0);
      barGrad.addColorStop(0, '#F59E0B');   // amber
      barGrad.addColorStop(1, '#EF4444');   // red at end
      this.ctx.fillStyle = barGrad;
      this.ctx.beginPath();
      this.ctx.roundRect(barX, barY, fillW, barH, 7);
      this.ctx.fill();
    }

    // Bar border
    this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(barX, barY, barW, barH, 7);
    this.ctx.stroke();

    // Zone markers on bar
    this.ctx.font = '6px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    const markers = this.gameState.zoneMarkers;
    for (const marker of markers) {
      const markerProgress = marker.x / this.gameState.levelLength;
      const mx = barX + barW * markerProgress;
      // Tick mark
      this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
      this.ctx.fillRect(mx - 1, barY - 2, 2, barH + 4);
      // Label below bar
      this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
      this.ctx.fillText(marker.label, mx, barY + barH + 3);
    }

    // Percentage text
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`${Math.round(progress * 100)}%`, barX + barW + 35, barY + barH / 2);

    // ── Zone Overlay (Fix 5 — flash zone name on entry) ──
    if (this.gameState.zoneOverlayTimer > 0 && this.gameState.zoneOverlayText) {
      // Fade in first 0.3s, hold, fade out last 0.5s
      let overlayAlpha = 1;
      const remaining = this.gameState.zoneOverlayTimer;
      const total = 2.0;
      if (remaining > total - 0.3) {
        overlayAlpha = (total - remaining) / 0.3; // fade in
      } else if (remaining < 0.5) {
        overlayAlpha = remaining / 0.5; // fade out
      }
      this.ctx.globalAlpha = overlayAlpha;
      // Dark banner across top-center
      const bannerW = Math.min(500, this.width * 0.6);
      const bannerH = 50;
      const bannerX = (this.width - bannerW) / 2;
      const bannerY = 80;
      this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
      this.ctx.beginPath();
      this.ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 8);
      this.ctx.fill();
      this.ctx.strokeStyle = '#F59E0B';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 8);
      this.ctx.stroke();
      // Text
      this.ctx.fillStyle = '#FFF8E1';
      this.ctx.font = 'bold 16px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(this.gameState.zoneOverlayText, this.width / 2, bannerY + bannerH / 2);
      this.ctx.globalAlpha = 1;
    }

    // ── Message Box (Fix 3 — bottom of screen, RPG dialogue style) ──
    if (this.gameState.message) {
        const boxW = Math.min(this.width * 0.6, 600);
        const boxX = (this.width - boxW) / 2;
        
        // Calculate Wrapped Lines
        this.ctx.font = '12px "Press Start 2P", monospace';
        const words = this.gameState.message.split(' ');
        let line = '';
        const lines: string[] = [];
        const maxChars = Math.floor((boxW - 40) / 12);

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          if (testLine.length > maxChars && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        const lineHeight = 20;
        const padding = 16;
        const boxHeight = Math.max(50, (lines.length * lineHeight) + (padding * 2));
        const boxY = this.height - boxHeight - 80; // Above ground, below gameplay

        // Box background with rounded corners
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.beginPath();
        this.ctx.roundRect(boxX, boxY, boxW, boxHeight, 8);
        this.ctx.fill();
        this.ctx.strokeStyle = '#F59E0B';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(boxX, boxY, boxW, boxHeight, 8);
        this.ctx.stroke();

        // Text
        this.ctx.fillStyle = '#FFF8E1';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        
        lines.forEach((l, i) => {
            const lineY = boxY + padding + (i * lineHeight);
            this.ctx.fillText(l.trim(), this.width / 2, lineY);
        });

        // Dismiss hint
        this.ctx.font = '7px "Press Start 2P", monospace';
        this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
        this.ctx.fillText('▼', this.width / 2, boxY + boxHeight - 10);
    }

    if (this.gameState.phase === 'gameOver') {
      this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '32px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('GAME OVER', this.width/2, this.height/2);
      this.ctx.font = '16px "Press Start 2P", monospace';
      this.ctx.fillText('Press R to Retry', this.width/2, this.height/2 + 50);
    } else if (this.gameState.phase === 'victory') {
      this.renderVictoryScreen();
    }
    
    this.ctx.restore();
  }

  private renderIntroScreen() {
    // Dark blue gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Stars background
    this.ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 137) % this.width;
      const y = (i * 97) % (this.height * 0.6);
      const size = (i % 3) + 1;
      this.ctx.fillRect(x, y, size, size);
    }

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Title box
    const titleBoxW = Math.min(600, this.width - 40);
    const titleBoxH = 60;
    const titleBoxX = centerX - titleBoxW / 2;
    const titleBoxY = centerY - 180;

    this.ctx.fillStyle = '#F8931D';
    this.ctx.fillRect(titleBoxX, titleBoxY, titleBoxW, titleBoxH);
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(titleBoxX, titleBoxY, titleBoxW, titleBoxH);

    // Title text
    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 24px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText("SMEET'S CAREER QUEST", centerX, titleBoxY + titleBoxH / 2);

    // Hero sprite (centered, larger)
    const heroTexture = TextureManager.get('hero_idle');
    if (heroTexture) {
      const heroSize = 80;
      this.ctx.drawImage(heroTexture, centerX - heroSize / 2, centerY - 80, heroSize, heroSize);
    }

    // Tagline - matches experience-detailed.json
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '11px "Press Start 2P", monospace';
    this.ctx.fillText('Manager, Data Engineering, Analytics & GenAI', centerX, centerY + 20);
    this.ctx.fillText('Berlin, Germany', centerX, centerY + 45);

    // Metrics bar - accurate data from experience-detailed.json
    const metrics = [
      { value: '20', label: 'COUNTRIES' },
      { value: '175', label: 'USERS' },
      { value: '21', label: 'DASHBOARDS' }
    ];
    const metricBoxW = 120;
    const metricStartX = centerX - (metrics.length * metricBoxW) / 2;
    const metricY = centerY + 80;

    metrics.forEach((m, i) => {
      const mx = metricStartX + i * metricBoxW + metricBoxW / 2;
      
      // Metric box
      this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
      this.ctx.fillRect(mx - 50, metricY, 100, 50);
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(mx - 50, metricY, 100, 50);

      // Value
      this.ctx.fillStyle = '#F8931D';
      this.ctx.font = 'bold 16px "Press Start 2P", monospace';
      this.ctx.fillText(m.value, mx, metricY + 20);

      // Label
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '8px "Press Start 2P", monospace';
      this.ctx.fillText(m.label, mx, metricY + 40);
    });

    // Press Start (blinking)
    const blink = Math.floor(this.animTimer / 500) % 2 === 0;
    if (blink) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '16px "Press Start 2P", monospace';
      this.ctx.fillText('▶ PRESS START ◀', centerX, centerY + 160);
    }

    // Instructions
    this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillText('[SPACE] or [TAP] to begin', centerX, centerY + 200);

    // Auto-start countdown
    const remaining = Math.max(0, 5 - this.gameState.introTimer);
    if (remaining < 3) {
      this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.fillText(`Starting in ${Math.ceil(remaining)}...`, centerX, centerY + 220);
    }
  }

  private wrapText(text: string, maxWidth: number, font: string): string[] {
    this.ctx.font = font;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (this.ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  private renderVictoryScreen() {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0,0,0,0.92)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    const pad = 30;
    const cardW = Math.min(540, this.width - 60);
    const cardX = centerX - cardW / 2;
    const innerW = cardW - pad * 2;

    // Title — sized to fit screen
    const titleFont = this.width < 700
      ? 'bold 14px "Press Start 2P", monospace'
      : 'bold 18px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#F8931D';
    this.ctx.font = titleFont;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('QUEST COMPLETE', centerX, 28);
    this.ctx.fillStyle = '#FFD700';
    const subFont = this.width < 700
      ? 'bold 10px "Press Start 2P", monospace'
      : 'bold 13px "Press Start 2P", monospace';
    this.ctx.font = subFont;
    this.ctx.fillText('DATA ANALYTICS EXPERT!', centerX, 52);

    // Summary Card
    const cardY = 68;
    const contentFont = '7px "Press Start 2P", monospace';
    const headingFont = 'bold 8px "Press Start 2P", monospace';

    // Pre-calculate wrapped lines for dynamic card height
    const metricsText = this.gameState.metricsCollected.slice(0, 6).join(' \u2022 ') || 'None collected';
    const metricsLines = this.wrapText(metricsText, innerW, contentFont);
    const challengesText = this.gameState.challengesOvercome.slice(0, 5).join(' \u2022 ') || 'None defeated';
    const challengeLines = this.wrapText(challengesText, innerW, contentFont);
    const skillsText = 'Data Engineering \u2022 Analytics \u2022 AI Governance \u2022 Leadership';
    const skillsLines = this.wrapText(skillsText, innerW, contentFont);

    // Button dimensions (needed for total card height)
    const buttonGap = 16;
    const buttonH = 36;
    const buttonsPerRow = 2;
    const buttonW = Math.floor((cardW - pad * 2 - buttonGap) / buttonsPerRow);
    const buttonRows = 2;

    let calcY = 0;
    calcY += 28; // score row + divider
    calcY += 14; // divider gap
    calcY += 16 + metricsLines.length * 14 + 6;   // metrics heading + lines
    calcY += 16 + challengeLines.length * 14 + 6;  // challenges heading + lines
    calcY += 16 + skillsLines.length * 14 + 6;     // skills heading + lines
    calcY += 16; // compliance
    calcY += 16; // boss status
    calcY += 20; // gap before buttons
    calcY += buttonRows * buttonH + (buttonRows - 1) * buttonGap; // buttons
    calcY += 30; // instructions + bottom padding
    const cardH = calcY + pad;

    this.ctx.fillStyle = 'rgba(26, 26, 46, 0.95)';
    this.ctx.fillRect(cardX, cardY, cardW, cardH);
    this.ctx.strokeStyle = '#F8931D';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(cardX, cardY, cardW, cardH);

    let lineY = cardY + 20;

    // Score & Achievements
    this.ctx.font = 'bold 10px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`SCORE: ${this.gameState.score}`, cardX + pad, lineY);
    this.ctx.textAlign = 'right';
    const achievePerfect = this.gameState.achievements >= this.gameState.totalAchievements - 5;
    this.ctx.fillStyle = achievePerfect ? '#10B981' : '#ffffff';
    this.ctx.fillText(`ACHIEVEMENTS: ${this.gameState.achievements}`, cardX + cardW - pad, lineY);
    lineY += 22;

    // Divider
    this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(cardX + pad, lineY);
    this.ctx.lineTo(cardX + cardW - pad, lineY);
    this.ctx.stroke();
    lineY += 14;

    // --- Metrics Collected ---
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#F8931D';
    this.ctx.font = headingFont;
    this.ctx.fillText('KEY METRICS COLLECTED:', cardX + pad, lineY);
    lineY += 16;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = contentFont;
    for (const ml of metricsLines) {
      this.ctx.fillText(ml, cardX + pad, lineY);
      lineY += 14;
    }
    lineY += 6;

    // --- Challenges Overcome ---
    this.ctx.fillStyle = '#10B981';
    this.ctx.font = headingFont;
    this.ctx.fillText('CHALLENGES OVERCOME:', cardX + pad, lineY);
    lineY += 16;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = contentFont;
    for (const cl of challengeLines) {
      this.ctx.fillText(cl, cardX + pad, lineY);
      lineY += 14;
    }
    lineY += 6;

    // --- Skills Demonstrated ---
    this.ctx.fillStyle = '#DC2626';
    this.ctx.font = headingFont;
    this.ctx.fillText('SKILLS DEMONSTRATED:', cardX + pad, lineY);
    lineY += 16;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = contentFont;
    for (const sl of skillsLines) {
      this.ctx.fillText(sl, cardX + pad, lineY);
      lineY += 14;
    }
    lineY += 6;

    // --- Compliance ---
    this.ctx.fillStyle = '#3B82F6';
    this.ctx.font = headingFont;
    this.ctx.fillText(`COMPLIANCE: ${this.gameState.flagsCollected}/${this.gameState.totalFlags} Jurisdictions`, cardX + pad, lineY);
    lineY += 16;

    // --- Boss Status ---
    this.ctx.fillStyle = this.gameState.bowserDefeated ? '#10B981' : '#EF4444';
    this.ctx.font = headingFont;
    const bossStatus = this.gameState.bowserDefeated ? 'DATA CHAOS DEFEATED!' : 'Boss Not Defeated';
    this.ctx.fillText(bossStatus, cardX + pad, lineY);
    lineY += 20;

    // ========== CTA BUTTONS ==========
    this.ctx.textAlign = 'center';

    const buttons = [
      { key: '1', label: 'CONTACT ME', action: 'contact' },
      { key: '2', label: 'VIEW RESUME', action: 'resume' },
      { key: '3', label: 'LINKEDIN', action: 'linkedin' },
      { key: '4', label: 'PLAY AGAIN', action: 'restart' }
    ];

    const btnStartY = lineY + 10;

    this.victoryButtons = [];

    buttons.forEach((btn, i) => {
      const row = Math.floor(i / buttonsPerRow);
      const col = i % buttonsPerRow;
      const bx = cardX + pad + col * (buttonW + buttonGap);
      const by = btnStartY + row * (buttonH + buttonGap);

      this.victoryButtons.push({ x: bx, y: by, w: buttonW, h: buttonH, action: btn.action });

      // Button background
      this.ctx.fillStyle = 'rgba(255,255,255,0.08)';
      this.ctx.fillRect(bx, by, buttonW, buttonH);
      this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(bx, by, buttonW, buttonH);

      // Button label
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '8px "Press Start 2P", monospace';
      this.ctx.fillText(btn.label, bx + buttonW / 2, by + buttonH / 2 + 1);

      // Key hint (top-left corner)
      this.ctx.fillStyle = 'rgba(248,147,29,0.8)';
      this.ctx.font = '7px "Press Start 2P", monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`[${btn.key}]`, bx + 6, by + 12);
      this.ctx.textAlign = 'center';
    });

    // Instructions
    const instrY = btnStartY + buttonRows * (buttonH + buttonGap) + 4;
    this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
    this.ctx.font = '7px "Press Start 2P", monospace';
    this.ctx.fillText('Press 1-4 or Click to Select', centerX, instrY);
  }

  public handleVictoryClick(x: number, y: number) {
    if (this.gameState.phase !== 'victory' || !this.victoryButtons) return;
    
    for (const btn of this.victoryButtons) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        this.handleVictoryAction(btn.action);
        return;
      }
    }
  }

  public handleVictoryAction(action: string) {
    switch (action) {
      case 'contact':
      case '1':
        window.open('mailto:smeet3103@gmail.com', '_blank');
        break;
      case 'resume':
      case '2':
        window.open('/resume/Smeet_Kumar_Patel_Resume.pdf', '_blank');
        break;
      case 'linkedin':
      case '3':
        window.open('https://linkedin.com/in/smeetkumarpatel', '_blank');
        break;
      case 'restart':
      case '4':
        this.restartLevel();
        break;
    }
  }
}
