/**
 * Level definitions — the difficulty curve for each game. A level's fields are
 * exactly what `@kids/game-core` needs to build a round, so the app can hand a
 * `LevelDef` almost straight into the matching `create*State`.
 *
 * Tuned for a 6-year-old: gentle starts, no time pressure.
 */
import type { ConvPrompt, GameId, MathOp, SpeakItem } from '@kids/game-core';
import {
  ANIMAL_FACES,
  COLORS,
  FEED_ANIMAL_VEHICLE,
  FEED_FRUIT_VEG,
  FEED_LAND_SEA,
  GREETINGS,
  LETTERS_EASY,
  LETTERS_FULL,
  LETTERS_MID,
  NUMBERS_1_10,
  SAY_IT_EASY,
  SAY_IT_HARD,
  SAY_IT_MID,
  WORDS_EASY,
  WORDS_HARD,
  WORDS_MID,
  type ColorDef,
  type FeedItem,
} from './content.js';

export interface MemoryMatchLevel {
  kind: 'memory-match';
  pairs: number;
  faces: readonly string[];
}
export interface SimonLevel {
  kind: 'simon';
  pads: number;
  targetLength: number;
}
export interface KeyboardLevel {
  kind: 'keyboard';
  targets: number;
  alphabet: readonly string[];
}
export interface WordTypingLevel {
  kind: 'word-typing';
  /** How many words to clear the round. */
  targets: number;
  words: readonly string[];
}
export interface SayItLevel {
  kind: 'say-it';
  /** How many picture-words to clear the round. */
  targets: number;
  items: readonly SpeakItem[];
}
export interface SayHelloLevel {
  kind: 'say-hello';
  /** How many conversation turns to clear the round. */
  targets: number;
  prompts: readonly ConvPrompt[];
}
/** Balloon Pop — float symbols up; tap the called letter/number. */
export interface BalloonPopLevel {
  kind: 'balloon-pop';
  targets: number;
  /** How many balloons float at once. */
  onScreen: number;
  pool: readonly string[];
}
/** Color Splash — pop all balloons of the called colour. */
export interface ColorSplashLevel {
  kind: 'color-splash';
  targets: number;
  perColor: number;
  onScreen: number;
  colors: readonly ColorDef[];
}
/** Counting Balloons — pop numbers in order 1→count, `rounds` times. */
export interface CountingBalloonsLevel {
  kind: 'counting-balloons';
  count: number;
  rounds: number;
  onScreen: number;
}
/** Feed the Monster — tap items belonging to the called category. */
export interface FeedMonsterLevel {
  kind: 'feed-monster';
  targets: number;
  onScreen: number;
  items: readonly FeedItem[];
}
/** Bubble Math — pop the bubble showing the answer to a sum. */
export interface BubbleMathLevel {
  kind: 'bubble-math';
  targets: number;
  maxOperand: number;
  ops: readonly MathOp[];
  onScreen: number;
}
/** Falling Letters — catch drifting letters by key or tap. */
export interface FallingLettersLevel {
  kind: 'falling-letters';
  targets: number;
  onScreen: number;
  /** Drift speed in world px/second. */
  speed: number;
  pool: readonly string[];
}

export type LevelDef =
  | MemoryMatchLevel
  | SimonLevel
  | KeyboardLevel
  | WordTypingLevel
  | SayItLevel
  | SayHelloLevel
  | BalloonPopLevel
  | ColorSplashLevel
  | CountingBalloonsLevel
  | FeedMonsterLevel
  | BubbleMathLevel
  | FallingLettersLevel;

/** How many levels every game offers. Kids grow into a long, gentle ladder. */
export const LEVELS_PER_GAME = 50;

/**
 * Ramp a numeric difficulty knob across {@link LEVELS_PER_GAME} levels: start at
 * `from`, step up by 1 every `every` levels, and never exceed `to` (the curve
 * plateaus at its cap for the hardest levels). `every` is chosen so the cap is
 * reached near the last level, keeping the slope gentle for a 5–10 year-old.
 * Each level still shuffles fresh content, so same-knob levels play differently.
 */
function ramp(from: number, to: number): number[] {
  const every = Math.max(1, Math.floor((LEVELS_PER_GAME - 1) / (to - from)));
  return Array.from({ length: LEVELS_PER_GAME }, (_, i) =>
    Math.min(from + Math.floor(i / every), to),
  );
}

/**
 * Pick one of three content tiers by level index: first third → `easy`, middle
 * third → `mid`, last third → `hard`. Content difficulty rises alongside the
 * numeric knobs.
 */
function tier<T>(i: number, easy: T, mid: T, hard: T): T {
  const f = i / LEVELS_PER_GAME;
  return f < 1 / 3 ? easy : f < 2 / 3 ? mid : hard;
}

