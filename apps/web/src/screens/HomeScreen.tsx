import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@invana/ui';
import { AppShell, GameTile } from '@kids/ui';
import { ScreenHeader } from '../components/ScreenHeader.js';
import { levelCount, totalStars } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import { CATEGORIES, gamesByCategory, HOME_FILTERS, type HomeFilter } from '../games/registry.js';

const FILTER_KEY = 'kids-games:home-filter';

function loadFilter(): HomeFilter {
  if (typeof localStorage === 'undefined') return 'all';
  const saved = localStorage.getItem(FILTER_KEY);
  return HOME_FILTERS.some((f) => f.id === saved) ? (saved as HomeFilter) : 'all';
}

export function HomeScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const bestStars = useProgress((s) => s.bestStars);
  const [filter, setFilter] = useState<HomeFilter>(loadFilter);

  const chooseFilter = (id: HomeFilter): void => {
    setFilter(id);
    try {
      localStorage.setItem(FILTER_KEY, id);
    } catch {
      // Ignore storage failures (private mode / quota) — the filter still works this session.
    }
  };

  const visibleCategories = CATEGORIES.filter((c) => filter === 'all' || c.focus === filter);

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
      <div className="relative mx-auto flex h-full max-w-4xl flex-col justify-center gap-8 p-6">
        <header className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl md:text-4xl">
            learn, improve focus and practise
          </h2>
          {/* Focus filter: All / Learning / Improve Focus (persisted). */}
          <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter games">
            {HOME_FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => chooseFilter(f.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold shadow-sm ring-1 transition-transform hover:scale-105 active:scale-95',
                    active
                      ? 'bg-indigo-500 text-white ring-indigo-500'
                      : 'bg-white text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
                  )}
                >
                  <span aria-hidden>{f.emoji}</span>
                  {f.label}
                </button>
              );
            })}
          </div>
        </header>
        {/* Each category is its own column; games stack vertically within it. */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {visibleCategories.map((cat) => {
            const games = gamesByCategory(cat.id);
            if (games.length === 0) return null;
            return (
              <section key={cat.id} className="flex flex-col gap-3">
                <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-600 dark:text-slate-300">
                  <span aria-hidden className="text-xl">{cat.emoji}</span>
                  {cat.label}
                </h3>
                <div className="flex flex-col gap-4">
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
      </div>
    </AppShell>
  );
}
