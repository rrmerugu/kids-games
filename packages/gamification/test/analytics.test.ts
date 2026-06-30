import { describe, it, expect } from 'vitest';
import { computeStats, formatDuration, type SessionRecord } from '../src/index.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000;

function s(over: Partial<SessionRecord>): SessionRecord {
  return {
    id: Math.random(),
    gameId: 'memory-match',
    level: 1,
    won: true,
    durationMs: 10_000,
    retries: 1,
    hints: 0,
    stars: 3,
    at: NOW,
    ...over,
  };
}

describe('computeStats', () => {
  it('returns zeros for an empty history', () => {
    const st = computeStats([], NOW);
    expect(st.totalGames).toBe(0);
    expect(st.winRate).toBe(0);
    expect(st.last7Days).toHaveLength(7);
  });

  it('aggregates totals, win rate and per-game breakdown', () => {
    const st = computeStats(
      [
        s({ durationMs: 10_000, retries: 2, won: true, stars: 3 }),
        s({ durationMs: 20_000, retries: 0, won: false, stars: 1 }),
        s({ gameId: 'simon', durationMs: 30_000, retries: 1, won: true, stars: 2 }),
      ],
      NOW,
    );
    expect(st.totalGames).toBe(3);
    expect(st.wins).toBe(2);
    expect(st.winRate).toBeCloseTo(2 / 3);
    expect(st.totalTimeMs).toBe(60_000);
    expect(st.avgTimeMs).toBe(20_000);
    expect(st.totalRetries).toBe(3);
    expect(st.maxRetries).toBe(2);
    expect(st.totalStars).toBe(6);
    expect(st.abandoned).toBe(0);

    const match = st.perGame.find((g) => g.gameId === 'memory-match')!;
    expect(match.games).toBe(2);
    expect(match.wins).toBe(1);
    expect(match.avgTimeMs).toBe(15_000);
  });

  it('counts abandoned (started but not finished) and total hints', () => {
    const st = computeStats([s({ hints: 2 }), s({ hints: 1 })], NOW, 5);
    expect(st.started).toBe(5);
    expect(st.totalGames).toBe(2);
    expect(st.abandoned).toBe(3);
    expect(st.totalHints).toBe(3);
  });

  it('buckets sessions into the last 7 days and drops older ones', () => {
    const st = computeStats(
      [
        s({ at: NOW, durationMs: 5_000 }),
        s({ at: NOW - 2 * DAY, durationMs: 7_000 }),
        s({ at: NOW - 30 * DAY, durationMs: 9_000 }), // older than 7 days
      ],
      NOW,
    );
    expect(st.last7Days).toHaveLength(7);
    const todays = st.last7Days[6]!;
    expect(todays.games).toBe(1);
    expect(todays.timeMs).toBe(5_000);
    const total7 = st.last7Days.reduce((a, d) => a + d.games, 0);
    expect(total7).toBe(2); // the 30-day-old one is excluded
  });
});

describe('formatDuration', () => {
  it('formats seconds, minutes and hours', () => {
    expect(formatDuration(45_000)).toBe('45s');
    expect(formatDuration(200_000)).toBe('3m 20s');
    expect(formatDuration(3_900_000)).toBe('1h 5m');
  });
});
