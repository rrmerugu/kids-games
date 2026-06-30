import { useCallback, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Badge } from '@invana/ui';
import { AppShell, GameHud, ResultDialog } from '@kids/ui';
import { GameCanvas, type GameBoard, playHit, playWin, playWrong } from '@kids/game-engine';
import {
  createKeyboardState,
  currentTarget,
  mulberry32,
  pressKey,
  type KeyboardState,
  type RoundResult,
} from '@kids/game-core';
import { getLevel, nextLevel, type KeyboardLevel } from '@kids/gamification';
import { useProgress } from '@kids/storage';

interface Result {
  won: boolean;
  stars: number;
  newStickers: string[];
}

const TARGET_FILL = 0x38bdf8;

export function KeyboardScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = getLevel('keyboard', level) as KeyboardLevel | undefined;

  const [result, setResult] = useState<Result | null>(null);
  const [hud, setHud] = useState({ index: 0, targets: def?.targets ?? 0 });

  const stateRef = useRef<KeyboardState | null>(null);
  const startRef = useRef(0);
  const restartRef = useRef<() => void>(() => {});

  const handleReady = useCallback(
    (board: GameBoard) => {
      if (!def) return;

      const drawTarget = (char: string): void =>
        board.update('target', {
          glyph: { char, color: 0xffffff, sizeRatio: 0.7 },
        });

      const setup = (): void => {
        const seed = (Date.now() ^ (level * 0xc2b2ae35)) >>> 0;
        const state = createKeyboardState(
          { alphabet: def.alphabet, targets: def.targets },
          mulberry32(seed),
        );
        stateRef.current = state;
        startRef.current = performance.now();
        board.clear();
        board.addCircle('target', {
          x: 0,
          y: 0,
          radius: 130,
          fill: TARGET_FILL,
          stroke: { color: 0xffffff, width: 8 },
          glyph: { char: currentTarget(state) ?? '', color: 0xffffff, sizeRatio: 0.7 },
        });
        board.fit(140);
        setHud({ index: 0, targets: def.targets });
      };

      const finish = (): void => {
        const s = stateRef.current!;
        const round: RoundResult = {
          gameId: 'keyboard',
          level,
          won: true,
          durationMs: performance.now() - startRef.current,
          metrics: { misses: s.misses, targets: def.targets },
        };
        const { sound } = useProgress.getState().settings;
        const outcome = useProgress.getState().recordRound(round);
        if (sound) playWin();
        setResult({ won: true, stars: outcome.stars, newStickers: outcome.newStickers });
      };

      const handleKey = (e: KeyboardEvent): void => {
        // Only react to single-character keys (ignore Shift, arrows, etc.).
        if (e.key.length !== 1) return;
        const s = stateRef.current;
        if (!s || s.phase !== 'input') return;
        const out = pressKey(s, e.key);
        stateRef.current = out.state;
        const { sound } = useProgress.getState().settings;

        if (out.kind === 'miss') {
          if (sound) playWrong();
          board.shake('target');
          return;
        }
        if (sound) playHit();
        if (!useProgress.getState().settings.reducedMotion) board.pulse('target');
        setHud((h) => ({ ...h, index: out.state.index }));

        if (out.kind === 'won') {
          drawTarget('🎉');
          window.setTimeout(finish, 350);
        } else {
          drawTarget(currentTarget(out.state) ?? '');
        }
      };

      restartRef.current = () => {
        setResult(null);
        setup();
      };

      setup();
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    },
    [def, level],
  );

  if (!def) return <Navigate to="/" replace />;
  const next = nextLevel('keyboard', level);

  return (
    <AppShell>
      <GameCanvas onReady={handleReady} backgroundColor={0x0c4a6e} />
      <GameHud
        title={`⌨️ Level ${level}`}
        onBack={() => navigate('/play/keyboard')}
        onRestart={() => restartRef.current()}
      >
        <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
          {hud.index}/{hud.targets}
        </Badge>
      </GameHud>
      <ResultDialog
        open={result !== null}
        won={result?.won ?? false}
        stars={result?.stars ?? 0}
        newStickers={result?.newStickers ?? []}
        onPlayAgain={() => restartRef.current()}
        onNext={next ? () => navigate(`/play/keyboard/${next}`) : undefined}
        onHome={() => navigate('/')}
      />
    </AppShell>
  );
}
