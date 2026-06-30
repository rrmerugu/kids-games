/**
 * Level definitions — the difficulty curve for each game. A level's fields are
 * exactly what `@kids/game-core` needs to build a round, so the app can hand a
 * `LevelDef` almost straight into the matching `create*State`.
 *
 * Tuned for a 6-year-old: gentle starts, no time pressure.
 */
import type { GameId } from '@kids/game-core';
import {
  ANIMAL_FACES,
  LETTERS_EASY,
  LETTERS_FULL,
  LETTERS_MID,
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
export type LevelDef = MemoryMatchLevel | SimonLevel | KeyboardLevel;

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
};

/** Number of levels a game has. */
export function levelCount(gameId: GameId): number {
  return LEVELS[gameId].length;
}

/** Fetch a level by its 1-based number, or `undefined` if out of range. */
export function getLevel(gameId: GameId, level: number): LevelDef | undefined {
  return LEVELS[gameId][level - 1];
}
