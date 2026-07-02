import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { AppShell, GameTile } from '@kids/ui';
import { ScreenHeader } from '../components/ScreenHeader.js';
import { levelCount, totalStars } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import { CATEGORIES, gamesByCategory, type GameCategory } from '../games/registry.js';

const SELECTED_KEY = 'kids-games:home-categories';

/** Only categories that actually have games — no dead toggles in the list. */
const PLAYABLE = CATEGORIES.filter((c) => gamesByCategory(c.id).length > 0);

function loadSelected(): Set<GameCategory> {
  const all = new Set(PLAYABLE.map((c) => c.id));
  if (typeof localStorage === 'undefined') return all;
  const saved = localStorage.getItem(SELECTED_KEY);
  if (saved === null) return all; // first visit → show everything
  const ids = saved
    .split(',')
    .filter((id): id is GameCategory => PLAYABLE.some((c) => c.id === id));
  return new Set(ids);
}

/** One clickable checkbox row in the category filter list. */
function CheckRow({
  checked,
  onToggle,
  emoji,
  label,
  count,
}: {
  checked: boolean;
  onToggle: () => void;
  emoji: string;
  label: string;
  count?: number;
}): React.JSX.Element {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-800/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-5 w-5 shrink-0 accent-indigo-500"
      />
      <span aria-hidden className="text-xl">
        {emoji}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-xs font-semibold text-slate-400">{count}</span>
      )}
    </label>
  );
}

export function HomeScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const bestStars = useProgress((s) => s.bestStars);
  const [selected, setSelected] = useState<Set<GameCategory>>(loadSelected);

  const persist = (next: Set<GameCategory>): void => {
    setSelected(next);
    try {
      localStorage.setItem(SELECTED_KEY, [...next].join(','));
    } catch {
      // Ignore storage failures (private mode / quota) — selection still works this session.
    }
  };

  const toggle = (id: GameCategory): void => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persist(next);
  };

  const allOn = selected.size === PLAYABLE.length;
  const toggleAll = (): void =>
    persist(allOn ? new Set() : new Set(PLAYABLE.map((c) => c.id)));

  const visible = PLAYABLE.filter((c) => selected.has(c.id));

  return (
    <AppShell
      header={
        <ScreenHeader
          isHome
          title="Kids Games 🧠"
          subtitle="Self-hosted games for kids with analytics for parents."
        />
      }
      footer={
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
          <p className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
            <span>
              Privacy first — your child's progress stays in this browser and is never
              sent to a server. Export it anytime to move to another device.
            </span>
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <a
              className="font-semibold underline decoration-dotted underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
              href="https://github.com/rrmerugu/kids-games"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <span aria-hidden>·</span>
            <a
              className="font-semibold underline decoration-dotted underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
              href="https://github.com/rrmerugu/kids-games/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
            >
              MIT License
            </a>
            <span aria-hidden>·</span>
            <a
              className="font-semibold underline decoration-dotted underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
              href="https://github.com/rrmerugu/kids-games/blob/main/build-your-game.md"
              target="_blank"
              rel="noreferrer"
            >
              Build your game
            </a>
          </nav>
        </div>
      }
    >
      <div className="flex h-full">
        {/* Left: category filter as a checkbox list. */}
        <aside className="flex w-44 shrink-0 flex-col gap-1 overflow-y-auto border-r border-slate-200/70 p-3 dark:border-slate-700/60 sm:w-60 sm:p-4">
          <h3 className="px-3 pb-1 text-xs font-extrabold uppercase tracking-wide text-slate-400">
            Categories
          </h3>
          <CheckRow checked={allOn} onToggle={toggleAll} emoji="✨" label="All games" />
          <div className="my-1 h-px bg-slate-200/70 dark:bg-slate-700/60" />
          {PLAYABLE.map((c) => (
            <CheckRow
              key={c.id}
              checked={selected.has(c.id)}
              onToggle={() => toggle(c.id)}
              emoji={c.emoji}
              label={c.label}
              count={gamesByCategory(c.id).length}
            />
          ))}
        </aside>

        {/* Right: browse games for the selected categories. */}
        <div className="h-full flex-1 overflow-y-auto p-5 sm:p-6">
          {visible.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
              <span className="text-5xl" aria-hidden>
                🎈
              </span>
              <p className="text-base font-bold">Pick a category on the left to see games.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {visible.map((cat) => {
                const games = gamesByCategory(cat.id);
                return (
                  <section key={cat.id} className="flex flex-col gap-3">
                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-600 dark:text-slate-300">
                      <span aria-hidden className="text-2xl">
                        {cat.emoji}
                      </span>
                      {cat.label}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {games.map((g) => {
                        const best = bestStars[g.id] ?? {};
                        const max = 3 * levelCount(g.id);
                        const progress = max ? (totalStars(best) / max) * 100 : 0;
                        return (
                          <GameTile
                            key={g.id}
                            emoji={g.emoji}
                            label={g.label}
                            color={g.color}
                            progress={progress}
                            onClick={() => navigate(`/play/${g.id}`)}
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
