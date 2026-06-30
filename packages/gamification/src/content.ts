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

/**
 * Word lists the Word Typing game draws from, easiest → hardest. All uppercase
 * A–Z (no spaces or punctuation, so every character is one keypress). Chosen to
 * be concrete, picture-able nouns a 5–10 year-old already says aloud.
 */
export const WORDS_EASY = [
  'CAT', 'DOG', 'SUN', 'HAT', 'BUS', 'COW', 'PIG', 'BED',
  'CUP', 'BOX', 'FOX', 'EGG', 'BEE', 'CAR', 'PEN', 'BAG',
] as const;
export const WORDS_MID = [
  'FISH', 'BIRD', 'FROG', 'DUCK', 'CAKE', 'MILK', 'BALL', 'TREE',
  'STAR', 'MOON', 'BOOK', 'SHOE', 'HAND', 'DOOR', 'RAIN', 'BOAT',
] as const;
export const WORDS_HARD = [
  'APPLE', 'TIGER', 'HORSE', 'TRAIN', 'HOUSE', 'GRASS', 'CLOUD', 'PLANT',
  'SNAKE', 'BREAD', 'CHAIR', 'SMILE', 'BEACH', 'MOUSE', 'ROBOT', 'HONEY',
] as const;
