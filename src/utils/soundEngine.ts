// Real Music & Spatial Audio Engine with HTML5 Audio and Web Audio API

let musicAudio: HTMLAudioElement | null = null;
let isAudioMuted = false;
let audioCtx: AudioContext | null = null;
let fadeInterval: any = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function getMusicElement(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!musicAudio) {
    musicAudio = new Audio('/audio/ambient-lofi.mp3');
    musicAudio.loop = true;
    musicAudio.volume = 0.35;
    musicAudio.preload = 'auto';
  }
  return musicAudio;
}

export const soundEngine = {
  getTrackTitle: () => "Relaxed City — Studio Lo-Fi Dreamscape (256 kbps)",

  isMuted: () => isAudioMuted,

  setMuted: (muted: boolean) => {
    isAudioMuted = muted;
    if (muted) {
      soundEngine.stopAmbient();
    } else {
      soundEngine.startAmbient();
    }
  },

  toggleMute: () => {
    const nextMuted = !isAudioMuted;
    soundEngine.setMuted(nextMuted);
    return nextMuted;
  },

  startAmbient: () => {
    if (isAudioMuted) return;
    const audio = getMusicElement();
    if (!audio) return;

    if (fadeInterval) clearInterval(fadeInterval);

    try {
      if (audio.paused) {
        audio.volume = 0.05;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Fade volume in to 0.4
              fadeInterval = setInterval(() => {
                if (audio.volume < 0.4) {
                  audio.volume = Math.min(0.4, audio.volume + 0.05);
                } else {
                  clearInterval(fadeInterval);
                }
              }, 100);
            })
            .catch(() => {
              // Browser autoplay policy blocked until interaction
            });
        }
      }
    } catch {
      // Handled silently
    }
  },

  stopAmbient: () => {
    const audio = musicAudio;
    if (!audio) return;
    if (fadeInterval) clearInterval(fadeInterval);

    try {
      fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.08);
        } else {
          clearInterval(fadeInterval);
          audio.pause();
        }
      }, 80);
    } catch {
      audio.pause();
    }
  },

  playPing: () => {
    if (isAudioMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {}
  },

  playGlitch: () => {
    if (isAudioMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(4, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.16);
    } catch {}
  },

  playTick: () => {
    if (isAudioMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  },

  playClick: () => {
    if (isAudioMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  },
};
