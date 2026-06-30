import { useNavigate } from 'react-router-dom';
import { AppShell, GameTile } from '@kids/ui';
import { GlossyIconButton } from '../components/GlossyIconButton.js';
import { levelCount, totalStars } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import { GAMES } from '../games/registry.js';
import { useResolvedTheme } from '../theme.js';

export function HomeScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const bestStars = useProgress((s) => s.bestStars);
  const sound = useProgress((s) => s.settings.sound);
  const setSetting = useProgress((s) => s.setSetting);
  const resolvedTheme = useResolvedTheme();

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
          <div className="flex gap-2">
            <GlossyIconButton label="Toggle sound" onClick={() => setSetting('sound', !sound)}>
              {sound ? '🔊' : '🔈'}
            </GlossyIconButton>
            <GlossyIconButton
              label="Toggle theme"
              onClick={() => setSetting('theme', resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {resolvedTheme === 'dark' ? '☀️' : '🌙'}
            </GlossyIconButton>
            <GlossyIconButton label="Parent dashboard" onClick={() => navigate('/parent')}>
              📊
            </GlossyIconButton>
            <GlossyIconButton label="Settings" onClick={() => navigate('/settings')}>
              ⚙️
            </GlossyIconButton>
          </div>
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
        </header>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {GAMES.map((g) => {
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
      </div>
    </AppShell>
  );
}
