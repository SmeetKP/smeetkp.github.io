export class RetroAudio {
  private static audioContext: AudioContext | null = null;
  private static initialized = false;
  private static muted = false;

  static init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  static isMuted(): boolean {
    return this.muted;
  }

  static setMuted(muted: boolean) {
    this.muted = muted;
  }

  static toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private static ensureContext() {
    if (!this.audioContext) {
      this.init();
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  static play(type: 'jump' | 'coin' | 'bump' | 'break' | 'powerup' | 'die') {
    if (this.muted) return; // Skip if muted
    
    const ctx = this.ensureContext();
    if (!ctx) return;

    switch (type) {
      case 'jump':
        this.playJump(ctx);
        break;
      case 'coin':
        this.playCoin(ctx);
        break;
      case 'bump':
        this.playBump(ctx);
        break;
      case 'break':
        this.playBreak(ctx);
        break;
      case 'powerup':
        this.playPowerup(ctx);
        break;
      case 'die':
        this.playDie(ctx);
        break;
    }
  }

  private static playJump(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  private static playCoin(ctx: AudioContext) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'square';
    osc2.type = 'square';
    
    osc1.frequency.setValueAtTime(988, ctx.currentTime); // B5
    osc2.frequency.setValueAtTime(1319, ctx.currentTime + 0.05); // E6
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.05);
    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.15);
  }

  private static playBump(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  private static playBreak(ctx: AudioContext) {
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    
    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();
    
    noise.buffer = buffer;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    noise.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(ctx.currentTime);
  }

  private static playPowerup(ctx: AudioContext) {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.connect(ctx.destination);
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      osc.connect(gain);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.08);
    });
    
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  }

  private static playDie(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  }
}
