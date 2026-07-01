import { describe, it, expect } from 'vitest';
import { computeActionStats, type SessionRecord } from '../src/index.js';

function session(actions: SessionRecord['actions']): SessionRecord {
  return {
    id: 1,
    gameId: 'simon',
    level: 1,
    won: true,
    durationMs: 1000,
    retries: 0,
    hints: 0,
    stars: 3,
    at: 0,
    actions,
  };
}

describe('computeActionStats', () => {
  it('merges action tallies across sessions and derives accuracy + avg time', () => {
    const sessions: SessionRecord[] = [
      session([{ type: 'tap', correct: 3, wrong: 1, reactionMsTotal: 4000, reactionCount: 4 }]),
      session([{ type: 'tap', correct: 1, wrong: 0, reactionMsTotal: 1000, reactionCount: 1 }]),
    ];
    const [tap] = computeActionStats(sessions);
    expect(tap).toBeDefined();
    expect(tap!.type).toBe('tap');
    expect(tap!.correct).toBe(4);
    expect(tap!.wrong).toBe(1);
    expect(tap!.total).toBe(5);
    expect(tap!.accuracy).toBeCloseTo(4 / 5);
    expect(tap!.avgMs).toBe(1000); // (4000+1000) / (4+1)
  });

  it('sorts action types by how many responses they have', () => {
    const sessions = [
      session([
        { type: 'tap', correct: 1, wrong: 0, reactionMsTotal: 0, reactionCount: 0 },
        { type: 'type', correct: 5, wrong: 2, reactionMsTotal: 0, reactionCount: 0 },
      ]),
    ];
    const stats = computeActionStats(sessions);
    expect(stats.map((s) => s.type)).toEqual(['type', 'tap']);
  });

  it('ignores sessions with no action data', () => {
    expect(computeActionStats([session(undefined)])).toEqual([]);
  });

  it('reports zero avg time when nothing was measured', () => {
    const [stat] = computeActionStats([
      session([{ type: 'pair', correct: 2, wrong: 1, reactionMsTotal: 0, reactionCount: 0 }]),
    ]);
    expect(stat!.avgMs).toBe(0);
  });
});
