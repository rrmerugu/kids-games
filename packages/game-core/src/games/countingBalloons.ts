/**
 * Counting Balloons — pure rules.
 *
 * Balloons show numbers; the child pops them in order 1 → N. Finish the count
 * `rounds` times to win. Trains counting and number sequence.
 *
 * Pure: it tracks the next expected number and the round; the screen owns which
 * numbers float on screen (always including `next`).
 */
export interface CountingConfig {
  /** Count up to this number each round. */
  count: number;
  /** How many times to count 1→N to win the round. */
  rounds: number;
}

export type CountingPhase = 'input' | 'won';

export interface CountingState {
  count: number;
  rounds: number;
  /** The next number to pop (1-based). */
  next: number;
  /** The current pass (1-based). */
  round: number;
  hits: number;
  misses: number;
  phase: CountingPhase;
}

export type CountingOutcome =
  | { kind: 'hit'; state: CountingState }
  | { kind: 'cleared'; state: CountingState }
  | { kind: 'won'; state: CountingState }
  | { kind: 'miss'; state: CountingState };

export function createCountingState(config: CountingConfig): CountingState {
  return {
    count: config.count,
    rounds: config.rounds,
    next: 1,
    round: 1,
    hits: 0,
    misses: 0,
    phase: 'input',
  };
}

/** The number the child should pop now (`undefined` once won). */
export function currentNumber(state: CountingState): number | undefined {
  return state.phase === 'won' ? undefined : state.next;
}

/** Register a popped balloon carrying number `value` (as a string). */
export function popCountBalloon(state: CountingState, value: string): CountingOutcome {
  if (state.phase !== 'input') return { kind: 'miss', state };
  const n = Number(value);
  if (n !== state.next) {
    return { kind: 'miss', state: { ...state, misses: state.misses + 1 } };
  }
  const hits = state.hits + 1;
  if (state.next < state.count) {
    return { kind: 'hit', state: { ...state, next: state.next + 1, hits } };
  }
  // Reached N — finished a pass.
  if (state.round >= state.rounds) {
    return { kind: 'won', state: { ...state, hits, phase: 'won' } };
  }
  return { kind: 'cleared', state: { ...state, next: 1, round: state.round + 1, hits } };
}
