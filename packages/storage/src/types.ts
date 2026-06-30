import type { GameId } from '@kids/game-core';
import type { BestStars } from '@kids/gamification';

/** A local, login-free player. Avatar is an emoji. */
export interface Profile {
  name: string;
  avatar: string;
}

export interface GameSettings {
  sound: boolean;
  /** Skip the canvas animations (flip/pulse/shake) for motion-sensitive kids. */
  reducedMotion: boolean;
  /** Colour palette — `colorblind` swaps in higher-contrast hues. */
  palette: 'classic' | 'colorblind';
}

/** The persisted shape (version 1). */
export interface ProgressData {
  profile: Profile | null;
  settings: GameSettings;
  /** Best stars per game, keyed by 1-based level number. */
  bestStars: Record<GameId, BestStars>;
  /** Owned sticker ids. */
  stickers: string[];
}

export const DEFAULT_PROGRESS: ProgressData = {
  profile: null,
  settings: { sound: true, reducedMotion: false, palette: 'classic' },
  bestStars: { 'memory-match': {}, simon: {}, keyboard: {} },
  stickers: [],
};
