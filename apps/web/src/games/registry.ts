import type { GameId } from '@kids/game-core';

/**
 * Skill categories a game trains. Each game belongs to exactly one; the home
 * screen groups tiles under these headings. See `game-principles.md` for the
 * reasoning behind the four cognitive skills plus Speaking and Conversation.
 */
export type GameCategory =
  | 'Memory'
  | 'Typing'
  | 'Speaking'
  | 'Conversation'
  | 'Aptitude'
  | 'Analytic';

/**
 * The broad intent behind a category, used for the home-page filter:
 * - `learning` — acquiring a skill/content (letters, words, talking).
 * - `focus` — training attention, memory and reasoning ("improve focus").
 */
export type FocusGroup = 'learning' | 'focus';

export interface CategoryMeta {
  id: GameCategory;
  label: string;
  emoji: string;
  focus: FocusGroup;
}

/** Display order + heading for each category on the home screen. */
export const CATEGORIES: readonly CategoryMeta[] = [
  { id: 'Memory', label: 'Memory', emoji: '🧠', focus: 'focus' },
  { id: 'Typing', label: 'Typing', emoji: '⌨️', focus: 'learning' },
  { id: 'Speaking', label: 'Speaking', emoji: '🗣️', focus: 'learning' },
  { id: 'Conversation', label: 'Talking', emoji: '💬', focus: 'learning' },
  { id: 'Aptitude', label: 'Thinking', emoji: '🧩', focus: 'focus' },
  { id: 'Analytic', label: 'Puzzles', emoji: '🔍', focus: 'focus' },
];

/** The home-page filter chips. `all` shows every category. */
export type HomeFilter = FocusGroup | 'all';

export interface FilterMeta {
  id: HomeFilter;
  label: string;
  emoji: string;
}

export const HOME_FILTERS: readonly FilterMeta[] = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'focus', label: 'Improve Focus', emoji: '🎯' },
];

export interface GameMeta {
  id: GameId;
  label: string;
  emoji: string;
  category: GameCategory;
  /** Tailwind background class for the home tile. */
  color: string;
}

export const GAMES: readonly GameMeta[] = [
  { id: 'memory-match', label: 'Match', emoji: '🐶', category: 'Memory', color: 'bg-rose-400' },
  { id: 'simon', label: 'Colors', emoji: '🎵', category: 'Memory', color: 'bg-emerald-400' },
  { id: 'keyboard', label: 'Letters', emoji: '⌨️', category: 'Typing', color: 'bg-sky-400' },
  { id: 'word-typing', label: 'Words', emoji: '📝', category: 'Typing', color: 'bg-violet-400' },
  { id: 'say-it', label: 'Say It', emoji: '🗣️', category: 'Speaking', color: 'bg-amber-400' },
  { id: 'say-hello', label: 'Say Hello', emoji: '👋', category: 'Conversation', color: 'bg-teal-400' },
  { id: 'balloon-pop', label: 'Balloons', emoji: '🎈', category: 'Aptitude', color: 'bg-fuchsia-400' },
  { id: 'color-splash', label: 'Splash', emoji: '🎨', category: 'Aptitude', color: 'bg-pink-400' },
  { id: 'counting-balloons', label: 'Counting', emoji: '🔢', category: 'Analytic', color: 'bg-cyan-400' },
  { id: 'feed-monster', label: 'Feed', emoji: '🐲', category: 'Analytic', color: 'bg-lime-400' },
  { id: 'bubble-math', label: 'Math', emoji: '➕', category: 'Analytic', color: 'bg-indigo-400' },
  { id: 'falling-letters', label: 'Catch', emoji: '🪂', category: 'Typing', color: 'bg-orange-400' },
];

export function gameMeta(id: string | undefined): GameMeta | undefined {
  return GAMES.find((g) => g.id === id);
}

/** Games in a category, in registry order. */
export function gamesByCategory(category: GameCategory): GameMeta[] {
  return GAMES.filter((g) => g.category === category);
}
