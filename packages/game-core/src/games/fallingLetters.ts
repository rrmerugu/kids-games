/**
 * Falling Letters — pure rules.
 *
 * Letters drift gently down; the child catches each by pressing its key (or
 * tapping it). Catch `targets` letters to win. Trains letter→key fluency under a
 * calm, self-paced flow (a letter reaching the floor is *not* a loss — it just
 * counts as a gentle miss for analytics).
 *
 * The pure layer only counts catches vs. misses and decides the win. "Does this
 * keypress match a letter currently on screen" is trivial screen logic
 * (`key ∈ field.values()`), so it stays out of here.
 */
export interface FallingLettersConfig {
  /** How many letters to catch to win the round. */
  targets: number;
}

export type FallingPhase = 'input' | 'won';

export interface FallingLettersState {
  targets: number;
  caught: number;
  missed: number;
  phase: FallingPhase;
}

export type FallingOutcome =
  | { kind: 'caught'; state: FallingLettersState }
  | { kind: 'won'; state: FallingLettersState };

export function createFallingLettersState(config: FallingLettersConfig): FallingLettersState {
  return { targets: config.targets, caught: 0, missed: 0, phase: 'input' };
}

/** A letter was caught (matched a keypress / tap). Advances the round. */
export function registerCatch(state: FallingLettersState): FallingOutcome {
  if (state.phase !== 'input') return { kind: 'won', state };
  const caught = state.caught + 1;
  if (caught >= state.targets) {
    return { kind: 'won', state: { ...state, caught, phase: 'won' } };
  }
  return { kind: 'caught', state: { ...state, caught } };
}

/** A letter reached the floor uncaught — a gentle miss, never a loss. */
export function registerMiss(state: FallingLettersState): FallingLettersState {
  if (state.phase !== 'input') return state;
  return { ...state, missed: state.missed + 1 };
}
