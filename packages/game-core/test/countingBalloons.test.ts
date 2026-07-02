import { describe, it, expect } from 'vitest';
import { createCountingState, currentNumber, popCountBalloon } from '../src/index.js';

describe('countingBalloons', () => {
  it('counts 1→N and wins after the last round', () => {
    let s = createCountingState({ count: 3, rounds: 2 });
    const seen: number[] = [];
    let outKind = '';
    for (let step = 0; step < 6; step++) {
      seen.push(currentNumber(s)!);
      const o = popCountBalloon(s, String(currentNumber(s)));
      s = o.state;
      outKind = o.kind;
    }
    expect(seen).toEqual([1, 2, 3, 1, 2, 3]);
    expect(outKind).toBe('won');
    expect(s.phase).toBe('won');
    expect(s.misses).toBe(0);
  });

  it('emits `cleared` when a pass finishes but more remain', () => {
    let s = createCountingState({ count: 2, rounds: 2 });
    s = popCountBalloon(s, '1').state;
    const o = popCountBalloon(s, '2');
    expect(o.kind).toBe('cleared');
    expect(o.state.round).toBe(2);
    expect(o.state.next).toBe(1);
  });

  it('counts an out-of-order pop as a miss', () => {
    const s = createCountingState({ count: 5, rounds: 1 });
    const o = popCountBalloon(s, '3');
    expect(o.kind).toBe('miss');
    expect(o.state.misses).toBe(1);
    expect(o.state.next).toBe(1);
  });
});
