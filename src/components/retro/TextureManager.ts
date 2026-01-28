export class TextureManager {
  private static textures: Map<string, HTMLCanvasElement | OffscreenCanvas> = new Map();

  static get(id: string): HTMLCanvasElement | OffscreenCanvas | undefined {
    return this.textures.get(id);
  }

  static init() {
    if (this.textures.size > 0) return; // Already initialized

    this.generateGroundTexture();
    this.generateBrickTexture();
    this.generateQuestionBlockTexture();
    this.generatePipeTexture();
    this.generateCloudTexture();
    this.generateBushTexture();
    this.generateCastleTexture();
    this.generateHeroTextures();
    this.generateCoinTexture();
    this.generateEnemyTexture();
    this.generateGoombaTexture();
    this.generateMushroomTexture();
  }

  private static createCanvas(width: number, height: number) {
    if (typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(width, height);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  private static generateGroundTexture() {
    // 50x50 Standard Dirt/Ground Block
    const size = 50;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    
    // Base brown
    ctx.fillStyle = '#8B4513'; // SaddleBrown
    ctx.fillRect(0, 0, size, size);
    
    // Grass Top
    ctx.fillStyle = '#228B22'; // ForestGreen
    ctx.fillRect(0, 0, size, 10);
    ctx.fillStyle = '#32CD32'; // LimeGreen highlight
    ctx.fillRect(0, 0, size, 3);

    // Dirt Texture (Random Noise/Specs)
    ctx.fillStyle = '#5D4037'; // Darker dirt
    for(let i=0; i<10; i++) {
        const x = Math.random() * size;
        const y = 10 + Math.random() * (size - 10);
        const w = 4 + Math.random() * 4;
        const h = 2 + Math.random() * 2;
        ctx.fillRect(x, y, w, h);
    }

    // Border for definition
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);

    this.textures.set('ground', canvas);
  }

  private static generateBrickTexture() {
    const size = 50;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    // Base brick red
    ctx.fillStyle = '#B22222'; // FireBrick
    ctx.fillRect(0, 0, size, size);

    // Mortar lines (Light Grey)
    ctx.fillStyle = '#D3D3D3'; 
    ctx.fillRect(0, 0, size, 2); // Top
    ctx.fillRect(0, 24, size, 2); // Middle
    ctx.fillRect(24, 0, 2, 24);   // Top Vertical
    ctx.fillRect(12, 24, 2, 26);  // Bottom Vertical 1
    ctx.fillRect(38, 24, 2, 26);  // Bottom Vertical 2

    // Shadow/Depth
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 2, size, 2);
    ctx.fillRect(0, 26, size, 2);

    this.textures.set('brick', canvas);
  }

  private static generateQuestionBlockTexture() {
    // We'll generate a spritesheet-like texture or just a single frame for now. 
    // Let's make it a single frame that looks good.
    const size = 50;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    // Gold background
    ctx.fillStyle = '#F8931D'; // Orange-gold
    ctx.fillRect(0, 0, size, size);

    // Corner rivets
    ctx.fillStyle = '#B83612'; // Dark rust
    ctx.fillRect(2, 2, 4, 4);
    ctx.fillRect(size-6, 2, 4, 4);
    ctx.fillRect(2, size-6, 4, 4);
    ctx.fillRect(size-6, size-6, 4, 4);

    // Question Mark
    ctx.fillStyle = '#FFE4B5'; // Light cream shadow
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', size/2 + 2, size/2 + 2);

    ctx.fillStyle = '#FFFFFF'; // White text
    ctx.fillText('?', size/2, size/2);

    this.textures.set('question', canvas);
  }

  private static generatePipeTexture() {
    const w = 80;
    const h = 100; // Variable height support would need slicing, but we'll make a standard top
    const canvas = this.createCanvas(w, h);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    // Main green gradient
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#004400');
    grad.addColorStop(0.2, '#008800');
    grad.addColorStop(0.5, '#00AA00');
    grad.addColorStop(0.8, '#008800');
    grad.addColorStop(1, '#004400');

    ctx.fillStyle = grad;
    ctx.fillRect(5, 0, w-10, h); // Pipe body inset

    // Pipe Top (Head)
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, 30);
    
    // Black outlines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, 30);
    ctx.strokeRect(5, 30, w-10, h-30);

    this.textures.set('pipe', canvas);
  }

  private static generateCloudTexture() {
    const w = 150;
    const h = 80;
    const canvas = this.createCanvas(w, h);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    // Simple pixel clouds
    ctx.fillStyle = '#FFFFFF';
    
    // Draw circles for cloud puffs
    const drawPuff = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    drawPuff(40, 40, 30);
    drawPuff(80, 30, 35);
    drawPuff(110, 45, 25);
    
    // Flat bottom
    ctx.fillRect(20, 50, 110, 20);

    // Shadow details (light blue/grey)
    ctx.fillStyle = '#E0F0FF';
    ctx.beginPath();
    ctx.arc(80, 30, 25, 0, Math.PI * 2); // Inner shadow
    ctx.fill();

    this.textures.set('cloud', canvas);
  }

  private static generateBushTexture() {
    const w = 100;
    const h = 50;
    const canvas = this.createCanvas(w, h);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    ctx.fillStyle = '#22C55E'; // Bright Green
    
    // Bush humps
    const drawHump = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      // Outline
      ctx.strokeStyle = '#14532D'; // Dark Green
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    // Draw background humps first
    drawHump(30, 25, 20);
    drawHump(70, 25, 20);
    drawHump(50, 15, 20);

    // Fill bottom to be flat
    ctx.fillRect(10, 25, 80, 25);
    // Hide bottom strokes
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(12, 25, 76, 23);

    this.textures.set('bush', canvas);
  }

  private static generateCastleTexture() {
      // 150x150 Castle
      const size = 150;
      const canvas = this.createCanvas(size, size);
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

      // Base Brick Color
      ctx.fillStyle = '#E2E8F0'; // Light grey stone
      ctx.fillRect(30, 60, 90, 90); // Main block

      // Door
      ctx.fillStyle = '#0F172A'; // Dark door
      ctx.beginPath();
      ctx.arc(75, 150, 25, Math.PI, 0); // Door arch
      ctx.fill();
      ctx.fillRect(50, 110, 50, 40); // Door body

      // Towers
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(20, 60, 30, 90); // Left Tower base
      ctx.fillRect(100, 60, 30, 90); // Right Tower base

      // Battlements
      ctx.fillStyle = '#94A3B8'; // Darker grey tops
      ctx.fillRect(15, 40, 40, 20); // Left top
      ctx.fillRect(95, 40, 40, 20); // Right top
      ctx.fillRect(45, 20, 60, 40); // Center keep

      // Flag (Red)
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(75, 5);
      ctx.lineTo(100, 15);
      ctx.lineTo(75, 25);
      ctx.fill();
      
      // Pole
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(75, 5);
      ctx.lineTo(75, 40);
      ctx.stroke();

      this.textures.set('castle', canvas);
  }

  private static generateHeroTextures() {
    const size = 40;
    
    // Helper to draw base hero with leg offsets
    const drawHero = (legOffset: number, isJump: boolean) => {
        const canvas = this.createCanvas(size, size);
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

        // Head
        ctx.fillStyle = '#FECACA'; // Skin
        ctx.fillRect(10, 5, 20, 15);

        // Hat
        ctx.fillStyle = '#EF4444'; // Red
        ctx.fillRect(8, 5, 24, 6);
        ctx.fillRect(8, 5, 14, 8); // Brim

        // Body
        ctx.fillStyle = '#EF4444'; // Red Shirt
        ctx.fillRect(10, 20, 20, 12);

        // Overalls (Blue)
        ctx.fillStyle = '#2563EB'; 
        ctx.fillRect(12, 25, 16, 10);
        ctx.fillRect(12, 20, 4, 5); // Strap L
        ctx.fillRect(24, 20, 4, 5); // Strap R

        // Face
        ctx.fillStyle = '#000';
        ctx.fillRect(22, 14, 8, 3); // Moustache
        ctx.fillRect(24, 10, 3, 3); // Eye

        // Legs
        ctx.fillStyle = '#2563EB'; // Blue Pants
        if (isJump) {
            // Jump pose: legs tucked/spread
            ctx.fillRect(8, 32, 10, 8);
            ctx.fillRect(22, 30, 10, 6);
        } else {
            // Walk/Idle
            ctx.fillRect(10 - legOffset, 35, 8, 5); // Leg L
            ctx.fillRect(22 + legOffset, 35, 8, 5); // Leg R
        }
        
        return canvas;
    };

    this.textures.set('hero_idle', drawHero(0, false));
    this.textures.set('hero_run_1', drawHero(4, false));
    this.textures.set('hero_run_2', drawHero(-4, false));
    this.textures.set('hero_jump', drawHero(0, true));
    
    // Fallback for legacy reference
    this.textures.set('hero', this.textures.get('hero_idle')!); 
  }

  private static generateCoinTexture() {
    const size = 32;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    // Gold coin with shine
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 2;

    // Outer gold
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner darker gold
    ctx.fillStyle = '#DAA520';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 3, 0, Math.PI * 2);
    ctx.fill();

    // Shine highlight
    ctx.fillStyle = '#FFEC8B';
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    this.textures.set('coin', canvas);
  }

  private static generateEnemyTexture() {
    const size = 40;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    // Data Bug - a red/orange bug creature
    // Body
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(8, 15, 24, 18);

    // Head
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(10, 8, 20, 12);

    // Eyes (white with black pupils)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(12, 10, 6, 6);
    ctx.fillRect(22, 10, 6, 6);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(14, 12, 3, 3);
    ctx.fillRect(24, 12, 3, 3);

    // Antennae
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, 8);
    ctx.lineTo(10, 2);
    ctx.moveTo(26, 8);
    ctx.lineTo(30, 2);
    ctx.stroke();

    // Feet
    ctx.fillStyle = '#7F1D1D';
    ctx.fillRect(8, 33, 8, 5);
    ctx.fillRect(24, 33, 8, 5);

    this.textures.set('enemy', canvas);
  }

  private static generateGoombaTexture() {
    const size = 40;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    // Classic Goomba - brown mushroom enemy
    // Head (brown dome)
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(size/2, 14, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Face area (tan)
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(8, 16, 24, 12);

    // Angry eyebrows
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 16, 8, 3);
    ctx.fillRect(22, 16, 8, 3);

    // Eyes (white with black pupils)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(12, 19, 6, 6);
    ctx.fillRect(22, 19, 6, 6);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(14, 21, 3, 3);
    ctx.fillRect(24, 21, 3, 3);

    // Feet (dark brown)
    ctx.fillStyle = '#5D3A1A';
    ctx.fillRect(6, 28, 12, 10);
    ctx.fillRect(22, 28, 12, 10);

    this.textures.set('goomba', canvas);
  }

  private static generateMushroomTexture() {
    const size = 40;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    // Classic Super Mushroom - red cap with white spots
    // Cap (red dome)
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.ellipse(size/2, 14, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // White spots on cap
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(12, 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(28, 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(20, 6, 4, 0, Math.PI * 2);
    ctx.fill();

    // Stem (tan/beige)
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(12, 20, 16, 16);

    // Eyes on stem
    ctx.fillStyle = '#000000';
    ctx.fillRect(14, 24, 4, 4);
    ctx.fillRect(22, 24, 4, 4);

    // Border
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(size/2, 14, 18, 14, 0, 0, Math.PI * 2);
    ctx.stroke();

    this.textures.set('mushroom', canvas);
  }
}
