import { describe, it, expect } from 'vitest';
import {
  createWordTypingState,
  currentWord,
  currentLetter,
  typeLetter,
  mulberry32,
  type WordTypingState,
} from '../src/index.js';

const words = ['CAT', 'DOG', 'SUN'];

/** Type every letter of the current word correctly, returning the final outcome. */
function typeWord(state: WordTypingState) {
  let s = state;
  let out = typeLetter(s, currentLetter(s)!);
  s = out.state;
  while (out.kind === 'hit') {
    out = typeLetter(s, currentLetter(s)!);
    s = out.state;
  }
  return out;
}

describe('wordTyping', () => {
  it('picks the requested number of words, all from the pool and uppercased', () => {
    const s = createWordTypingState({ words, targets: 4 }, mulberry32(1));
    expect(s.words).toHaveLength(4);
    expect(s.words.every((w) => words.includes(w))).toBe(true);
    expect(currentWord(s)).toBe(s.words[0]);
  });

  it('normalizes lowercase keys to match uppercase letters', () => {
    const s = createWordTypingState({ words: ['CAT'], targets: 1 }, mulberry32(2));
    const out = typeLetter(s, 'c');
    expect(out.kind).toBe('hit');
    expect(out.state.letterIndex).toBe(1);
    expect(out.state.hits).toBe(1);
  });

  it('advances to the next word when a word is finished', () => {
    const s = createWordTypingState({ words: ['CAT', 'DOG'], targets: 2 }, mulberry32(3));
    const out = typeWord(s);
    expect(out.kind).toBe('word');
    expect(out.state.wordIndex).toBe(1);
    expect(out.state.letterIndex).toBe(0);
    expect(currentWord(out.state)).toBe(s.words[1]);
  });

  it('wins after the last word and counts every letter as a hit', () => {
    const cfg = { words: ['CAT', 'DOG'], targets: 2 };
    let s = createWordTypingState(cfg, mulberry32(5));
    const totalLetters = s.words.join('').length;

    let out = typeWord(s);
    expect(out.kind).toBe('word');
    s = out.state;
    out = typeWord(s);

    expect(out.kind).toBe('won');
    expect(out.state.phase).toBe('won');
    expect(out.state.hits).toBe(totalLetters);
    expect(out.state.misses).toBe(0);
    expect(currentLetter(out.state)).toBeUndefined();
  });

  it('counts a wrong key as a miss without advancing the cursor', () => {
    const s = createWordTypingState({ words: ['CAT'], targets: 1 }, mulberry32(7));
    const wrong = currentLetter(s) === 'Z' ? 'X' : 'Z';
    const out = typeLetter(s, wrong);
    expect(out.kind).toBe('miss');
    expect(out.state.misses).toBe(1);
    expect(out.state.letterIndex).toBe(0);
  });

  it('ignores presses once the round is won', () => {
    let s = createWordTypingState({ words: ['HI'], targets: 1 }, mulberry32(9));
    s = typeWord(s).state;
    expect(s.phase).toBe('won');
    const out = typeLetter(s, 'H');
    expect(out.kind).toBe('miss');
    expect(out.state).toBe(s);
  });
});
