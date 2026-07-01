import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { BarChart3, X } from 'lucide-react';
import type { GameId } from '@kids/game-core';
import { actionLabel, computeActionStats, computeStats, formatDuration } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import { IconButton } from './IconButton.js';
import { gameMeta } from '../games/registry.js';

function Stat({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-2xl bg-white/10 p-3 text-center ring-1 ring-white/15">
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="text-xs text-white/70">{label}</div>
    </div>
  );
}

/**
 * Per-game analytics for the game HUD: a BarChart icon that opens a transparent,
 * blurred glass overlay showing how the kid is doing in *this* game only (plays,
 * wins, speed, tries, stars + a 7-day bar). Filters the recorded sessions to this
 * `gameId` and reuses {@link computeStats}. Closes on backdrop tap, ✕, or Escape.
 * (The full cross-game parent dashboard lives behind Settings.)
 */
export function GameAnalyticsButton({ gameId }: { gameId: GameId }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const sessions = useProgress((s) => s.sessions);
  const meta = gameMeta(gameId);

  const mine = useMemo(() => sessions.filter((s) => s.gameId === gameId), [sessions, gameId]);
  const stats = useMemo(() => computeStats(mine, Date.now()), [mine]);
  const actionStats = useMemo(() => computeActionStats(mine), [mine]);
  const maxDayMs = Math.max(1, ...stats.last7Days.map((d) => d.timeMs));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <IconButton icon={BarChart3} label="Game stats" tone="violet" onClick={() => setOpen(true)} />

      {open &&
        createPortal(
        <div
          className="pointer-events-auto fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div
            className="dark max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/15 bg-slate-900/95 p-6 text-white shadow-2xl backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-2xl font-extrabold">
                {meta ? `${meta.emoji} ${meta.label}` : 'Game'} stats 📊
              </h2>
              <IconButton icon={X} label="Close" tone="slate" onClick={() => setOpen(false)} />
            </div>

            {stats.totalGames === 0 ? (
              <p className="py-8 text-center text-white/70">
                No rounds yet — play to see your stats! 🎮
              </p>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-2">
                  <Stat label="played" value={`${stats.totalGames}`} />
                  <Stat label="wins" value={`${stats.wins}`} />
                  <Stat label="win rate" value={`${Math.round(stats.winRate * 100)}%`} />
                  <Stat label="avg time" value={formatDuration(stats.avgTimeMs)} />
                  <Stat label="tries" value={`${stats.totalRetries}`} />
                  <Stat label="stars" value={`⭐${stats.totalStars}`} />
                </div>

                {actionStats.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-white/60">
                      By action
                    </div>
                    {actionStats.map((a) => {
                      const { icon, label } = actionLabel(a.type);
                      return (
                        <div
                          key={a.type}
                          className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10"
                        >
                          <span className="text-xl" aria-hidden>{icon}</span>
                          <span className="w-20 shrink-0 text-sm font-semibold">{label}</span>
                          <span className="font-extrabold text-emerald-300">
                            ✅ {Math.round(a.accuracy * 100)}%
                          </span>
                          {a.avgMs > 0 && (
                            <span className="ml-auto text-sm text-white/70">
                              ⚡ {(a.avgMs / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    Last 7 days
                  </div>
                  {stats.last7Days.map((d) => (
                    <div key={d.date} className="flex items-center gap-2">
                      <span className="w-12 shrink-0 text-[11px] text-white/60">{d.date.slice(5)}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                          style={{ width: `${(d.timeMs / maxDayMs) * 100}%` }}
                        />
                      </div>
                      <span className="w-12 shrink-0 text-right text-[11px] text-white/60">
                        {formatDuration(d.timeMs)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
