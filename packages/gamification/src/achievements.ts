/**
 * Stickers — lightweight, collectable rewards. Pure: given the result of a
 * round plus the stickers already owned, {@link newlyEarned} returns the ids
 * earned *this* round so the UI can celebrate them.
 */
import type { RoundResult } from '@kids/game-core';
import type { Stars } from './scoring.js';

export interface Sticker {
  id: string;
  emoji: string;
  label: string;
}

export const STICKERS: readonly Sticker[] = [
  { id: 'first-win', emoji: '🎉', label: 'First Win' },
  { id: 'three-star', emoji: '⭐', label: 'Three Stars' },
  { id: 'perfect-memory', emoji: '🧠', label: 'Perfect Memory' },
  { id: 'super-simon', emoji: '🎵', label: 'Super Simon' },
  { id: 'speedy-keys', emoji: '⌨️', label: 'Speedy Keys' },
  { id: 'word-wizard', emoji: '📝', label: 'Word Wizard' },
];

export function stickerById(id: string): Sticker | undefined {
  return STICKERS.find((s) => s.id === id);
}

/** Sticker ids newly unlocked by this round (excludes ones already owned). */
export function newlyEarned(
  owned: readonly string[],
  result: RoundResult,
  stars: Stars,
): string[] {
  const has = new Set(owned);
  const earned: string[] = [];
  const award = (id: string) => {
    if (!has.has(id)) earned.push(id);
  };

  if (result.won) award('first-win');
  if (stars === 3) award('three-star');
  if (result.won && stars === 3) {
    if (result.gameId === 'memory-match') award('perfect-memory');
    if (result.gameId === 'simon') award('super-simon');
    if (result.gameId === 'keyboard') award('speedy-keys');
    if (result.gameId === 'word-typing') award('word-wizard');
  }
  return earned;
}
