/**
 * Feed the Monster — pure rules.
 *
 * A category is called ("feed the monster FRUIT"); the child taps drifting items
 * that belong to it. Feed `targets` correct items to win. Trains categorization
 * / sorting (does this item belong to the named group?).
 *
 * Pure: it only compares an item's category to the called one. The screen owns
 * the item pool, their emoji, and their motion.
 */
import type { Rng } from '../rng.js';
import { pickMany } from '../rng.js';

export interface FeedMonsterConfig {
  /** The category axis to sort on, e.g. `['FRUIT','VEGGIE']`. */
  categories: readonly string[];
  /** How many correct items to feed to win the round. */
  targets: number;
}

export type FeedMonsterPhase = 'input' | 'won';

export interface FeedMonsterState {
  queue: string[];
  index: number;
  hits: number;
  misses: number;
  phase: FeedMonsterPhase;
}

export type FeedOutcome =
  | { kind: 'hit'; state: FeedMonsterState }
  | { kind: 'won'; state: FeedMonsterState }
  | { kind: 'miss'; state: FeedMonsterState };

export function createFeedMonsterState(config: FeedMonsterConfig, rng: Rng): FeedMonsterState {
  return {
    queue: pickMany(config.categories, config.targets, rng),
    index: 0,
    hits: 0,
    misses: 0,
    phase: 'input',
  };
}

/** The category the monster wants fed now (`undefined` once won). */
export function currentCategory(state: FeedMonsterState): string | undefined {
  return state.queue[state.index];
}

/** Register feeding an item of category `category` against the called one. */
export function feed(state: FeedMonsterState, category: string): FeedOutcome {
  if (state.phase !== 'input') return { kind: 'miss', state };
  if (category !== state.queue[state.index]) {
    return { kind: 'miss', state: { ...state, misses: state.misses + 1 } };
  }
  const index = state.index + 1;
  const hits = state.hits + 1;
  if (index >= state.queue.length) {
    return { kind: 'won', state: { ...state, index, hits, phase: 'won' } };
  }
  return { kind: 'hit', state: { ...state, index, hits } };
}
