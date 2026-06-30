import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { AppShell, GameTile } from '@kids/ui';
import { NavIcons } from '../components/NavIcons.js';
import { levelCount, totalStars } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import { CATEGORIES, gamesByCategory } from '../games/registry.js';

export function HomeScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const bestStars = useProgress((s) => s.bestStars);

  return (
    <AppShell
      header={
        <>
          <div className="flex flex-col leading-tight">
            <h1 className="text-2xl font-extrabold">Kids Games 🧠</h1>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              built for kids, and for parents to learn about their kid's abilities
            </span>
          </div>
          <NavIcons />
        </>
      }
      footer={
        <nav className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-slate-500 dark:text-slate-400">
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
      }
    >
      <div className="relative mx-auto flex h-full max-w-3xl flex-col justify-center gap-8 p-6">
        <header className="text-center">
          <h2 className="text-4xl font-extrabold sm:text-2xl">
            Self-hosted games for kids with analytics for parents
          </h2>
          <p className="my-4 text-2xl font-semibold text-slate-500 dark:text-slate-400">
            focus, practise and repeat
          </p>
          <p className="mx-auto mt-2 inline-flex max-w-xl items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-left text-sm font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <ShieldCheck className="h-10 w-10 shrink-0" strokeWidth={2.5} aria-hidden />
            <span>
              Privacy first — your child's progress stays in this browser and is never
              sent to a server. Export it anytime to move to another device.
            </span>
          </p>
        </header>
        {/* Each category is its own column; games stack vertically within it. */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {CATEGORIES.map((cat) => {
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
