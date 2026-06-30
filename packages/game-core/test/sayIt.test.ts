import { describe, it, expect } from 'vitest';
import {
  createSayItState,
  currentItem,
  hearAgain,
  confirmSaid,
  mulberry32,
  type SpeakItem,
} from '../src/index.js';

const items: SpeakItem[] = [
  { word: 'cat', emoji: '🐱' },
  { word: 'dog', emoji: '🐶' },
  { word: 'sun', emoji: '☀️' },
];

describe('sayIt', () => {
  it('picks the requested number of items, all from the pool and uppercased', () => {
    const s = createSayItState({ items, targets: 4 }, mulberry32(1));
    expect(s.items).toHaveLength(4);
    expect(s.items.every((it) => items.some((p) => p.emoji === it.emoji))).toBe(true);
    expect(s.items.every((it) => it.word === it.word.toUpperCase())).toBe(true);
    expect(currentItem(s)).toBe(s.items[0]);
  });

  it('advances to the next item on confirm', () => {
    const s = createSayItState({ items, targets: 3 }, mulberry32(2));
    const out = confirmSaid(s);
    expect(out.kind).toBe('next');
    expect(out.state.index).toBe(1);
    expect(currentItem(out.state)).toBe(s.items[1]);
  });

  it('wins after confirming the last item', () => {
    let s = createSayItState({ items, targets: 2 }, mulberry32(3));
    s = confirmSaid(s).state;
    const out = confirmSaid(s);
    expect(out.kind).toBe('won');
    expect(out.state.phase).toBe('won');
    expect(currentItem(out.state)).toBeUndefined();
  });

  it('counts hear-again requests without advancing', () => {
    const s = createSayItState({ items, targets: 2 }, mulberry32(4));
    const s2 = hearAgain(hearAgain(s));
    expect(s2.repeats).toBe(2);
    expect(s2.index).toBe(0);
  });

  it('ignores actions once the round is won', () => {
    let s = createSayItState({ items: [{ word: 'HI', emoji: '👋' }], targets: 1 }, mulberry32(5));
    s = confirmSaid(s).state;
    expect(s.phase).toBe('won');
    expect(hearAgain(s)).toBe(s);
    const out = confirmSaid(s);
    expect(out.kind).toBe('won');
    expect(out.state).toBe(s);
  });
});
