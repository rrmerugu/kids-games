/**
 * Balloon Pop — pure rules.
 *
 * A target symbol (a letter or number) is called; the child taps the floating
 * balloon that shows it. Clear `targets` balloons to win. Trains symbol
 * recognition and quick visual selection.
 *
 * Pure: it only knows the value a tapped balloon carries. The screen owns the
 * balloons, their motion, and which distractors are on screen.
 */
import type { Rng } from '../rng.js';
import { pickMany } from '../rng.js';

export interface BalloonPopConfig {
  /** Symbols that may appear (already normalized, e.g. `['A','B',…]`). */
  pool: readonly string[];
  /** How many balloons to pop to clear the round. */
  targets: number;
}

export type BalloonPopPhase = 'input' | 'won';

export interface BalloonPopState {
  queue: string[];
  index: number;
  hits: number;
  misses: number;
  phase: BalloonPopPhase;
}

export type BalloonOutcome =
  | { kind: 'hit'; state: BalloonPopState }
  | { kind: 'won'; state: BalloonPopState }
  | { kind: 'miss'; state: BalloonPopState };

export function createBalloonPopState(config: BalloonPopConfig, rng: Rng): BalloonPopState {
  return {
    queue: pickMany(config.pool, config.targets, rng),
    index: 0,
    hits: 0,
    misses: 0,
    phase: 'input',
  };
}

/** The symbol the child should pop now (`undefined` once won). */
export function currentBalloon(state: BalloonPopState): string | undefined {
  return state.queue[state.index];
}

/** Register a popped balloon carrying `value` against the current target. */
export function popBalloon(state: BalloonPopState, value: string): BalloonOutcome {
  if (state.phase !== 'input') return { kind: 'miss', state };
  if (value !== state.queue[state.index]) {
    return { kind: 'miss', state: { ...state, misses: state.misses + 1 } };
  }
  const index = state.index + 1;
  const hits = state.hits + 1;
  if (index >= state.queue.length) {
    return { kind: 'won', state: { ...state, index, hits, phase: 'won' } };
  }
  return { kind: 'hit', state: { ...state, index, hits } };
}
