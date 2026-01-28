/**
 * FPS Monitor Utility
 * Tracks frame rate performance for debugging and optimization
 */

export class FPSMonitor {
  private frames: number[] = [];
  private lastTime: number = performance.now();
  private isRunning: boolean = false;

  start() {
    this.isRunning = true;
    this.frames = [];
    this.lastTime = performance.now();
  }

  tick() {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    // Store FPS (1000ms / delta)
    if (delta > 0) {
      const fps = 1000 / delta;
      this.frames.push(fps);

      // Keep only last 60 frames (1 second at 60fps)
      if (this.frames.length > 60) {
        this.frames.shift();
      }
    }
  }

  getAverageFPS(): number {
    if (this.frames.length === 0) return 0;
    const sum = this.frames.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.frames.length);
  }

  getMinFPS(): number {
    if (this.frames.length === 0) return 0;
    return Math.round(Math.min(...this.frames));
  }

  getMaxFPS(): number {
    if (this.frames.length === 0) return 0;
    return Math.round(Math.max(...this.frames));
  }

  getStats() {
    return {
      average: this.getAverageFPS(),
      min: this.getMinFPS(),
      max: this.getMaxFPS(),
      samples: this.frames.length,
      isSmooth: this.getMinFPS() >= 55, // Consider smooth if min FPS is 55+
    };
  }

  stop() {
    this.isRunning = false;
  }

  reset() {
    this.frames = [];
    this.lastTime = performance.now();
  }
}

// Development-only FPS display
export function createFPSDisplay(): HTMLDivElement | null {
  if (process.env.NODE_ENV !== 'development') return null;

  const display = document.createElement('div');
  display.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: #0f0;
    padding: 8px 12px;
    font-family: monospace;
    font-size: 14px;
    border-radius: 4px;
    z-index: 9999;
    pointer-events: none;
  `;
  document.body.appendChild(display);
  return display;
}
