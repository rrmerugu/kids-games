import { describe, it, expect } from 'vitest';
import {
  createMemoryMatchState,
  flipCard,
  resolveMismatch,
  isWon,
  mulberry32,
} from '../src/index.js';

const faces = ['🐶', '🐱', '🐰', '🦊', '🐼', '🐸', '🐵', '🦁'];

describe('memoryMatch', () => {
  it('builds a deck with each face exactly twice', () => {
    const s = createMemoryMatchState({ pairs: 4, faces }, mulberry32(1));
    expect(s.cards).toHaveLength(8);
    const counts = new Map<string, number>();
    for (const c of s.cards) counts.set(c.face, (counts.get(c.face) ?? 0) + 1);
    expect([...counts.values()].every((n) => n === 2)).toBe(true);
    expect(counts.size).toBe(4);
  });

  it('is deterministic for a given seed', () => {
    const a = createMemoryMatchState({ pairs: 4, faces }, mulberry32(42));
    const b = createMemoryMatchState({ pairs: 4, faces }, mulberry32(42));
    expect(a.cards.map((c) => c.id + c.face)).toEqual(
      b.cards.map((c) => c.id + c.face),
    );
  });

  it('matches a pair and ignores extra flips while two are up', () => {
    let s = createMemoryMatchState({ pairs: 4, faces }, mulberry32(7));
    // Find two cards with the same face.
    const first = s.cards[0]!;
    const twin = s.cards.find((c) => c.face === first.face && c.id !== first.id)!;

    let o = flipCard(s, first.id);
    expect(o.kind).toBe('flip');
    s = o.state;

    // A third flip is allowed (only one is up), but flipping the twin matches.
    o = flipCard(s, twin.id);
    expect(o.kind).toBe('match');
    s = o.state;
    expect(s.matchedPairs).toBe(1);
    expect(s.moves).toBe(1);
    expect(s.flipped).toHaveLength(0);
    expect(s.cards.filter((c) => c.matched)).toHaveLength(2);
  });

  it('records a mismatch and clears via resolveMismatch', () => {
    let s = createMemoryMatchState({ pairs: 4, faces }, mulberry32(3));
    const a = s.cards[0]!;
    const b = s.cards.find((c) => c.face !== a.face)!;

    s = flipCard(s, a.id).state;
    const o = flipCard(s, b.id);
    expect(o.kind).toBe('mismatch');
    s = o.state;
    expect(s.mismatches).toBe(1);
    expect(s.flipped).toHaveLength(2);

    // While two are up, more flips are ignored.
    const c = s.cards.find((x) => x.id !== a.id && x.id !== b.id)!;
    expect(flipCard(s, c.id).kind).toBe('ignored');

    s = resolveMismatch(s);
    expect(s.flipped).toHaveLength(0);
  });

  it('reports won once every pair is matched', () => {
    let s = createMemoryMatchState({ pairs: 2, faces }, mulberry32(9));
    const byFace = new Map<string, string[]>();
    for (const c of s.cards) {
      byFace.set(c.face, [...(byFace.get(c.face) ?? []), c.id]);
    }
    for (const [, ids] of byFace) {
      s = flipCard(s, ids[0]!).state;
      s = flipCard(s, ids[1]!).state;
    }
    expect(isWon(s)).toBe(true);
    expect(s.matchedPairs).toBe(2);
  });
});
