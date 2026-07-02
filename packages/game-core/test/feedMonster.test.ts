import { describe, it, expect } from 'vitest';
import { createFeedMonsterState, currentCategory, feed, mulberry32 } from '../src/index.js';

const categories = ['FRUIT', 'VEGGIE'];

describe('feedMonster', () => {
  it('builds a queue of called categories of the requested length', () => {
    const s = createFeedMonsterState({ categories, targets: 6 }, mulberry32(2));
    expect(s.queue).toHaveLength(6);
    expect(s.queue.every((c) => categories.includes(c))).toBe(true);
  });

  it('advances on the right category and wins at the end', () => {
    let s = createFeedMonsterState({ categories, targets: 3 }, mulberry32(8));
    for (let i = 0; i < 3; i++) {
      const o = feed(s, currentCategory(s)!);
      s = o.state;
      expect(o.kind).toBe(i === 2 ? 'won' : 'hit');
    }
    expect(s.phase).toBe('won');
    expect(s.hits).toBe(3);
  });

  it('counts a wrong-category feed as a miss', () => {
    const s = createFeedMonsterState({ categories, targets: 2 }, mulberry32(5));
    const wrong = categories.find((c) => c !== currentCategory(s))!;
    const o = feed(s, wrong);
    expect(o.kind).toBe('miss');
    expect(o.state.misses).toBe(1);
    expect(o.state.index).toBe(0);
  });
});
