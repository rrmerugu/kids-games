/**
 * Parent analytics — pure aggregation over recorded game sessions. The store
 * appends a {@link SessionRecord} per finished round (in `@kids/storage`); the
 * dashboard renders {@link computeStats} over them. Kept pure (takes `now`) so
 * the day-bucketing is deterministic and testable.
 */
import type { ActionStat, GameId } from '@kids/game-core';

/** One finished round, persisted for parent stats. */
export interface SessionRecord {
  id: number;
  gameId: GameId;
  level: number;
  won: boolean;
  /** Time spent in the round, milliseconds. */
  durationMs: number;
  /** Wrong attempts (focus proxy). */
  retries: number;
  /** Times the kid asked Buddy for help this round. */
  hints: number;
  stars: number;
  /** Epoch milliseconds when the round finished. */
  at: number;
  /** Per-action-type breakdown captured from Buddy's event timeline. */
  actions?: readonly ActionStat[];
}

/** Aggregated accuracy + speed for one action type, ready to display. */
export interface ActionTypeStat {
  type: string;
  correct: number;
  wrong: number;
  /** correct + wrong. */
  total: number;
  /** 0–1. */
  accuracy: number;
  /** Average response time in ms (0 if never measured). */
  avgMs: number;
}

/** Icon + short label for each known action type (for the analytics popup). */
export const ACTION_LABELS: Record<string, { icon: string; label: string }> = {
  tap: { icon: '🎨', label: 'Colors' },
  type: { icon: '⌨️', label: 'Letters' },
  reply: { icon: '💬', label: 'Replies' },
  say: { icon: '🗣️', label: 'Words' },
  pair: { icon: '🃏', label: 'Pairs' },
};

export function actionLabel(type: string): { icon: string; label: string } {
  return ACTION_LABELS[type] ?? { icon: '•', label: type };
}

/**
 * Merge the per-round {@link ActionStat}s across sessions into per-type
 * accuracy + average response time. Pure; newest order doesn't matter.
 */
export function computeActionStats(sessions: readonly SessionRecord[]): ActionTypeStat[] {
  const map = new Map<string, ActionStat>();
  for (const s of sessions) {
    for (const a of s.actions ?? []) {
      const cur = map.get(a.type) ?? {
        type: a.type,
        correct: 0,
        wrong: 0,
        reactionMsTotal: 0,
        reactionCount: 0,
      };
      cur.correct += a.correct;
      cur.wrong += a.wrong;
      cur.reactionMsTotal += a.reactionMsTotal;
      cur.reactionCount += a.reactionCount;
      map.set(a.type, cur);
    }
  }
  return [...map.values()]
    .map((a): ActionTypeStat => {
      const total = a.correct + a.wrong;
      return {
        type: a.type,
        correct: a.correct,
        wrong: a.wrong,
        total,
        accuracy: total ? a.correct / total : 0,
        avgMs: a.reactionCount ? Math.round(a.reactionMsTotal / a.reactionCount) : 0,
      };
    })
    .sort((x, y) => y.total - x.total);
}

export interface PerGameStat {
  gameId: GameId;
  games: number;
  wins: number;
  timeMs: number;
  avgTimeMs: number;
  retries: number;
}

export interface DayStat {
  /** Local `YYYY-MM-DD`. */
  date: string;
  timeMs: number;
  games: number;
}

export interface ParentStats {
  totalGames: number;
  /** Rounds started (finished + abandoned). */
  started: number;
  /** Rounds started but left before finishing. */
  abandoned: number;
  wins: number;
  /** 0–1. */
  winRate: number;
  totalTimeMs: number;
  avgTimeMs: number;
  totalRetries: number;
  avgRetries: number;
  /** The most retries in any single round. */
  maxRetries: number;
  /** Total hints (help requests) across all rounds. */
  totalHints: number;
  totalStars: number;
  perGame: PerGameStat[];
  /** Oldest → newest, 7 buckets ending today. */
  last7Days: DayStat[];
  /** Newest first, up to 12. */
  recent: SessionRecord[];
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeStats(
  sessions: readonly SessionRecord[],
  now: number,
  started: number = sessions.length,
): ParentStats {
  const totalGames = sessions.length;
  const wins = sessions.filter((s) => s.won).length;
  const totalTimeMs = sessions.reduce((a, s) => a + s.durationMs, 0);
  const totalRetries = sessions.reduce((a, s) => a + s.retries, 0);
  const maxRetries = sessions.reduce((a, s) => Math.max(a, s.retries), 0);
  const totalHints = sessions.reduce((a, s) => a + (s.hints ?? 0), 0);
  const totalStars = sessions.reduce((a, s) => a + s.stars, 0);

  const perGameMap = new Map<GameId, PerGameStat>();
  for (const s of sessions) {
    const g = perGameMap.get(s.gameId) ?? {
      gameId: s.gameId,
      games: 0,
      wins: 0,
      timeMs: 0,
      avgTimeMs: 0,
      retries: 0,
    };
    g.games += 1;
    g.wins += s.won ? 1 : 0;
    g.timeMs += s.durationMs;
    g.retries += s.retries;
    perGameMap.set(s.gameId, g);
  }
  const perGame = [...perGameMap.values()].map((g) => ({
    ...g,
    avgTimeMs: g.games ? Math.round(g.timeMs / g.games) : 0,
  }));

  // 7 day buckets ending today.
  const last7Days: DayStat[] = [];
  for (let i = 6; i >= 0; i--) {
    const key = dayKey(now - i * DAY_MS);
    last7Days.push({ date: key, timeMs: 0, games: 0 });
  }
  const dayIndex = new Map(last7Days.map((d, i) => [d.date, i]));
  for (const s of sessions) {
    const idx = dayIndex.get(dayKey(s.at));
    if (idx !== undefined) {
      last7Days[idx]!.timeMs += s.durationMs;
      last7Days[idx]!.games += 1;
    }
  }

  return {
    totalGames,
    started,
    abandoned: Math.max(0, started - totalGames),
    wins,
    winRate: totalGames ? wins / totalGames : 0,
    totalTimeMs,
    avgTimeMs: totalGames ? Math.round(totalTimeMs / totalGames) : 0,
    totalRetries,
    avgRetries: totalGames ? totalRetries / totalGames : 0,
    maxRetries,
    totalHints,
    totalStars,
    perGame,
    last7Days,
    recent: [...sessions].sort((a, b) => b.at - a.at).slice(0, 12),
  };
}

/** Format milliseconds as a friendly duration, e.g. `1h 5m`, `3m 20s`, `45s`. */
export function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
