/**
 * Level progression — open-access friendly: level 1 is always playable and the
 * next level unlocks as soon as the previous one is cleared with ≥1 star. Every
 * unlocked level stays replayable (kids love re-winning).
 */
import type { GameId } from '@kids/game-core';
import { levelCount } from './levels.js';

/** Best stars earned per level number (1-based). Missing = not yet cleared. */
export type BestStars = Record<number, number>;

export function isUnlocked(level: number, best: BestStars): boolean {
  if (level <= 1) return true;
  return (best[level - 1] ?? 0) >= 1;
}

/** The next level number after `level`, or `null` if it was the last. */
export function nextLevel(gameId: GameId, level: number): number | null {
  return level < levelCount(gameId) ? level + 1 : null;
}

/** Highest unlocked level for a game (for "continue" / progress bars). */
export function highestUnlocked(gameId: GameId, best: BestStars): number {
  let level = 1;
  while (level < levelCount(gameId) && isUnlocked(level + 1, best)) level++;
  return level;
}

/** Total stars earned across all levels of a game (max = 3 × levelCount). */
export function totalStars(best: BestStars): number {
  return Object.values(best).reduce((sum, s) => sum + s, 0);
}
