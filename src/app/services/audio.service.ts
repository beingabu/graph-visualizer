import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx: AudioContext | null = null;
  private _enabled = true;
  private _volume = 0.15;
  private baseFreq = 220;
  private stepCounter = 0;

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
  }

  get volume(): number {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = Math.max(0, Math.min(1, value));
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal?: number): void {
    if (!this._enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const vol = gainVal ?? this._volume;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  playVisited(): void {
    this.stepCounter++;
    const pentatonic = [0, 2, 4, 7, 9, 12, 14, 16];
    const noteIndex = this.stepCounter % pentatonic.length;
    const semitones = pentatonic[noteIndex];
    const freq = this.baseFreq * Math.pow(2, semitones / 12);
    this.playTone(freq, 0.08, 'sine', this._volume * 0.4);
  }

  playFrontier(): void {
    const freq = 440 + Math.random() * 120;
    this.playTone(freq, 0.06, 'triangle', this._volume * 0.25);
  }

  playPathFound(): void {
    if (!this._enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sine', this._volume * 0.6), i * 120);
    });
  }

  playWallPlace(): void {
    this.playTone(120, 0.05, 'square', this._volume * 0.15);
  }

  playMazeStep(): void {
    this.stepCounter++;
    const freq = 150 + (this.stepCounter % 30) * 8;
    this.playTone(freq, 0.03, 'sawtooth', this._volume * 0.08);
  }

  playMazeComplete(): void {
    if (!this._enabled) return;
    const notes = [392, 440, 523.25];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.25, 'triangle', this._volume * 0.5), i * 100);
    });
  }

  playButtonClick(): void {
    this.playTone(800, 0.04, 'sine', this._volume * 0.3);
  }

  resetCounter(): void {
    this.stepCounter = 0;
  }
}
