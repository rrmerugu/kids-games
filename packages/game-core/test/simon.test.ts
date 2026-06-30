import { describe, it, expect } from 'vitest';
import {
  createSimonState,
  extendSequence,
  beginInput,
  pressPad,
  expectedPad,
  mulberry32,
} from '../src/index.js';

describe('simon', () => {
  it('extends the sequence and tracks expected pad', () => {
    let s = createSimonState({ pads: 4, targetLength: 3 });
    s = extendSequence(s, mulberry32(1));
    expect(s.sequence).toHaveLength(1);
    expect(s.phase).toBe('showing');
    s = beginInput(s);
    expect(s.phase).toBe('input');
    expect(expectedPad(s)).toBe(s.sequence[0]);
  });

  it('advances on correct presses and completes a round below target', () => {
    let s = createSimonState({ pads: 4, targetLength: 3 });
    s = beginInput(extendSequence(extendSequence(s, mulberry32(5)), mulberry32(6)));
    expect(s.sequence).toHaveLength(2);

    const o1 = pressPad(s, s.sequence[0]!);
    expect(o1.kind).toBe('correct');
    const o2 = pressPad(o1.state, o1.state.sequence[1]!);
    expect(o2.kind).toBe('round-complete');
  });

  it('wins when the target length is reached', () => {
    let s = createSimonState({ pads: 4, targetLength: 1 });
    s = beginInput(extendSequence(s, mulberry32(2)));
    const o = pressPad(s, s.sequence[0]!);
    expect(o.kind).toBe('won');
    expect(o.state.phase).toBe('won');
  });

  it('loses on a wrong pad', () => {
    let s = createSimonState({ pads: 4, targetLength: 3 });
    s = beginInput(extendSequence(s, mulberry32(2)));
    const wrong = (s.sequence[0]! + 1) % 4;
    const o = pressPad(s, wrong);
    expect(o.kind).toBe('wrong');
    expect(o.state.phase).toBe('lost');
    expect(o.state.mistakes).toBe(1);
  });
});
