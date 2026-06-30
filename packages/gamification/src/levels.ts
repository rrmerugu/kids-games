/**
 * Level definitions — the difficulty curve for each game. A level's fields are
 * exactly what `@kids/game-core` needs to build a round, so the app can hand a
 * `LevelDef` almost straight into the matching `create*State`.
 *
 * Tuned for a 6-year-old: gentle starts, no time pressure.
 */
import type { ConvPrompt, GameId, SpeakItem } from '@kids/game-core';
import {
  ANIMAL_FACES,
  GREETINGS,
  LETTERS_EASY,
  LETTERS_FULL,
  LETTERS_MID,
  SAY_IT_EASY,
  SAY_IT_HARD,
  SAY_IT_MID,
  WORDS_EASY,
  WORDS_HARD,
  WORDS_MID,
} from './content.js';

export interface MemoryMatchLevel {
  kind: 'memory-match';
  pairs: number;
  faces: readonly string[];
}
export interface SimonLevel {
  kind: 'simon';
  pads: number;
  targetLength: number;
}
export interface KeyboardLevel {
  kind: 'keyboard';
  targets: number;
  alphabet: readonly string[];
}
export interface WordTypingLevel {
  kind: 'word-typing';
  /** How many words to clear the round. */
  targets: number;
  words: readonly string[];
}
export interface SayItLevel {
  kind: 'say-it';
  /** How many picture-words to clear the round. */
  targets: number;
  items: readonly SpeakItem[];
}
export interface SayHelloLevel {
  kind: 'say-hello';
  /** How many conversation turns to clear the round. */
  targets: number;
  prompts: readonly ConvPrompt[];
}
export type LevelDef =
  | MemoryMatchLevel
  | SimonLevel
  | KeyboardLevel
  | WordTypingLevel
  | SayItLevel
  | SayHelloLevel;

/** All levels per game, in order. Index 0 = level 1. */
export const LEVELS: Record<GameId, readonly LevelDef[]> = {
  'memory-match': [3, 4, 6, 8, 10, 12].map(
    (pairs): MemoryMatchLevel => ({ kind: 'memory-match', pairs, faces: ANIMAL_FACES }),
  ),
  simon: [2, 3, 4, 5, 6, 8].map(
    (targetLength): SimonLevel => ({ kind: 'simon', pads: 4, targetLength }),
  ),
  keyboard: [
    { kind: 'keyboard', targets: 5, alphabet: LETTERS_EASY },
    { kind: 'keyboard', targets: 8, alphabet: LETTERS_MID },
    { kind: 'keyboard', targets: 10, alphabet: LETTERS_FULL },
  ],
  'word-typing': [
    { kind: 'word-typing', targets: 3, words: WORDS_EASY },
    { kind: 'word-typing', targets: 4, words: WORDS_MID },
    { kind: 'word-typing', targets: 5, words: WORDS_HARD },
  ],
  'say-it': [
    { kind: 'say-it', targets: 4, items: SAY_IT_EASY },
    { kind: 'say-it', targets: 5, items: SAY_IT_MID },
    { kind: 'say-it', targets: 6, items: SAY_IT_HARD },
  ],
  'say-hello': [
    { kind: 'say-hello', targets: 3, prompts: GREETINGS },
    { kind: 'say-hello', targets: 5, prompts: GREETINGS },
    { kind: 'say-hello', targets: 7, prompts: GREETINGS },
  ],
};

/** Number of levels a game has. */
export function levelCount(gameId: GameId): number {
  return LEVELS[gameId].length;
}

/** Fetch a level by its 1-based number, or `undefined` if out of range. */
export function getLevel(gameId: GameId, level: number): LevelDef | undefined {
  return LEVELS[gameId][level - 1];
}
