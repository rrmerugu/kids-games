import { describe, it, expect } from 'vitest';
import { createBubbleMathState, currentProblem, popBubble, makeProblem, mulberry32 } from '../src/index.js';

describe('bubbleMath', () => {
  it('generates problems within range and with non-negative answers', () => {
    const rng = mulberry32(3);
    for (let i = 0; i < 200; i++) {
      const p = makeProblem({ maxOperand: 10, ops: ['+', '-'], targets: 1 }, rng);
      expect(p.answer).toBeGreaterThanOrEqual(0);
      expect(p.answer).toBeLessThanOrEqual(10);
      expect(p.op === '+' ? p.a + p.b : p.a - p.b).toBe(p.answer);
    }
  });

  it('advances on the correct answer and wins at the end', () => {
    let s = createBubbleMathState({ maxOperand: 10, ops: ['+'], targets: 3 }, mulberry32(6));
    for (let i = 0; i < 3; i++) {
      const answer = currentProblem(s)!.answer;
      const o = popBubble(s, String(answer));
      s = o.state;
      expect(o.kind).toBe(i === 2 ? 'won' : 'hit');
    }
    expect(s.phase).toBe('won');
    expect(s.misses).toBe(0);
  });

  it('counts a wrong answer as a miss without advancing', () => {
    const s = createBubbleMathState({ maxOperand: 10, ops: ['+'], targets: 2 }, mulberry32(1));
    const answer = currentProblem(s)!.answer;
    const o = popBubble(s, String(answer + 1));
    expect(o.kind).toBe('miss');
    expect(o.state.misses).toBe(1);
    expect(o.state.index).toBe(0);
  });
});
