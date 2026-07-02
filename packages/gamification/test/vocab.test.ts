import { describe, expect, it } from 'vitest';
import {
  VOCAB,
  VOCAB_BY_CATEGORY,
  VOCAB_CATEGORIES,
  typeableWords,
  vocabByCategory,
} from '../src/vocab.js';

describe('vocab data store', () => {
  it('exposes every declared category, each non-empty', () => {
    for (const c of VOCAB_CATEGORIES) {
      expect(vocabByCategory(c.id).length, `${c.id} should have items`).toBeGreaterThan(0);
    }
  });

  it('tags every item with its own category', () => {
    for (const c of VOCAB_CATEGORIES) {
      for (const item of VOCAB_BY_CATEGORY[c.id]) {
        expect(item.category).toBe(c.id);
      }
    }
  });

  it('has a unique word within each category', () => {
    for (const c of VOCAB_CATEGORIES) {
      const words = VOCAB_BY_CATEGORY[c.id].map((i) => i.word);
      expect(new Set(words).size, `duplicate word in ${c.id}`).toBe(words.length);
    }
  });

  it('gives every item an uppercase word and an emoji', () => {
    for (const item of VOCAB) {
      expect(item.word).toBe(item.word.toUpperCase());
      expect(item.word.length).toBeGreaterThan(0);
      expect(item.emoji.length).toBeGreaterThan(0);
    }
  });

  it('flattens to the sum of all categories', () => {
    const total = VOCAB_CATEGORIES.reduce((n, c) => n + VOCAB_BY_CATEGORY[c.id].length, 0);
    expect(VOCAB.length).toBe(total);
  });

  it('typeableWords keeps only single A–Z words (no spaces/digits)', () => {
    const typeable = typeableWords();
    expect(typeable.length).toBeGreaterThan(0);
    for (const item of typeable) expect(item.word).toMatch(/^[A-Z]+$/);
    // Multi-word / digit names are excluded.
    expect(typeable.some((i) => i.word === 'ICE CREAM')).toBe(false);
    expect(typeable.some((i) => i.word === 'PS5 CONTROLLER')).toBe(false);
  });
});
