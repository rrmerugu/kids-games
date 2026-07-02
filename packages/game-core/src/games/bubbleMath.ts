/**
 * Bubble Math — pure rules.
 *
 * A sum is shown ("2 + 3"); the child pops the bubble carrying the answer.
 * Solve `targets` problems to win. Trains early addition / subtraction and
 * number sense.
 *
 * Pure: all problems are generated up front from a seeded RNG, so a round is
 * deterministic in tests. The screen owns the answer + distractor bubbles.
 */
import type { Rng } from '../rng.js';
import { pick } from '../rng.js';

export type MathOp = '+' | '-';

export interface MathProblem {
  a: number;
  b: number;
  op: MathOp;
  answer: number;
}

export interface BubbleMathConfig {
  /** Largest operand / result that may appear. */
  maxOperand: number;
  /** Which operations may appear. */
  ops: readonly MathOp[];
  /** How many problems to solve to win the round. */
  targets: number;
}

export type BubbleMathPhase = 'input' | 'won';

export interface BubbleMathState {
  problems: MathProblem[];
  index: number;
  hits: number;
  misses: number;
  phase: BubbleMathPhase;
}

export type BubbleMathOutcome =
  | { kind: 'hit'; state: BubbleMathState }
  | { kind: 'won'; state: BubbleMathState }
  | { kind: 'miss'; state: BubbleMathState };

/** Build one problem whose operands and answer stay within `[0, maxOperand]`. */
export function makeProblem(config: BubbleMathConfig, rng: Rng): MathProblem {
  const op = pick(config.ops, rng);
  const max = config.maxOperand;
  if (op === '-') {
    const a = Math.floor(rng() * (max + 1));
    const b = Math.floor(rng() * (a + 1));
    return { a, b, op, answer: a - b };
  }
  // '+': keep the sum within range.
  const a = Math.floor(rng() * (max + 1));
  const b = Math.floor(rng() * (max - a + 1));
  return { a, b, op, answer: a + b };
}

export function createBubbleMathState(config: BubbleMathConfig, rng: Rng): BubbleMathState {
  return {
    problems: Array.from({ length: config.targets }, () => makeProblem(config, rng)),
    index: 0,
    hits: 0,
    misses: 0,
    phase: 'input',
  };
}

/** The problem to solve now (`undefined` once won). */
export function currentProblem(state: BubbleMathState): MathProblem | undefined {
  return state.problems[state.index];
}

/** Register a popped bubble carrying number `value` (as a string). */
export function popBubble(state: BubbleMathState, value: string): BubbleMathOutcome {
  if (state.phase !== 'input') return { kind: 'miss', state };
  const problem = state.problems[state.index];
  if (!problem || Number(value) !== problem.answer) {
    return { kind: 'miss', state: { ...state, misses: state.misses + 1 } };
  }
  const index = state.index + 1;
  const hits = state.hits + 1;
  if (index >= state.problems.length) {
    return { kind: 'won', state: { ...state, index, hits, phase: 'won' } };
  }
  return { kind: 'hit', state: { ...state, index, hits } };
}
