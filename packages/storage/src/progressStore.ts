/**
 * Progress store — a zustand store persisted to `localStorage` (no login). It
 * holds the local profile, settings, best-stars-per-level and owned stickers,
 * and exposes {@link ProgressStore.recordRound} as the single write path after
 * a round: it scores stars, updates the best, and grants any new stickers.
 *
 * SSR/test-safe: zustand's `persist` no-ops when no storage is available.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameId, RoundResult } from '@kids/game-core';
import { newlyEarned, starsFor, type Stars } from '@kids/gamification';
import type { BestStars } from '@kids/gamification';
import {
  DEFAULT_PROGRESS,
  GAME_LENGTH_DEFAULT_SEC,
  GAME_LENGTH_MAX_SEC,
  GAME_LENGTH_MIN_SEC,
  type BuddyPosition,
  type GameSettings,
  type Profile,
  type ProgressData,
  type ThemeMode,
} from './types.js';

const BUDDY_POSITIONS: readonly BuddyPosition[] = ['right', 'left', 'off'];
const THEMES: readonly ThemeMode[] = ['light', 'dark', 'system'];

export interface RecordOutcome {
  stars: Stars;
  newStickers: string[];
}

export interface ProgressStore extends ProgressData {
  setProfile: (profile: Profile) => void;
  setSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  bestFor: (gameId: GameId) => BestStars;
  /** Mark that a round has begun (for abandoned-game tracking). */
  markGameStarted: () => void;
  /** Record a finished round; returns the stars earned and any new stickers. */
  recordRound: (result: RoundResult) => RecordOutcome;
  /** Clear the analytics session history (parent action). */
  clearSessions: () => void;
  reset: () => void;
}

/** Wrong attempts across games (hints are tracked separately). */
function retriesOf(metrics: Record<string, number>): number {
  return (metrics.mismatches ?? 0) + (metrics.misses ?? 0) + (metrics.mistakes ?? 0);
}

const MAX_SESSIONS = 1000;

export const PROGRESS_STORAGE_KEY = 'kids-games:v1';

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PROGRESS,

      setProfile: (profile) => set({ profile }),

      setSetting: (key, value) =>
        set((s) => ({ settings: { ...s.settings, [key]: value } })),

      bestFor: (gameId) => get().bestStars[gameId] ?? {},

      markGameStarted: () => set((s) => ({ gamesStarted: s.gamesStarted + 1 })),

      recordRound: (result) => {
        const stars = starsFor(result);
        const state = get();
        const owned = state.stickers;
        const newStickers = newlyEarned(owned, result, stars);

        const gameBest = { ...(state.bestStars[result.gameId] ?? {}) };
        const prev = gameBest[result.level] ?? 0;
        if (stars > prev) gameBest[result.level] = stars;

        const session = {
          id: Date.now(),
          gameId: result.gameId,
          level: result.level,
          won: result.won,
          durationMs: Math.round(result.durationMs),
          retries: retriesOf(result.metrics),
          hints: result.metrics.hints ?? 0,
          stars,
          at: Date.now(),
          ...(result.actions ? { actions: result.actions } : {}),
        };
        const sessions = [...state.sessions, session].slice(-MAX_SESSIONS);

        set({
          bestStars: { ...state.bestStars, [result.gameId]: gameBest },
          stickers: newStickers.length ? [...owned, ...newStickers] : owned,
          sessions,
        });

        return { stars, newStickers };
      },

      clearSessions: () => set({ sessions: [], gamesStarted: 0 }),

      reset: () => set({ ...DEFAULT_PROGRESS }),
    }),
    {
      name: PROGRESS_STORAGE_KEY,
      version: 1,
      /**
       * Deep-merge persisted state over the current defaults so new settings
       * fields (added across versions) get sensible defaults, and sanitize enum
       * values that changed shape (e.g. the old corner-based `buddyPosition`).
       */
      merge: (persisted, current): ProgressStore => {
        const p = (persisted ?? {}) as Partial<ProgressData>;
        const settings: GameSettings = { ...current.settings, ...(p.settings ?? {}) };
        if (!BUDDY_POSITIONS.includes(settings.buddyPosition)) settings.buddyPosition = 'right';
        if (!THEMES.includes(settings.theme)) settings.theme = 'system';
        if (
          typeof settings.gameLengthSec !== 'number' ||
          !Number.isFinite(settings.gameLengthSec)
        ) {
          settings.gameLengthSec = GAME_LENGTH_DEFAULT_SEC;
        } else {
          settings.gameLengthSec = Math.min(
            GAME_LENGTH_MAX_SEC,
            Math.max(GAME_LENGTH_MIN_SEC, Math.round(settings.gameLengthSec)),
          );
        }
        return {
          ...current,
          ...p,
          settings,
          bestStars: { ...current.bestStars, ...(p.bestStars ?? {}) },
        };
      },
    },
  ),
);
