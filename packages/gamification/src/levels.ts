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

/** How many levels every game offers. Kids grow into a long, gentle ladder. */
export const LEVELS_PER_GAME = 50;

/**
 * Ramp a numeric difficulty knob across {@link LEVELS_PER_GAME} levels: start at
 * `from`, step up by 1 every `every` levels, and never exceed `to` (the curve
 * plateaus at its cap for the hardest levels). `every` is chosen so the cap is
 * reached near the last level, keeping the slope gentle for a 5–10 year-old.
 * Each level still shuffles fresh content, so same-knob levels play differently.
 */
function ramp(from: number, to: number): number[] {
  const every = Math.max(1, Math.floor((LEVELS_PER_GAME - 1) / (to - from)));
  return Array.from({ length: LEVELS_PER_GAME }, (_, i) =>
    Math.min(from + Math.floor(i / every), to),
  );
}

/**
 * Pick one of three content tiers by level index: first third → `easy`, middle
 * third → `mid`, last third → `hard`. Content difficulty rises alongside the
 * numeric knobs.
 */
function tier<T>(i: number, easy: T, mid: T, hard: T): T {
  const f = i / LEVELS_PER_GAME;
  return f < 1 / 3 ? easy : f < 2 / 3 ? mid : hard;
}

/** All levels per game, in order. Index 0 = level 1. */
export const LEVELS: Record<GameId, readonly LevelDef[]> = {
  'memory-match': ramp(2, 18).map(
    (pairs): MemoryMatchLevel => ({ kind: 'memory-match', pairs, faces: ANIMAL_FACES }),
  ),
  simon: ramp(2, 18).map(
    (targetLength): SimonLevel => ({ kind: 'simon', pads: 4, targetLength }),
  ),
  keyboard: ramp(5, 18).map(
    (targets, i): KeyboardLevel => ({
      kind: 'keyboard',
      targets,
      alphabet: tier<readonly string[]>(i, LETTERS_EASY, LETTERS_MID, LETTERS_FULL),
    }),
  ),
  'word-typing': ramp(3, 12).map(
    (targets, i): WordTypingLevel => ({
      kind: 'word-typing',
      targets,
      words: tier<readonly string[]>(i, WORDS_EASY, WORDS_MID, WORDS_HARD),
    }),
  ),
  'say-it': ramp(3, 12).map(
    (targets, i): SayItLevel => ({
      kind: 'say-it',
      targets,
      items: tier<readonly SpeakItem[]>(i, SAY_IT_EASY, SAY_IT_MID, SAY_IT_HARD),
    }),
  ),
  'say-hello': ramp(3, 12).map(
    (targets): SayHelloLevel => ({ kind: 'say-hello', targets, prompts: GREETINGS }),
  ),
};

/** Number of levels a game has. */
export function levelCount(gameId: GameId): number {
  return LEVELS[gameId].length;
}

/** Fetch a level by its 1-based number, or `undefined` if out of range. */
export function getLevel(gameId: GameId, level: number): LevelDef | undefined {
  return LEVELS[gameId][level - 1];
}
