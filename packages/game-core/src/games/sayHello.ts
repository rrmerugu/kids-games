/**
 * Say Hello! — pure rules (Conversation).
 *
 * A tap-the-reply dialogue: a character says a line ("Hi! How are you?") and the
 * child picks the right reply from a few emoji + short-word choices. Branching
 * mini-scenes teach basic social skills — greetings, politeness, asking for and
 * offering help. Fully playable with touch or keyboard; every line is read
 * aloud, so reading is optional. Clearing `targets` turns wins the round.
 *
 * Pure: it only knows the chosen prompts and a cursor. The presentation layer
 * speaks the lines, draws the character and renders the choice buttons. A wrong
 * tap is a gentle "try again" (counted as a miss, cursor stays) — never a loss.
 */
import type { Rng } from '../rng.js';
import { shuffle } from '../rng.js';

/** One reply option for a prompt. */
export interface ConvChoice {
  emoji: string;
  /** A short reply, e.g. "I'm good!". Short words are decoration over the emoji. */
  label: string;
  correct: boolean;
}

/** One turn of conversation — what the character says + the reply options. */
export interface ConvPrompt {
  /** The character speaking, as an emoji, e.g. "🧑". */
  speaker: string;
  /** What they say, e.g. "Hi! How are you?". Spoken aloud by the screen. */
  text: string;
  choices: readonly ConvChoice[];
}

export interface SayHelloConfig {
  /** Prompt pool to draw distinct turns from. */
  prompts: readonly ConvPrompt[];
  /** How many turns to clear the round. */
  targets: number;
}

export type SayHelloPhase = 'input' | 'won';

export interface SayHelloState {
  /** The turns chosen for this round, in order. */
  prompts: ConvPrompt[];
  /** Which turn the child is on. */
  index: number;
  /** Wrong taps this round (for star scoring; never ends the round). */
  misses: number;
  phase: SayHelloPhase;
}

export type SayHelloOutcome =
  /** Wrong reply — try again, cursor does not advance. */
  | { kind: 'wrong'; state: SayHelloState }
  /** Right reply; more turns remain. */
  | { kind: 'next'; state: SayHelloState }
  /** Right reply on the last turn — round won. */
  | { kind: 'won'; state: SayHelloState };

export function createSayHelloState(config: SayHelloConfig, rng: Rng): SayHelloState {
  // Distinct turns (no repeats within a round) — repeating a greeting feels odd.
  const targets = Math.min(config.targets, config.prompts.length);
  return {
    prompts: shuffle(config.prompts, rng).slice(0, targets),
    index: 0,
    misses: 0,
    phase: 'input',
  };
}

/** The turn currently shown (`undefined` once won). */
export function currentPrompt(state: SayHelloState): ConvPrompt | undefined {
  return state.prompts[state.index];
}

/** Register a choice by its index in the current prompt's `choices`. */
export function choose(state: SayHelloState, choiceIndex: number): SayHelloOutcome {
  if (state.phase !== 'input') return { kind: 'won', state };
  const prompt = state.prompts[state.index];
  const choice = prompt?.choices[choiceIndex];
  if (!choice) return { kind: 'wrong', state };

  if (!choice.correct) {
    return { kind: 'wrong', state: { ...state, misses: state.misses + 1 } };
  }

  const index = state.index + 1;
  if (index >= state.prompts.length) {
    return { kind: 'won', state: { ...state, index, phase: 'won' } };
  }
  return { kind: 'next', state: { ...state, index } };
}
