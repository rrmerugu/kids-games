/**
 * Keyboard Trainer — pure rules.
 *
 * A target letter is shown; the player presses the matching key on the physical
 * keyboard. Complete `targets` letters to win the round. Trains letter
 * recognition and keyboard/motor familiarity.
 *
 * Pure: it only knows about a normalized key string. The presentation layer
 * attaches the `keydown` listener and passes `event.key` in.
 */
import type { Rng } from '../rng.js';
import { pickMany } from '../rng.js';

export interface KeyboardConfig {
  /** Letters that may appear (already normalized, e.g. `['A','B',...]`). */
  alphabet: readonly string[];
  /** How many letters to clear the round. */
  targets: number;
}

export type KeyboardPhase = 'input' | 'won';

export interface KeyboardState {
  queue: string[];
  index: number;
  hits: number;
  misses: number;
  phase: KeyboardPhase;
}

export type KeyOutcome =
  | { kind: 'hit'; state: KeyboardState }
  | { kind: 'won'; state: KeyboardState }
  | { kind: 'miss'; state: KeyboardState };

export function createKeyboardState(config: KeyboardConfig, rng: Rng): KeyboardState {
  return {
    queue: pickMany(config.alphabet, config.targets, rng),
    index: 0,
    hits: 0,
    misses: 0,
    phase: 'input',
  };
}

/** The letter the player should press now (`undefined` once won). */
export function currentTarget(state: KeyboardState): string | undefined {
  return state.queue[state.index];
}

/** Normalize a raw `KeyboardEvent.key` to a single uppercase character. */
export function normalizeKey(key: string): string {
  return key.length === 1 ? key.toUpperCase() : key;
}

/** Register a key press against the current target. */
export function pressKey(state: KeyboardState, rawKey: string): KeyOutcome {
  if (state.phase !== 'input') return { kind: 'miss', state };

  const key = normalizeKey(rawKey);
  if (key !== state.queue[state.index]) {
    return { kind: 'miss', state: { ...state, misses: state.misses + 1 } };
  }

  const index = state.index + 1;
  const hits = state.hits + 1;
  if (index >= state.queue.length) {
    return { kind: 'won', state: { ...state, index, hits, phase: 'won' } };
  }
  return { kind: 'hit', state: { ...state, index, hits } };
}
