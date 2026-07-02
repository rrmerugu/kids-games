import { describe, it, expect } from 'vitest';
import { createColorSplashState, currentColor, popColor, mulberry32 } from '../src/index.js';

const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

describe('colorSplash', () => {
  it('never calls the same colour twice in a row', () => {
    const s = createColorSplashState({ colors, targets: 8, perColor: 2 }, mulberry32(3));
    for (let i = 1; i < s.queue.length; i++) {
      expect(s.queue[i]).not.toBe(s.queue[i - 1]);
    }
  });

  it('pops `perColor` of a colour before it clears, then wins on the last', () => {
    let s = createColorSplashState({ colors, targets: 2, perColor: 2 }, mulberry32(9));
    const first = currentColor(s)!;
    let o = popColor(s, first);
    expect(o.kind).toBe('hit');
    expect(o.state.remaining).toBe(1);
    o = popColor(o.state, first);
    expect(o.kind).toBe('cleared');
    const second = currentColor(o.state)!;
    o = popColor(o.state, second);
    expect(o.kind).toBe('hit');
    o = popColor(o.state, second);
    expect(o.kind).toBe('won');
    expect(o.state.phase).toBe('won');
    expect(o.state.misses).toBe(0);
  });

  it('counts a wrong colour as a miss without reducing remaining', () => {
    const s = createColorSplashState({ colors, targets: 2, perColor: 2 }, mulberry32(1));
    const wrong = colors.find((c) => c !== currentColor(s))!;
    const o = popColor(s, wrong);
    expect(o.kind).toBe('miss');
    expect(o.state.misses).toBe(1);
    expect(o.state.remaining).toBe(2);
  });
});
