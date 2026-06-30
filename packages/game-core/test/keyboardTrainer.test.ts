import { describe, it, expect } from 'vitest';
import {
  createKeyboardState,
  currentTarget,
  pressKey,
  normalizeKey,
  mulberry32,
} from '../src/index.js';

const alphabet = ['A', 'B', 'C', 'D'];

describe('keyboardTrainer', () => {
  it('builds a queue of the requested length', () => {
    const s = createKeyboardState({ alphabet, targets: 5 }, mulberry32(1));
    expect(s.queue).toHaveLength(5);
    expect(s.queue.every((c) => alphabet.includes(c))).toBe(true);
  });

  it('normalizes single keys to uppercase but leaves named keys alone', () => {
    expect(normalizeKey('a')).toBe('A');
    expect(normalizeKey('Z')).toBe('Z');
    expect(normalizeKey('Enter')).toBe('Enter');
  });

  it('counts hits and wins at the end', () => {
    let s = createKeyboardState({ alphabet, targets: 3 }, mulberry32(11));
    for (let i = 0; i < s.queue.length; i++) {
      const target = currentTarget(s)!;
      const o = pressKey(s, target.toLowerCase());
      s = o.state;
      expect(o.kind).toBe(i === s.queue.length - 1 ? 'won' : 'hit');
    }
    expect(s.phase).toBe('won');
    expect(s.hits).toBe(3);
    expect(s.misses).toBe(0);
  });

  it('counts misses without advancing', () => {
    const s = createKeyboardState({ alphabet, targets: 2 }, mulberry32(4));
    const target = currentTarget(s)!;
    const wrong = alphabet.find((c) => c !== target)!;
    const o = pressKey(s, wrong);
    expect(o.kind).toBe('miss');
    expect(o.state.misses).toBe(1);
    expect(o.state.index).toBe(0);
  });
});
