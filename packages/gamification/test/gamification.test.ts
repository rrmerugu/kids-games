import { describe, it, expect } from 'vitest';
import type { RoundResult } from '@kids/game-core';
import {
  starsFor,
  isUnlocked,
  nextLevel,
  highestUnlocked,
  totalStars,
  newlyEarned,
  levelCount,
} from '../src/index.js';

function result(over: Partial<RoundResult>): RoundResult {
  return {
    gameId: 'memory-match',
    level: 1,
    won: true,
    durationMs: 1000,
    metrics: {},
    ...over,
  };
}

describe('scoring', () => {
  it('gives 3 stars for a flawless memory round and 1 for a sloppy one', () => {
    expect(starsFor(result({ metrics: { mismatches: 0, pairs: 4 } }))).toBe(3);
    expect(starsFor(result({ metrics: { mismatches: 2, pairs: 4 } }))).toBe(2);
    expect(starsFor(result({ metrics: { mismatches: 9, pairs: 4 } }))).toBe(1);
  });

  it('always gives at least 1 star to a loss', () => {
    expect(starsFor(result({ won: false, metrics: { mismatches: 0, pairs: 4 } }))).toBe(1);
  });

  it('scores simon by replays and keyboard by misses', () => {
    expect(starsFor(result({ gameId: 'simon', metrics: { replays: 0 } }))).toBe(3);
    expect(starsFor(result({ gameId: 'simon', metrics: { replays: 1 } }))).toBe(2);
    expect(
      starsFor(result({ gameId: 'keyboard', metrics: { misses: 0, targets: 8 } })),
    ).toBe(3);
    expect(
      starsFor(result({ gameId: 'keyboard', metrics: { misses: 8, targets: 8 } })),
    ).toBe(1);
  });
});

describe('progression', () => {
  it('unlocks level 1 always and gates later levels behind a star', () => {
    expect(isUnlocked(1, {})).toBe(true);
    expect(isUnlocked(2, {})).toBe(false);
    expect(isUnlocked(2, { 1: 1 })).toBe(true);
  });

  it('computes next/highest/total', () => {
    expect(nextLevel('memory-match', 1)).toBe(2);
    expect(nextLevel('memory-match', levelCount('memory-match'))).toBeNull();
    expect(highestUnlocked('memory-match', { 1: 3, 2: 1 })).toBe(3);
    expect(totalStars({ 1: 3, 2: 2 })).toBe(5);
  });
});

describe('achievements', () => {
  it('awards first-win and three-star once', () => {
    const earned = newlyEarned([], result({ metrics: { mismatches: 0, pairs: 4 } }), 3);
    expect(earned).toContain('first-win');
    expect(earned).toContain('three-star');
    expect(earned).toContain('perfect-memory');
    // Already owned → not re-earned.
    expect(newlyEarned(earned, result({ metrics: { mismatches: 0, pairs: 4 } }), 3)).toEqual([]);
  });
});
