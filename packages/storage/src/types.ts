import type { GameId } from '@kids/game-core';
import type { BestStars, SessionRecord } from '@kids/gamification';

/** A local, login-free player. Avatar is an emoji. */
export interface Profile {
  name: string;
  avatar: string;
}

/** Which side the Buddy assistant panel sits on, or `off` to hide it. */
export type BuddyPosition = 'right' | 'left' | 'off';

/** Colour theme. `system` follows the OS preference. */
export type ThemeMode = 'light' | 'dark' | 'system';

export interface GameSettings {
  sound: boolean;
  /** Skip the canvas animations (flip/pulse/shake) for motion-sensitive kids. */
  reducedMotion: boolean;
  /** Colour palette — `colorblind` swaps in higher-contrast hues. */
  palette: 'classic' | 'colorblind';
  /** Which side the Buddy assistant sits on. */
  buddyPosition: BuddyPosition;
  /** Light / dark / follow-system theme. */
  theme: ThemeMode;
}

/** The persisted shape (version 1). */
export interface ProgressData {
  profile: Profile | null;
  settings: GameSettings;
  /** Best stars per game, keyed by 1-based level number. */
  bestStars: Record<GameId, BestStars>;
  /** Owned sticker ids. */
  stickers: string[];
  /** Per-round history powering the parent analytics dashboard. */
  sessions: SessionRecord[];
  /** Count of rounds started (vs. `sessions.length` finished) → abandoned. */
  gamesStarted: number;
}

export const DEFAULT_PROGRESS: ProgressData = {
  profile: null,
  settings: {
    sound: true,
    reducedMotion: false,
    palette: 'classic',
    buddyPosition: 'right',
    theme: 'system',
  },
  bestStars: { 'memory-match': {}, simon: {}, keyboard: {} },
  stickers: [],
  sessions: [],
  gamesStarted: 0,
};
