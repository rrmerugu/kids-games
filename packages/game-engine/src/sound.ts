/**
 * Tiny Web Audio helper — short synthesized tones for pad presses, hits, wins
 * and errors. No assets. All calls are no-ops when Web Audio is unavailable;
 * callers gate on the user's sound setting before calling.
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

/** Play a single tone. */
export function tone(
  freq: number,
  ms = 180,
  type: OscillatorType = 'sine',
  gain = 0.15,
): void {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g).connect(ac.destination);
  const now = ac.currentTime;
  // Quick attack + decay so notes don't click.
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000);
  osc.start(now);
  osc.stop(now + ms / 1000);
}

/** Pleasant per-pad pitches for Simon (indices 0..3 wrap). */
export const PAD_FREQS = [329.63, 392.0, 493.88, 587.33] as const;

export function playPad(index: number): void {
  tone(PAD_FREQS[index % PAD_FREQS.length]!, 260, 'sine', 0.18);
}

export function playHit(): void {
  tone(660, 120, 'triangle', 0.16);
}

export function playWrong(): void {
  tone(150, 220, 'sawtooth', 0.14);
}

/** "Done!" — a bright two-note rising chime for a correct answer. */
export function playSuccess(): void {
  tone(659.25, 90, 'triangle', 0.16); // E5
  setTimeout(() => tone(987.77, 150, 'triangle', 0.16), 95); // B5
}

/** "Error" — a soft, non-scary two-note falling buzz for a wrong answer. */
export function playError(): void {
  tone(311.13, 130, 'sine', 0.14); // E♭4
  setTimeout(() => tone(233.08, 200, 'sine', 0.14), 110); // B♭3
}

export function playWin(): void {
  [523.25, 659.25, 783.99].forEach((f, i) =>
    setTimeout(() => tone(f, 180, 'triangle', 0.18), i * 130),
  );
}
