import type { GameId } from '@kids/game-core';

export interface GameMeta {
  id: GameId;
  label: string;
  emoji: string;
  /** Tailwind background class for the home tile. */
  color: string;
}

export const GAMES: readonly GameMeta[] = [
  { id: 'memory-match', label: 'Match', emoji: '🐶', color: 'bg-rose-400' },
  { id: 'simon', label: 'Colors', emoji: '🎵', color: 'bg-emerald-400' },
  { id: 'keyboard', label: 'Letters', emoji: '⌨️', color: 'bg-sky-400' },
  { id: 'word-typing', label: 'Words', emoji: '📝', color: 'bg-violet-400' },
];

export function gameMeta(id: string | undefined): GameMeta | undefined {
  return GAMES.find((g) => g.id === id);
}
