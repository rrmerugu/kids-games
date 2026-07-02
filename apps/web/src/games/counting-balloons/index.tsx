import { useCallback, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Badge } from '@invana/ui';
import { AppShell, GameHud, GameLayout, ResultDialog, Stopwatch, useFeedback } from '@kids/ui';
import { NavIcons } from '../../components/NavIcons.js';
import { HomeButton } from '../../components/HomeButton.js';
import { GameAnalyticsButton } from '../../components/GameAnalyticsButton.js';
import {
  GameCanvas,
  type GameBoard,
  createFloatField,
  type FloatField,
  type FloatSpriteInit,
  playError,
  playSuccess,
  playWin,
  speakYay,
  speakPhrase,
  stopSpeech,
} from '@kids/game-engine';
import {
  createCountingState,
  currentNumber,
  popCountBalloon,
  mulberry32,
  pick,
  type CountingState,
  type Rng,
  type RoundResult,
} from '@kids/game-core';
import { getLevel, nextLevel, type CountingBalloonsLevel } from '@kids/gamification';
import { useProgress } from '@kids/storage';

interface Result {
  won: boolean;
  stars: number;
  durationMs: number;
  newStickers: string[];
}

const BALLOON_FILLS = [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308, 0xa855f7, 0xf97316, 0xec4899];

export function CountingBalloonsScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = getLevel('counting-balloons', level) as CountingBalloonsLevel | undefined;
  const settings = useProgress((s) => s.settings);
  const { feedback, system, child, win, help, clear, summary } = useFeedback();

  const total = (def?.count ?? 0) * (def?.rounds ?? 1);

  const [result, setResult] = useState<Result | null>(null);
  const [hud, setHud] = useState({ next: 1, total });
  const [roundNonce, setRoundNonce] = useState(0);

  const stateRef = useRef<CountingState | null>(null);
  const fieldRef = useRef<FloatField | null>(null);
  const rngRef = useRef<Rng>(() => 0);
  const targetRef = useRef('1');
  const startRef = useRef(0);
  const hintsRef = useRef(0);
  const restartRef = useRef<() => void>(() => {});
  const helpRef = useRef<() => void>(() => {});

  const handleReady = useCallback(
    (board: GameBoard) => {
      if (!def) return;
      const pool = Array.from({ length: def.count }, (_, i) => String(i + 1));

      const makeSprite = (value: string): FloatSpriteInit => ({
        value,
        glyph: { char: value, color: 0xffffff, sizeRatio: 0.5 },
        fill: pick(BALLOON_FILLS, rngRef.current),
      });

      const distractor = (target: string): string => {
        if (pool.length <= 1) return target;
        let v = pick(pool, rngRef.current);
        while (v === target) v = pick(pool, rngRef.current);
        return v;
      };

      const announce = (n: number): void => {
        system('show', String(n)); // 🤖 called the next number
        if (useProgress.getState().settings.sound) speakPhrase(`Pop ${n}`);
      };

      const finish = (): void => {
        const s = stateRef.current!;
        const round: RoundResult = {
          gameId: 'counting-balloons',
          level,
          won: true,
          durationMs: performance.now() - startRef.current,
          metrics: { misses: s.misses, targets: total, hints: hintsRef.current },
          actions: summary(),
        };
        const { sound } = useProgress.getState().settings;
        const outcome = useProgress.getState().recordRound(round);
        win();
        if (sound) playWin();
        setResult({
          won: true,
          stars: outcome.stars,
          durationMs: round.durationMs,
          newStickers: outcome.newStickers,
        });
      };

      const handlePop = (id: string, value: string): void => {
        const s = stateRef.current;
        if (!s || s.phase !== 'input') return;
        const out = popCountBalloon(s, value);
        stateRef.current = out.state;
        const { sound } = useProgress.getState().settings;

        if (out.kind === 'miss') {
          child('tap', 'bad', value); // 🧒 popped out of order
          if (sound) playError();
          fieldRef.current?.shakeMiss(id);
          return;
        }

        child('tap', 'good', value); // 🧒 popped the next number
        if (sound) {
          playSuccess();
          speakYay();
        }
        fieldRef.current?.pop(id);

        if (out.kind === 'won') {
          window.setTimeout(finish, 400);
          return;
        }
        const nextN = currentNumber(out.state)!;
        targetRef.current = String(nextN);
        fieldRef.current?.clearValue(value); // clear any stray duplicate just counted
        fieldRef.current?.ensureValue(String(nextN), () => makeSprite(String(nextN)));
        setHud((h) => ({ ...h, next: nextN }));
        announce(nextN);
      };

      const setup = (): void => {
        clear();
        hintsRef.current = 0;
        useProgress.getState().markGameStarted();
        const seed = (Date.now() ^ (level * 0x85ebca77)) >>> 0;
        const rng = mulberry32(seed);
        rngRef.current = rng;
        const state = createCountingState({ count: def.count, rounds: def.rounds });
        stateRef.current = state;
        startRef.current = performance.now();
        targetRef.current = '1';

        fieldRef.current?.stop();
        board.clear();
        const field = createFloatField(board, {
          direction: 'up',
          speedPxPerSec: 44,
          population: def.onScreen,
          reducedMotion: settings.reducedMotion,
          rng,
          refill: (self) => {
            const t = targetRef.current;
            const present = self.values().some((v) => v.value === t);
            return makeSprite(present ? distractor(t) : t);
          },
        });
        fieldRef.current = field;
        field.onPop(handlePop);
        field.start();

        setHud({ next: 1, total });
        announce(1);
      };

      restartRef.current = () => {
        setResult(null);
        setRoundNonce((n) => n + 1);
        setup();
      };

      helpRef.current = () => {
        help();
        hintsRef.current += 1;
        fieldRef.current?.hintValue(targetRef.current);
        if (useProgress.getState().settings.sound) speakPhrase(`Pop ${targetRef.current}`);
      };

      setup();
      return () => {
        fieldRef.current?.stop();
        stopSpeech();
      };
    },
    [def, level, total, settings.reducedMotion, system, child, win, help, summary, clear],
  );

  if (!def) return <Navigate to="/" replace />;
  const next = nextLevel('counting-balloons', level);

  return (
    <AppShell>
      <GameLayout
        side={settings.buddyPosition}
        feedback={feedback}
        reducedMotion={settings.reducedMotion}
        onHelp={() => helpRef.current()}
        idleMessage="Pop the numbers in order! 🔢"
        hud={
          <GameHud
            gameName="🔢 Counting"
            title={`Level ${level}`}
            onBack={() => navigate('/play/counting-balloons')}
            onRestart={() => restartRef.current()}
            analytics={<GameAnalyticsButton gameId="counting-balloons" />}
            home={<HomeButton />}
            nav={<NavIcons hideHome />}
          >
            <Badge variant="secondary" className="px-3 py-1.5 text-2xl shadow">
              {hud.next}
            </Badge>
            <Stopwatch resetSignal={roundNonce} />
          </GameHud>
        }
      >
        <GameCanvas onReady={handleReady} />
      </GameLayout>
      <ResultDialog
        open={result !== null}
        won={result?.won ?? false}
        stars={result?.stars ?? 0}
        durationMs={result?.durationMs}
        newStickers={result?.newStickers ?? []}
        onPlayAgain={() => restartRef.current()}
        onNext={next ? () => navigate(`/play/counting-balloons/${next}`) : undefined}
        onHome={() => navigate('/')}
        analytics={<GameAnalyticsButton gameId="counting-balloons" />}
        reducedMotion={settings.reducedMotion}
      />
    </AppShell>
  );
}
