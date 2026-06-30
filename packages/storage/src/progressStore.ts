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
import { DEFAULT_PROGRESS, type GameSettings, type Profile, type ProgressData } from './types.js';

export interface RecordOutcome {
  stars: Stars;
  newStickers: string[];
}

export interface ProgressStore extends ProgressData {
  setProfile: (profile: Profile) => void;
  setSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  bestFor: (gameId: GameId) => BestStars;
  /** Record a finished round; returns the stars earned and any new stickers. */
  recordRound: (result: RoundResult) => RecordOutcome;
  reset: () => void;
}

export const PROGRESS_STORAGE_KEY = 'kids-games:v1';

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PROGRESS,

      setProfile: (profile) => set({ profile }),

      setSetting: (key, value) =>
        set((s) => ({ settings: { ...s.settings, [key]: value } })),

      bestFor: (gameId) => get().bestStars[gameId] ?? {},

      recordRound: (result) => {
        const stars = starsFor(result);
        const state = get();
        const owned = state.stickers;
        const newStickers = newlyEarned(owned, result, stars);

        const gameBest = { ...(state.bestStars[result.gameId] ?? {}) };
        const prev = gameBest[result.level] ?? 0;
        if (stars > prev) gameBest[result.level] = stars;

        set({
          bestStars: { ...state.bestStars, [result.gameId]: gameBest },
          stickers: newStickers.length ? [...owned, ...newStickers] : owned,
        });

        return { stars, newStickers };
      },

      reset: () => set({ ...DEFAULT_PROGRESS }),
    }),
    { name: PROGRESS_STORAGE_KEY, version: 1 },
  ),
);
