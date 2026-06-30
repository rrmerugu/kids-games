import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { cn } from '@invana/ui';
import { AppShell, StarRating } from '@kids/ui';
import { NavIcons } from '../components/NavIcons.js';
import { isUnlocked, levelCount } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import { gameMeta } from '../games/registry.js';

export function LevelMapScreen(): React.JSX.Element {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const meta = gameMeta(gameId);
  const best = useProgress((s) => (meta ? (s.bestStars[meta.id] ?? {}) : {}));

  if (!meta) return <Navigate to="/" replace />;
  const count = levelCount(meta.id);

  return (
    <AppShell
      header={
        <>
          <h1 className="text-2xl font-extrabold">
            {meta.emoji} {meta.label}
          </h1>
          <NavIcons />
        </>
      }
    >
      <div className="mx-auto grid h-full max-w-2xl content-center grid-cols-3 gap-5 p-6 sm:grid-cols-4">
        {Array.from({ length: count }, (_, i) => {
          const level = i + 1;
          const unlocked = isUnlocked(level, best);
          const stars = best[level] ?? 0;
          return (
            <button
              key={level}
              type="button"
              disabled={!unlocked}
              onClick={() => navigate(`/play/${meta.id}/${level}`)}
              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl text-3xl font-extrabold shadow-md transition',
                unlocked
                  ? 'bg-white text-indigo-600 hover:scale-105 active:scale-95 dark:bg-slate-700 dark:text-indigo-200'
                  : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600',
              )}
            >
              {unlocked ? (
                <>
                  <span>{level}</span>
                  <StarRating value={stars} size="sm" />
                </>
              ) : (
                '🔒'
              )}
            </button>
          );
        })}
      </div>
    </AppShell>
  );
}
