/**
 * Color Splash — pure rules.
 *
 * A colour is called ("pop all the BLUE ones"); the child pops every balloon of
 * that colour, then the next colour is called. Clear `targets` colours to win.
 * Trains colour recognition and simple set thinking (find *all* of a kind).
 *
 * Pure: it tracks the current colour and how many of it remain to pop; the
 * screen owns the balloons and how many of each colour float on screen.
 */
import type { Rng } from '../rng.js';
import { shuffle } from '../rng.js';

export interface ColorSplashConfig {
  /** Colour names that may be called (e.g. `['RED','BLUE',…]`). */
  colors: readonly string[];
  /** How many colours to clear the round. */
  targets: number;
  /** How many balloons of the called colour to pop before it clears. */
  perColor: number;
}

export type ColorSplashPhase = 'input' | 'won';

export interface ColorSplashState {
  queue: string[];
  index: number;
  /** How many of the current colour are still to be popped. */
  remaining: number;
  perColor: number;
  hits: number;
  misses: number;
  phase: ColorSplashPhase;
}

export type ColorOutcome =
  | { kind: 'hit'; state: ColorSplashState }
  | { kind: 'cleared'; state: ColorSplashState }
  | { kind: 'won'; state: ColorSplashState }
  | { kind: 'miss'; state: ColorSplashState };

/** A colour queue with no two adjacent colours the same (feels less repetitive). */
function buildQueue(colors: readonly string[], targets: number, rng: Rng): string[] {
  const out: string[] = [];
  let bag: string[] = [];
  for (let i = 0; i < targets; i++) {
    if (bag.length === 0) bag = shuffle(colors, rng);
    let next = bag.pop()!;
    if (out.length > 0 && next === out[out.length - 1] && bag.length > 0) {
      const swap = bag.pop()!;
      bag.push(next);
      next = swap;
    }
    out.push(next);
  }
  return out;
}

export function createColorSplashState(config: ColorSplashConfig, rng: Rng): ColorSplashState {
  return {
    queue: buildQueue(config.colors, config.targets, rng),
    index: 0,
    remaining: config.perColor,
    perColor: config.perColor,
    hits: 0,
    misses: 0,
    phase: 'input',
  };
}

/** The colour the child should be popping now (`undefined` once won). */
export function currentColor(state: ColorSplashState): string | undefined {
  return state.queue[state.index];
}

/** Register a popped balloon of colour `color` against the current colour. */
export function popColor(state: ColorSplashState, color: string): ColorOutcome {
  if (state.phase !== 'input') return { kind: 'miss', state };
  if (color !== state.queue[state.index]) {
    return { kind: 'miss', state: { ...state, misses: state.misses + 1 } };
  }
  const hits = state.hits + 1;
  const remaining = state.remaining - 1;
  if (remaining > 0) {
    return { kind: 'hit', state: { ...state, remaining, hits } };
  }
  const index = state.index + 1;
  if (index >= state.queue.length) {
    return { kind: 'won', state: { ...state, index, remaining: 0, hits, phase: 'won' } };
  }
  return {
    kind: 'cleared',
    state: { ...state, index, remaining: state.perColor, hits },
  };
}
