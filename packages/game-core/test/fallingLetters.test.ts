import { describe, it, expect } from 'vitest';
import { createFallingLettersState, registerCatch, registerMiss } from '../src/index.js';

describe('fallingLetters', () => {
  it('catches up to the target then wins', () => {
    let s = createFallingLettersState({ targets: 3 });
    let o = registerCatch(s);
    expect(o.kind).toBe('caught');
    o = registerCatch(o.state);
    expect(o.kind).toBe('caught');
    o = registerCatch(o.state);
    expect(o.kind).toBe('won');
    expect(o.state.phase).toBe('won');
    expect(o.state.caught).toBe(3);
    s = o.state;
    // further catches are ignored once won
    expect(registerCatch(s).state.caught).toBe(3);
  });

  it('counts floor misses without losing the round', () => {
    let s = createFallingLettersState({ targets: 2 });
    s = registerMiss(s);
    s = registerMiss(s);
    expect(s.missed).toBe(2);
    expect(s.phase).toBe('input');
    expect(s.caught).toBe(0);
  });
});
