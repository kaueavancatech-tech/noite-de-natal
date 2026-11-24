// Motor de áudio híbrido: usa Howler.js para arquivos reais em /public/audio/
// e faz fallback transparente para Web Audio API (caixa de música + efeitos sonoros)
// garantindo 100% de funcionamento sem depender de arquivos externos.

import { Howl } from 'howler';
import { TrackItem } from '../../types/christmas';

export const PLAYLIST: TrackItem[] = [
  {
    id: 'silent-night',
    titleKey: 'audio.tracks.silentNight',
    src: '/audio/noite-silenciosa.mp3',
    // G4, A4, G4, E4, G4, A4, G4, E4, D5, D5, B4, C5, C5, G4
    melodyNotes: [392.0, 440.0, 392.0, 329.63, 392.0, 440.0, 392.0, 329.63, 587.33, 587.33, 493.88, 523.25, 523.25, 392.0],
  },
  {
    id: 'jingle-bells',
    titleKey: 'audio.tracks.jingleBells',
    src: '/audio/sinos-de-belem.mp3',
    // E4 E4 E4 | E4 E4 E4 | E4 G4 C4 D4 E4
    melodyNotes: [329.63, 329.63, 329.63, 329.63, 329.63, 329.63, 329.63, 392.0, 261.63, 293.66, 329.63, 349.23, 349.23, 349.23],
  },
  {
    id: 'winter-magic',
    titleKey: 'audio.tracks.winterMagic',
    src: '/audio/magia-de-inverno.mp3',
    melodyNotes: [523.25, 493.88, 392.0, 440.0, 392.0, 329.63, 293.66, 329.63, 392.0, 523.25, 587.33, 523.25],
  },
];

class ChristmasSoundEngine {
  private ctx: AudioContext | null = null;
  private howl: Howl | null = null;
  private synthTimer: number | null = null;
  private noteIndex = 0;
  private isPlaying = false;
  private volume = 0.65;
  private ducked = false;
  private usingSynth = false;

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getEffectiveVolume(): number {
    return this.ducked ? this.volume * 0.18 : this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.howl) {
      this.howl.volume(this.getEffectiveVolume());
    }
  }

  public setDucking(duck: boolean) {
    this.ducked = duck;
    if (this.howl) {
      this.howl.volume(this.getEffectiveVolume());
    }
  }

  public isUsingSynth(): boolean {
    return this.usingSynth;
  }

  public playTrack(
    track: TrackItem,
    onEnded: () => void,
    onStateChange: (playing: boolean, synthFallback: boolean) => void
  ) {
    this.stopMusic();
    this.isPlaying = true;

    const howl = new Howl({
      src: [track.src],
      html5: true,
      volume: this.getEffectiveVolume(),
      onload: () => {
        this.usingSynth = false;
        onStateChange(true, false);
      },
      onplay: () => {
        this.usingSynth = false;
        onStateChange(true, false);
      },
      onend: () => {
        onEnded();
      },
      onloaderror: () => {
        howl.unload();
        this.howl = null;
        this.startSynthLoop(track, onStateChange);
      },
      onplayerror: () => {
        howl.unload();
        this.howl = null;
        this.startSynthLoop(track, onStateChange);
      },
    });

    this.howl = howl;
    howl.play();
  }

  private startSynthLoop(
    track: TrackItem,
    onStateChange: (playing: boolean, synthFallback: boolean) => void
  ) {
    const ctx = this.ensureCtx();
    if (!ctx) {
      onStateChange(false, true);
      return;
    }
    this.usingSynth = true;
    this.noteIndex = 0;
    onStateChange(true, true);

    const playNextNote = () => {
      if (!this.isPlaying || !this.ctx) return;
      const freq = track.melodyNotes[this.noteIndex % track.melodyNotes.length];
      this.noteIndex += 1;
      this.triggerBellTone(freq, 0.52, this.getEffectiveVolume() * 0.25);
    };

    playNextNote();
    this.synthTimer = window.setInterval(playNextNote, 560);
  }

  public pauseMusic() {
    this.isPlaying = false;
    if (this.howl) {
      this.howl.pause();
    }
    if (this.synthTimer !== null) {
      window.clearInterval(this.synthTimer);
      this.synthTimer = null;
    }
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
      this.howl = null;
    }
    if (this.synthTimer !== null) {
      window.clearInterval(this.synthTimer);
      this.synthTimer = null;
    }
  }

  private triggerBellTone(freq: number, duration: number, gainPeak: number) {
    const ctx = this.ensureCtx();
    if (!ctx || gainPeak <= 0.001) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(freq * 2, now);

    const harmonicGain = ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.18, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    harmonic.start(now);
    osc.stop(now + duration + 0.02);
    harmonic.stop(now + duration + 0.02);
  }

  public playSfx(
    type: 'chime' | 'gift' | 'mailbox' | 'snowball' | 'draw' | 'party',
    enabled: boolean
  ) {
    if (!enabled) return;
    const vol = Math.max(0.06, this.volume * 0.35);

    switch (type) {
      case 'chime':
        this.triggerBellTone(880, 0.45, vol);
        setTimeout(() => this.triggerBellTone(1174.66, 0.55, vol * 0.85), 90);
        break;
      case 'gift':
        [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => {
          setTimeout(() => this.triggerBellTone(n, 0.4, vol * 0.9), i * 75);
        });
        break;
      case 'mailbox':
        this.triggerBellTone(587.33, 0.35, vol);
        setTimeout(() => this.triggerBellTone(880, 0.5, vol), 110);
        setTimeout(() => this.triggerBellTone(1318.5, 0.65, vol * 0.8), 220);
        break;
      case 'snowball':
        this.triggerBellTone(220, 0.18, vol);
        setTimeout(() => this.triggerBellTone(146.83, 0.25, vol * 1.1), 50);
        break;
      case 'draw':
        [440, 554.37, 659.25, 880].forEach((n, i) => {
          setTimeout(() => this.triggerBellTone(n, 0.35, vol), i * 85);
        });
        break;
      case 'party':
        [659.25, 783.99, 987.77, 1318.5].forEach((n, i) => {
          setTimeout(() => this.triggerBellTone(n, 0.4, vol), i * 65);
        });
        break;
    }
  }
}

export const soundEngine = new ChristmasSoundEngine();
