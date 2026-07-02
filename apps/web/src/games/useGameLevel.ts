import { useMemo } from 'react';
import type { GameId } from '@kids/game-core';
import { getLevel, scaleLevelForDuration, type LevelDef } from '@kids/gamification';
import { useProgress } from '@kids/storage';

/**
 * The level a game should play — its designed difficulty stretched to the round
 * length the player picked in Settings (more time → more questions). Memoized on
 * the game, level and chosen length so the returned object is stable across
 * renders (game screens depend on `def` identity in their `onReady` callbacks).
 */
export function useGameLevel(gameId: GameId, level: number): LevelDef | undefined {
  const seconds = useProgress((s) => s.settings.gameLengthSec);
  return useMemo(() => {
    const base = getLevel(gameId, level);
    return base ? scaleLevelForDuration(base, seconds) : undefined;
  }, [gameId, level, seconds]);
}
