/** Shared game content (picture pools, letter sets, pad palette). */

/** Emoji picture pool for Memory Match. Length ≥ the largest level's pairs. */
export const ANIMAL_FACES = [
  '🐶', '🐱', '🐰', '🦊', '🐼', '🐸', '🐵', '🦁',
  '🐯', '🐮', '🐷', '🐔', '🐧', '🐢', '🐙', '🦄',
] as const;

/** Letter sets the Keyboard Trainer draws from, easiest → fullest. */
export const LETTERS_EASY = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export const LETTERS_MID = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'] as const;
export const LETTERS_FULL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** Simon pad colours (hex, consumed by the engine as `fill`). */
export const SIMON_PAD_COLORS = [0x22c55e, 0xef4444, 0x3b82f6, 0xeab308] as const;