// Secondary curves for the arcade family, aligned by level index with the
// primary `ramp()` used in each entry below.
const BALLOON_ON_SCREEN = ramp(3, 6);
const SPLASH_ON_SCREEN = ramp(4, 8);
const SPLASH_PER_COLOR = ramp(2, 4);
const COUNT_ON_SCREEN = ramp(4, 8);
const COUNT_ROUNDS = ramp(1, 3);
const FEED_ON_SCREEN = ramp(4, 7);
const MATH_ON_SCREEN = ramp(4, 6);
const FALLING_ON_SCREEN = ramp(3, 6);
const FALLING_SPEED = ramp(40, 80);

/** All levels per game, in order. Index 0 = level 1. */
export const LEVELS: Record<GameId, readonly LevelDef[]> = {
  'memory-match': ramp(2, 18).map(
    (pairs): MemoryMatchLevel => ({ kind: 'memory-match', pairs, faces: ANIMAL_FACES }),
  ),
  simon: ramp(2, 18).map(
    (targetLength): SimonLevel => ({ kind: 'simon', pads: 4, targetLength }),
  ),
  keyboard: ramp(5, 18).map(
    (targets, i): KeyboardLevel => ({
      kind: 'keyboard',
      targets,
      alphabet: tier<readonly string[]>(i, LETTERS_EASY, LETTERS_MID, LETTERS_FULL),
    }),
  ),
  'word-typing': ramp(3, 12).map(
    (targets, i): WordTypingLevel => ({
      kind: 'word-typing',
      targets,
      words: tier<readonly string[]>(i, WORDS_EASY, WORDS_MID, WORDS_HARD),
    }),
  ),
  'say-it': ramp(3, 12).map(
    (targets, i): SayItLevel => ({
      kind: 'say-it',
      targets,
      items: tier<readonly SpeakItem[]>(i, SAY_IT_EASY, SAY_IT_MID, SAY_IT_HARD),
    }),
  ),
  'say-hello': ramp(3, 12).map(
    (targets): SayHelloLevel => ({ kind: 'say-hello', targets, prompts: GREETINGS }),
  ),
  'balloon-pop': ramp(5, 15).map(
    (targets, i): BalloonPopLevel => ({
      kind: 'balloon-pop',
      targets,
      onScreen: BALLOON_ON_SCREEN[i]!,
      pool: tier<readonly string[]>(i, LETTERS_EASY, LETTERS_MID, NUMBERS_1_10),
    }),
  ),
  'color-splash': ramp(3, 8).map(
    (targets, i): ColorSplashLevel => ({
      kind: 'color-splash',
      targets,
      perColor: SPLASH_PER_COLOR[i]!,
      onScreen: SPLASH_ON_SCREEN[i]!,
      colors: tier<readonly ColorDef[]>(i, COLORS.slice(0, 3), COLORS.slice(0, 4), COLORS),
    }),
  ),
  'counting-balloons': ramp(5, 20).map(
    (count, i): CountingBalloonsLevel => ({
      kind: 'counting-balloons',
      count,
      rounds: COUNT_ROUNDS[i]!,
      onScreen: COUNT_ON_SCREEN[i]!,
    }),
  ),
  'feed-monster': ramp(4, 10).map(
    (targets, i): FeedMonsterLevel => ({
      kind: 'feed-monster',
      targets,
      onScreen: FEED_ON_SCREEN[i]!,
      items: tier<readonly FeedItem[]>(i, FEED_FRUIT_VEG, FEED_LAND_SEA, FEED_ANIMAL_VEHICLE),
    }),
  ),
  'bubble-math': ramp(4, 12).map(
    (targets, i): BubbleMathLevel => ({
      kind: 'bubble-math',
      targets,
      maxOperand: tier(i, 5, 10, 20),
      ops: tier<readonly MathOp[]>(i, ['+'], ['+'], ['+', '-']),
      onScreen: MATH_ON_SCREEN[i]!,
    }),
  ),
  'falling-letters': ramp(5, 15).map(
    (targets, i): FallingLettersLevel => ({
      kind: 'falling-letters',
      targets,
      onScreen: FALLING_ON_SCREEN[i]!,
      speed: FALLING_SPEED[i]!,
      pool: tier<readonly string[]>(i, LETTERS_EASY, LETTERS_MID, LETTERS_FULL),
    }),
  ),
};

/** Number of levels a game has. */
export function levelCount(gameId: GameId): number {
  return LEVELS[gameId].length;
}

/** Fetch a level by its 1-based number, or `undefined` if out of range. */
export function getLevel(gameId: GameId, level: number): LevelDef | undefined {
  return LEVELS[gameId][level - 1];
}
