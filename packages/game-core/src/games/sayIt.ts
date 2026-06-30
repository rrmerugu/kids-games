/**
 * Say It! — pure rules (Speaking).
 *
 * A "listen-and-repeat" flashcard: the child is shown a picture + word, hears
 * Buddy model it, says it out loud, then self-confirms ("I said it!") to move
 * on. There is no grading — no microphone, no right/wrong — so it works on every
 * browser and never discourages a 5-year-old. Clearing `targets` items wins the
 * round. Trains vocabulary, pronunciation and letter→sound mapping.
 *
 * Pure: it only knows the item list and a cursor. The presentation layer plays
 * the speech, draws the picture and renders the buttons. `repeats` counts how
 * many times the child asked to hear a word again (used only for a gentle,
 * never-punishing star bonus).
 */
import type { Rng } from '../rng.js';
import { pickMany } from '../rng.js';

/** One thing to say — a picture (emoji) and the word it names. */
export interface SpeakItem {
  /** The word to say, e.g. "CAT". Stored uppercased. */
  word: string;
  /** The picture that carries the meaning for pre-readers, e.g. "🐱". */
  emoji: string;
}

export interface SayItConfig {
  /** Item pool to draw from. */
  items: readonly SpeakItem[];
  /** How many items to clear the round. */
  targets: number;
}

export type SayItPhase = 'speak' | 'won';

export interface SayItState {
  /** The items chosen for this round, in order. */
  items: SpeakItem[];
  /** Which item the child is on. */
  index: number;
  /** How many times the child asked to hear a word again this round. */
  repeats: number;
  phase: SayItPhase;
}

export type SayItOutcome =
  /** Confirmed an item; more items remain. */
  | { kind: 'next'; state: SayItState }
  /** Confirmed the last item — round won. */
  | { kind: 'won'; state: SayItState };

export function createSayItState(config: SayItConfig, rng: Rng): SayItState {
  return {
    items: pickMany(config.items, config.targets, rng).map((it) => ({
      word: it.word.toUpperCase(),
      emoji: it.emoji,
    })),
    index: 0,
    repeats: 0,
    phase: 'speak',
  };
}

/** The item currently shown (`undefined` once won). */
export function currentItem(state: SayItState): SpeakItem | undefined {
  return state.items[state.index];
}

/** Note that the child asked to hear the word again (e.g. tapped "Hear again"). */
export function hearAgain(state: SayItState): SayItState {
  if (state.phase !== 'speak') return state;
  return { ...state, repeats: state.repeats + 1 };
}

/** The child confirmed they said it — advance to the next item, or win. */
export function confirmSaid(state: SayItState): SayItOutcome {
  if (state.phase !== 'speak') return { kind: 'won', state };
  const index = state.index + 1;
  if (index >= state.items.length) {
    return { kind: 'won', state: { ...state, index, phase: 'won' } };
  }
  return { kind: 'next', state: { ...state, index } };
}
