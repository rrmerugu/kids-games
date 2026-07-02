/**
 * Word Typing — pure rules.
 *
 * A whole word is shown letter-by-letter; the player types its letters in order
 * on the physical keyboard. Finishing a word advances to the next; clear
 * `targets` words to win the round. Trains spelling, letter recognition and
 * keyboard fluency at the *word* level (a step up from the single-letter
 * Keyboard Trainer).
 *
 * Pure: it only knows about a normalized key string. The presentation layer
 * attaches the `keydown` listener and passes `event.key` in. Words are
 * normalized to uppercase A–Z; the matcher reuses the trainer's
 * {@link normalizeKey} so `a` matches `A`.
 */
import type { Rng } from '../rng.js';
import { sampleNoRepeat } from '../rng.js';
import { normalizeKey } from './keyboardTrainer.js';

export interface WordTypingConfig {
  /** Word pool to draw from (case-insensitive; stored uppercased). */
  words: readonly string[];
  /** How many words to clear the round. */
  targets: number;
}

export type WordTypingPhase = 'input' | 'won';

export interface WordTypingState {
  /** The words chosen for this round, in order, uppercased. */
  words: string[];
  /** Which word the player is on. */
  wordIndex: number;
  /** Position of the next letter to type within the current word. */
  letterIndex: number;
  hits: number;
  misses: number;
  phase: WordTypingPhase;
}

export type WordOutcome =
  /** Correct letter; more letters remain in this word. */
  | { kind: 'hit'; state: WordTypingState }
  /** Correct letter that *finished* a word; more words remain. */
  | { kind: 'word'; state: WordTypingState }
  /** Correct letter that finished the *last* word — round won. */
  | { kind: 'won'; state: WordTypingState }
  /** Wrong key; the cursor does not advance. */
  | { kind: 'miss'; state: WordTypingState };

export function createWordTypingState(config: WordTypingConfig, rng: Rng): WordTypingState {
  return {
    words: sampleNoRepeat(config.words, config.targets, rng, (w) => w.toUpperCase()).map((w) =>
      w.toUpperCase(),
    ),
    wordIndex: 0,
    letterIndex: 0,
    hits: 0,
    misses: 0,
    phase: 'input',
  };
}

/** The word currently being typed (`undefined` once won). */
export function currentWord(state: WordTypingState): string | undefined {
  return state.words[state.wordIndex];
}

/** The single letter the player should press now (`undefined` once won). */
export function currentLetter(state: WordTypingState): string | undefined {
  const word = currentWord(state);
  return word ? word[state.letterIndex] : undefined;
}

/** Register a key press against the current letter. */
export function typeLetter(state: WordTypingState, rawKey: string): WordOutcome {
  if (state.phase !== 'input') return { kind: 'miss', state };

  const word = state.words[state.wordIndex];
  if (!word) return { kind: 'miss', state };

  const key = normalizeKey(rawKey);
  if (key !== word[state.letterIndex]) {
    return { kind: 'miss', state: { ...state, misses: state.misses + 1 } };
  }

  const hits = state.hits + 1;
  const letterIndex = state.letterIndex + 1;

  // Still letters left in this word.
  if (letterIndex < word.length) {
    return { kind: 'hit', state: { ...state, letterIndex, hits } };
  }

  // Word finished — advance to the next word, or win.
  const wordIndex = state.wordIndex + 1;
  if (wordIndex >= state.words.length) {
    return { kind: 'won', state: { ...state, hits, letterIndex, wordIndex, phase: 'won' } };
  }
  return { kind: 'word', state: { ...state, hits, wordIndex, letterIndex: 0 } };
}
