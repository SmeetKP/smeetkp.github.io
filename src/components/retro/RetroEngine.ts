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
      totalAchievements: 4,
      sectionsVisited: [],
      camera: { x: 0 },
      message: null,
      messageTimer: 0,
      introTimer: 0
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

    // Coin Collection
    this.entities.forEach(e => {
      if (e.type === 'coin' && e.active) {
        if (this.rectIntersect(this.player, e)) {
          e.active = false;
          this.gameState.achievements++;
          this.gameState.coins++;
          this.gameState.score += 100;
          this.soundCallback('coin');
          this.spawnFloatingText(e.x, e.y, e.content || '+100');
          this.spawnParticles(e.x + e.w/2, e.y + e.h/2, '#FFD700');
        }
      }
    });

    // Goomba Movement & Collision
    this.entities.forEach(e => {
      if (e.type === 'goomba' && e.active) {
        // Move goomba
        e.x += e.vx * dt;
        
        // Bounce at boundaries
        if (e.x < 50 || e.x > 3400) {
          e.vx *= -1;
        }

        // Check player collision
        if (this.rectIntersect(this.player, e)) {
          // Player stomps goomba if falling
          if (this.player.vy > 0 && this.player.y + this.player.h < e.y + e.h/2) {
            e.active = false;
            this.player.vy = -400; // Bounce
            this.gameState.score += 100;
            this.soundCallback('bump');
            // Show meaningful message based on challenge label
            const challengeMessages: Record<string, string> = {
              'LEGACY': 'Legacy Systems Conquered!',
              'SILOS': 'Data Silos Broken!',
              'SLOW': 'Processes Optimized!'
            };
            const msg = e.label ? (challengeMessages[e.label] || `${e.label} Defeated!`) : 'Challenge Overcome!';
            this.spawnFloatingText(e.x, e.y - 20, msg);
            this.spawnParticles(e.x + e.w/2, e.y + e.h/2, '#8B4513');
          }
        }
      }
    });

    // Mushroom Collection (Strengths)
    this.entities.forEach(e => {
      if (e.type === 'mushroom' && e.active) {
        if (this.rectIntersect(this.player, e)) {
          e.active = false;
          this.gameState.score += 50;
          this.soundCallback('powerup');
          // Show meaningful strength message
          const strengthMessages: Record<string, string> = {
            'AI': 'AI/ML Expertise Acquired!',
            'LEAD': 'Leadership Skills Unlocked!'
          };
          const msg = e.label ? (strengthMessages[e.label] || `${e.label} Power!`) : 'Strength Gained!';
          this.spawnFloatingText(e.x, e.y - 20, msg);
          this.spawnParticles(e.x + e.w/2, e.y + e.h/2, '#DC2626');
        }
      }
    });

    // Section Progress Tracking
    const sectionThresholds: Record<string, number> = {
      'about': 200,
      'experience': 700,
      'skills': 1900,
      'contact': 2450
    };
    
    Object.entries(sectionThresholds).forEach(([section, threshold]) => {
      if (this.player.x >= threshold && !this.gameState.sectionsVisited.includes(section)) {
        this.gameState.sectionsVisited.push(section);
      }
    });

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
      this.gameState.message = text;
      this.gameState.messageTimer = 5.0; // Show for 5 seconds
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
      // Safety: If text is too long, divert to HUD to prevent overlap
      if (text.length > 15) {
          this.showMessage(text);
          return;
      }

      this.particles.push({
          id: `t_${Date.now()}`,
          type: 'text',
          x: x, y: y - 20, w: 0, h: 0,
          vx: 0, vy: -50,
          color: '#FFF',
          label: text,
          active: true, solid: false, gravity: false, life: 2.0
      });
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
    const padding = 10;
    const titleFontSize = 10;
    const contentFontSize = 7;
    const lineHeight = 12;
    
    // Calculate max chars based on width (Press Start 2P: ~0.6 * fontSize per char)
    const maxCharsContent = Math.floor((e.w - padding * 2) / (contentFontSize * 0.7));

    // Billboard background with gradient effect
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(renderX, renderY, e.w, e.h);
    
    // Inner darker area
    this.ctx.fillStyle = '#0f0f1a';
    this.ctx.fillRect(renderX + 3, renderY + 3, e.w - 6, e.h - 6);
    
    // Border
    this.ctx.strokeStyle = '#F8931D';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(renderX, renderY, e.w, e.h);

    // Title (label)
    if (e.label) {
      this.ctx.fillStyle = '#F8931D';
      this.ctx.font = `bold ${titleFontSize}px "Press Start 2P", monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      // Truncate title to fit
      const maxTitleChars = Math.floor((e.w - padding * 2) / (titleFontSize * 0.7));
      const title = e.label.length > maxTitleChars ? e.label.slice(0, maxTitleChars - 2) + '..' : e.label;
      this.ctx.fillText(title, renderX + e.w / 2, renderY + padding);
    }

    // Content lines - properly wrapped
    if (e.content) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = `${contentFontSize}px "Press Start 2P", monospace`;
      this.ctx.textAlign = 'left';
      
      const lines = e.content.split('\n');
      let lineIndex = 0;
      
      for (const line of lines) {
        // Truncate each line to fit
        const truncatedLine = line.length > maxCharsContent 
          ? line.slice(0, maxCharsContent - 2) + '..' 
          : line;
        
        const lineY = renderY + padding + 20 + (lineIndex * lineHeight);
        if (lineY < renderY + e.h - padding) {
          this.ctx.fillText(truncatedLine, renderX + padding, lineY);
          lineIndex++;
        }
      }
    }

    // Wooden pole connecting to ground
    const poleX = renderX + e.w / 2 - 4;
    const poleY = renderY + e.h;
    const poleHeight = 500 - (renderY + e.h);
    
    // Pole with wood grain effect
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(poleX, poleY, 8, Math.max(0, poleHeight));
    this.ctx.fillStyle = '#A0522D';
    this.ctx.fillRect(poleX + 2, poleY, 2, Math.max(0, poleHeight));
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

    // Clear Background (Sky Blue)
    this.ctx.fillStyle = "#5c94fc"; // NES Mario Sky Blue
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const camX = Math.floor(this.gameState.camera.x);

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

      // Coin Rendering (with bob animation)
      if (e.type === 'coin') {
        const bobOffset = Math.sin(this.animTimer / 200) * 5;
        const texture = TextureManager.get('coin');
        if (texture) {
          this.ctx.drawImage(texture, renderX, renderY + bobOffset, e.w, e.h);
        }
        // Draw label below coin
        if (e.label) {
          this.ctx.fillStyle = '#FFD700';
          this.ctx.font = 'bold 10px "Press Start 2P", monospace';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(e.label, renderX + e.w/2, renderY + e.h + 15 + bobOffset);
        }
        continue;
      }

      // Goomba Rendering
      if (e.type === 'goomba') {
        const texture = TextureManager.get('goomba');
        if (texture) {
          this.ctx.drawImage(texture, renderX, renderY, e.w, e.h);
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

        if (p.type === 'text' && p.label) {
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = '16px "Press Start 2P", monospace'; // Retro font
            this.ctx.strokeStyle = "#000000";
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(p.label, renderX, renderY);
            this.ctx.fillText(p.label, renderX, renderY);
        } else {
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(renderX, renderY, p.w, p.h);
        }
    }

    this.ctx.restore();

    // HUD (Fixed on screen)
    this.renderHUD();
  }

  renderHUD() {
    this.ctx.save();
    
    // Score & Achievements
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.shadowColor = 'black';
    this.ctx.shadowBlur = 0;
    
    this.ctx.fillText(`SCORE: ${this.gameState.score}`, 20, 35);
    
    // Achievements counter
    const achieveColor = this.gameState.achievements === this.gameState.totalAchievements ? '#10B981' : '#FFD700';
    this.ctx.fillStyle = achieveColor;
    this.ctx.fillText(`★ ${this.gameState.achievements}/${this.gameState.totalAchievements}`, 20, 60);

    // Progress Tracker (right side)
    const sections = ['about', 'experience', 'skills', 'contact'];
    const dotSize = 12;
    const dotGap = 8;
    const trackerWidth = sections.length * (dotSize + dotGap);
    const trackerX = this.width - trackerWidth - 20;
    const trackerY = 35;

    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('JOURNEY', trackerX - 10, trackerY + 4);

    sections.forEach((section, i) => {
      const dx = trackerX + i * (dotSize + dotGap);
      const visited = this.gameState.sectionsVisited.includes(section);
      
      // Dot background
      this.ctx.fillStyle = visited ? '#10B981' : 'rgba(255,255,255,0.3)';
      this.ctx.beginPath();
      this.ctx.arc(dx + dotSize/2, trackerY, dotSize/2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Dot border
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });
    
    // Message Box (if active)
    if (this.gameState.message) {
        const boxX = 20;
        const boxW = this.width - 40;
        const boxY = 100; // Fixed top position (Below Score/Coins)
        
        // Calculate Wrapped Lines First
        this.ctx.font = '14px "Press Start 2P", monospace';
        const words = this.gameState.message.split(' ');
        let line = '';
        let lines: string[] = [];
        
        // Approximate char width for 14px font ~ 14px (monospace)
        const maxChars = Math.floor((boxW - 40) / 14);

        for(let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          if (testLine.length > maxChars && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        // Calculate Dynamic Height
        const lineHeight = 24;
        const padding = 20;
        const boxHeight = Math.max(80, (lines.length * lineHeight) + (padding * 2));

        // Render Box Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'; // Darker for better readability
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 4;
        this.ctx.fillRect(boxX, boxY, boxW, boxHeight);
        this.ctx.strokeRect(boxX, boxY, boxW, boxHeight);

        // Render Text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top'; // Draw from top
        
        lines.forEach((l, i) => {
            const lineY = boxY + padding + (i * lineHeight);
            this.ctx.fillText(l.trim(), this.width / 2, lineY);
        });
    }

    if (this.gameState.phase === 'gameOver') {
      this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '32px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
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

    // Tagline
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText('Data Analytics Manager & AI Architect', centerX, centerY + 20);
    this.ctx.fillText('Berlin, Germany', centerX, centerY + 45);

    // Metrics bar
    const metrics = [
      { value: '14+', label: 'YEARS' },
      { value: '11', label: 'COUNTRIES' },
      { value: '70%', label: 'FASTER' }
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

  private renderVictoryScreen() {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0,0,0,0.85)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Title
    this.ctx.fillStyle = '#F8931D';
    this.ctx.font = 'bold 28px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('★ QUEST COMPLETE! ★', centerX, centerY - 120);

    // Trophy (simple pixel art)
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillRect(centerX - 20, centerY - 80, 40, 30);
    this.ctx.fillRect(centerX - 30, centerY - 80, 60, 10);
    this.ctx.fillRect(centerX - 10, centerY - 50, 20, 20);
    this.ctx.fillRect(centerX - 15, centerY - 30, 30, 10);

    // Subtitle
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText("You discovered Smeet's career journey!", centerX, centerY + 10);

    // Achievements
    const achieveText = this.gameState.achievements === this.gameState.totalAchievements 
      ? `ACHIEVEMENTS: ${this.gameState.achievements}/${this.gameState.totalAchievements} ★ PERFECT!`
      : `ACHIEVEMENTS: ${this.gameState.achievements}/${this.gameState.totalAchievements}`;
    this.ctx.fillStyle = this.gameState.achievements === this.gameState.totalAchievements ? '#10B981' : '#ffffff';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillText(achieveText, centerX, centerY + 40);

    // CTA Buttons
    const buttons = [
      { key: '1', label: '📧 CONTACT ME', action: 'contact' },
      { key: '2', label: '📄 VIEW RESUME', action: 'resume' },
      { key: '3', label: '💼 LINKEDIN', action: 'linkedin' },
      { key: '4', label: '🔄 PLAY AGAIN', action: 'restart' }
    ];

    const buttonW = 180;
    const buttonH = 35;
    const buttonGap = 15;
    const buttonsPerRow = 2;
    const startY = centerY + 70;

    // Store button positions for click detection
    this.victoryButtons = [];

    buttons.forEach((btn, i) => {
      const row = Math.floor(i / buttonsPerRow);
      const col = i % buttonsPerRow;
      const bx = centerX + (col - 0.5) * (buttonW + buttonGap) - buttonW / 2;
      const by = startY + row * (buttonH + buttonGap);

      // Store for click detection
      this.victoryButtons.push({ x: bx, y: by, w: buttonW, h: buttonH, action: btn.action });

      // Button background
      this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
      this.ctx.fillRect(bx, by, buttonW, buttonH);
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(bx, by, buttonW, buttonH);

      // Button text
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.fillText(btn.label, bx + buttonW / 2, by + buttonH / 2);

      // Key hint
      this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
      this.ctx.font = '8px "Press Start 2P", monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`[${btn.key}]`, bx + 5, by + buttonH / 2);
      this.ctx.textAlign = 'center';
    });

    // Instructions
    this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText('Press 1-4 or Click to Select', centerX, startY + 2 * (buttonH + buttonGap) + 20);
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
        this.gameState.phase = 'intro';
        this.gameState.introTimer = 0;
        this.gameState.score = 0;
        this.gameState.achievements = 0;
        this.gameState.sectionsVisited = [];
        break;
    }
  }
}
