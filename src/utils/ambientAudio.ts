/**
 * Ambient Audio Engine for Rights Radar (inspired by Unseen Studio)
 * Uses native Web Audio API with zero external media files.
 * Provides atmospheric pads, harmonic resonance, and subtle radar pings.
 */

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private isMuted: boolean = false;
  private droneOscillators: OscillatorNode[] = [];
  private droneGain: GainNode | null = null;
  private pingInterval: any = null;

  private initContext() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    this.ctx = new AudioCtxClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  public start(withSound: boolean = true) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !withSound;
    this.isRunning = true;

    if (this.isMuted) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    } else {
      this.masterGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      this.startAtmosphericPad();
      this.startSubtleRadarPings();
    }
  }

  private startAtmosphericPad() {
    if (!this.ctx || !this.masterGain) return;

    // Harmonic chord frequencies for high-end cinematic feel: D2 (73.4Hz), A2 (110Hz), D3 (146.8Hz), F#3 (185Hz)
    const frequencies = [73.41, 110.0, 146.83, 185.0];

    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    // Warm low-pass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    padGain.connect(filter);
    filter.connect(this.masterGain);
    this.droneGain = padGain;

    this.droneOscillators = frequencies.map((freq) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      // Subtle slow detune modulation
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.setValueAtTime(0.12 + Math.random() * 0.08, this.ctx!.currentTime);
      lfoGain.gain.setValueAtTime(1.5, this.ctx!.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start();

      osc.start();
      return osc;
    });
  }

  private startSubtleRadarPings() {
    if (this.pingInterval) clearInterval(this.pingInterval);

    // Periodic gentle radar ping every 6 seconds
    this.pingInterval = setInterval(() => {
      if (!this.isMuted && this.isRunning) {
        this.playRadarPing();
      }
    }, 6200);
  }

  public playRadarPing(freq: number = 880) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.92, now + 0.35);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // Audio playback safety
    }
  }

  public playBlipSound() {
    this.playRadarPing(1174.66); // D6 bright ping
  }

  public toggleMute(): boolean {
    if (!this.ctx || !this.masterGain) {
      this.start(true);
      return true;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;

    const now = this.ctx.currentTime;
    if (this.isMuted) {
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.3);
    } else {
      if (this.droneOscillators.length === 0) {
        this.startAtmosphericPad();
        this.startSubtleRadarPings();
      }
      this.masterGain.gain.linearRampToValueAtTime(0.22, now + 0.3);
      this.playRadarPing(1046.5);
    }

    return !this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public stop() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.droneOscillators.forEach((o) => {
      try {
        o.stop();
      } catch {}
    });
    this.droneOscillators = [];
    this.isRunning = false;
  }
}

export const ambientAudio = new AmbientAudioEngine();
