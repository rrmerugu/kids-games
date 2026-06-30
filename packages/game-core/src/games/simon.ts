/**
 * Simon — pure rules.
 *
 * The board flashes a growing sequence of coloured pads; the player repeats it.
 * Each fully-correct repeat extends the sequence by one. The round is won when
 * the sequence reaches `targetLength`; a wrong pad loses it. Trains sequential
 * / working memory.
 */
import type { Rng } from '../rng.js';

export interface SimonConfig {
  /** Number of pads on the board (classic Simon = 4). */
  pads: number;
  /** Sequence length the player must reach to win the round. */
  targetLength: number;
}

export type SimonPhase = 'showing' | 'input' | 'won' | 'lost';

export interface SimonState {
  pads: number;
  targetLength: number;
  /** The pads flashed so far, in order. */
  sequence: number[];
  /** How many pads of the current sequence the player has correctly pressed. */
  inputIndex: number;
  phase: SimonPhase;
  mistakes: number;
}

export type PressOutcome =
  | { kind: 'correct'; state: SimonState }
  | { kind: 'round-complete'; state: SimonState }
  | { kind: 'won'; state: SimonState }
  | { kind: 'wrong'; state: SimonState };

export function createSimonState(config: SimonConfig): SimonState {
  return {
    pads: config.pads,
    targetLength: config.targetLength,
    sequence: [],
    inputIndex: 0,
    phase: 'showing',
    mistakes: 0,
  };
}

/**
 * Append a random pad and re-enter the `showing` phase. Called at the start of
 * the round and after each `round-complete`.
 */
export function extendSequence(state: SimonState, rng: Rng): SimonState {
  const next = Math.floor(rng() * state.pads);
  return {
    ...state,
    sequence: [...state.sequence, next],
    inputIndex: 0,
    phase: 'showing',
  };
}

/** Move from `showing` to `input` once the board finishes flashing. */
export function beginInput(state: SimonState): SimonState {
  return { ...state, phase: 'input' };
}

/** Index of the pad the player is expected to press next. */
export function expectedPad(state: SimonState): number | undefined {
  return state.sequence[state.inputIndex];
}

/**
 * Register a pad press during the `input` phase.
 * - wrong pad → `lost`.
 * - correct, sequence finished, at target → `won`.
 * - correct, sequence finished, below target → `round-complete` (caller should
 *   {@link extendSequence}).
 * - correct, more to go → `correct`.
 */
export function pressPad(state: SimonState, pad: number): PressOutcome {
  if (state.phase !== 'input') return { kind: 'wrong', state };

  if (pad !== state.sequence[state.inputIndex]) {
    return {
      kind: 'wrong',
      state: { ...state, phase: 'lost', mistakes: state.mistakes + 1 },
    };
  }

  const inputIndex = state.inputIndex + 1;
  if (inputIndex < state.sequence.length) {
    return { kind: 'correct', state: { ...state, inputIndex } };
  }

  // Whole sequence repeated correctly.
  if (state.sequence.length >= state.targetLength) {
    return { kind: 'won', state: { ...state, inputIndex, phase: 'won' } };
  }
  return { kind: 'round-complete', state: { ...state, inputIndex } };
}
