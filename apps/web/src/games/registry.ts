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

export interface CategoryMeta {
  id: GameCategory;
  label: string;
  emoji: string;
}

/** Display order + heading for each category on the home screen. */
export const CATEGORIES: readonly CategoryMeta[] = [
  { id: 'Memory', label: 'Memory', emoji: '🧠' },
  { id: 'Typing', label: 'Typing', emoji: '⌨️' },
  { id: 'Speaking', label: 'Speaking', emoji: '🗣️' },
  { id: 'Conversation', label: 'Talking', emoji: '💬' },
  { id: 'Aptitude', label: 'Thinking', emoji: '🧩' },
  { id: 'Analytic', label: 'Puzzles', emoji: '🔍' },
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
];

export function gameMeta(id: string | undefined): GameMeta | undefined {
  return GAMES.find((g) => g.id === id);
}

/** Games in a category, in registry order. */
export function gamesByCategory(category: GameCategory): GameMeta[] {
  return GAMES.filter((g) => g.category === category);
}
