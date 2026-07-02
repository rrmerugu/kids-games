import { describe, it, expect } from 'vitest';
import { createBalloonPopState, currentBalloon, popBalloon, mulberry32 } from '../src/index.js';

const pool = ['A', 'B', 'C', 'D'];

describe('balloonPop', () => {
  it('builds a queue of the requested length from the pool', () => {
    const s = createBalloonPopState({ pool, targets: 5 }, mulberry32(1));
    expect(s.queue).toHaveLength(5);
    expect(s.queue.every((c) => pool.includes(c))).toBe(true);
  });

  it('advances on a correct pop and wins at the end', () => {
    let s = createBalloonPopState({ pool, targets: 3 }, mulberry32(7));
    for (let i = 0; i < 3; i++) {
      const o = popBalloon(s, currentBalloon(s)!);
      s = o.state;
      expect(o.kind).toBe(i === 2 ? 'won' : 'hit');
    }
    expect(s.phase).toBe('won');
    expect(s.hits).toBe(3);
    expect(s.misses).toBe(0);
  });

  it('counts a wrong pop as a miss without advancing', () => {
    const s = createBalloonPopState({ pool, targets: 2 }, mulberry32(4));
    const wrong = pool.find((c) => c !== currentBalloon(s))!;
    const o = popBalloon(s, wrong);
    expect(o.kind).toBe('miss');
    expect(o.state.misses).toBe(1);
    expect(o.state.index).toBe(0);
  });
});
