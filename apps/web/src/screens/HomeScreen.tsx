import { useNavigate } from 'react-router-dom';
import { Button } from '@invana/ui';
import { AppShell, GameTile } from '@kids/ui';
import { levelCount, totalStars } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import { GAMES } from '../games/registry.js';

export function HomeScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const bestStars = useProgress((s) => s.bestStars);
  const sound = useProgress((s) => s.settings.sound);
  const setSetting = useProgress((s) => s.setSetting);

  return (
    <AppShell
      header={
        <>
          <h1 className="text-2xl font-extrabold">Brain Games 🧠</h1>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="lg"
              className="h-12 w-12 rounded-full p-0 text-2xl"
              aria-label="Toggle sound"
              onClick={() => setSetting('sound', !sound)}
            >
              {sound ? '🔊' : '🔈'}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="h-12 w-12 rounded-full p-0 text-2xl"
              aria-label="Settings"
              onClick={() => navigate('/settings')}
            >
              ⚙️
            </Button>
          </div>
        </>
      }
    >
      <div className="mx-auto grid h-full max-w-3xl grid-cols-1 content-center gap-6 p-6 sm:grid-cols-3">
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
    </AppShell>
  );
}
