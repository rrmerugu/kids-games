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
  createBalloonPopState,
  currentBalloon,
  popBalloon,
  mulberry32,
  pick,
  type BalloonPopState,
  type Rng,
  type RoundResult,
} from '@kids/game-core';
import { nextLevel, type BalloonPopLevel } from '@kids/gamification';
import { useGameLevel } from '../useGameLevel.js';
import { useProgress } from '@kids/storage';

interface Result {
  won: boolean;
  stars: number;
  durationMs: number;
  newStickers: string[];
}

/** Cheerful balloon fills; the symbol is drawn white on top. */
const BALLOON_FILLS = [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308, 0xa855f7, 0xf97316, 0xec4899];

export function BalloonPopScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = useGameLevel('balloon-pop', level) as BalloonPopLevel | undefined;
  const settings = useProgress((s) => s.settings);
  const { feedback, system, child, win, help, clear, summary } = useFeedback();

  const [result, setResult] = useState<Result | null>(null);
  const [hud, setHud] = useState({ index: 0, targets: def?.targets ?? 0, target: '' });
  const [roundNonce, setRoundNonce] = useState(0);

  const stateRef = useRef<BalloonPopState | null>(null);
  const fieldRef = useRef<FloatField | null>(null);
  const rngRef = useRef<Rng>(() => 0);
  const targetRef = useRef('');
  const startRef = useRef(0);
  const hintsRef = useRef(0);
  const restartRef = useRef<() => void>(() => {});
  const helpRef = useRef<() => void>(() => {});

  const handleReady = useCallback(
    (board: GameBoard) => {
      if (!def) return;

      const makeSprite = (value: string): FloatSpriteInit => ({
        value,
        glyph: { char: value, color: 0xffffff, sizeRatio: 0.5 },
        fill: pick(BALLOON_FILLS, rngRef.current),
      });

      const distractor = (target: string): string => {
        if (def.pool.length <= 1) return target;
        let v = pick(def.pool, rngRef.current);
        while (v === target) v = pick(def.pool, rngRef.current);
        return v;
      };

      const announce = (target: string): void => {
        system('show', target); // 🤖 called the symbol to pop
        if (useProgress.getState().settings.sound) speakPhrase(`Pop the ${target}`);
      };

      const finish = (): void => {
        const s = stateRef.current!;
        const round: RoundResult = {
          gameId: 'balloon-pop',
          level,
          won: true,
          durationMs: performance.now() - startRef.current,
          metrics: { misses: s.misses, targets: def.targets, hints: hintsRef.current },
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
        const out = popBalloon(s, value);
        stateRef.current = out.state;
        const { sound } = useProgress.getState().settings;

        if (out.kind === 'miss') {
          child('tap', 'bad', value); // 🧒 popped the wrong balloon
          if (sound) playError();
          fieldRef.current?.shakeMiss(id);
          return;
        }

        child('tap', 'good', value); // 🧒 popped the right balloon
        if (sound) {
          playSuccess();
          speakYay();
        }
        setHud((h) => ({ ...h, index: out.state.index }));

        if (out.kind === 'won') {
          fieldRef.current?.pop(id);
          window.setTimeout(finish, 400);
          return;
        }
        const nextTarget = currentBalloon(out.state)!;
        targetRef.current = nextTarget;
        fieldRef.current?.pop(id);
        fieldRef.current?.ensureValue(nextTarget, () => makeSprite(nextTarget));
        setHud((h) => ({ ...h, target: nextTarget }));
        announce(nextTarget);
      };

      const setup = (): void => {
        clear();
        hintsRef.current = 0;
        useProgress.getState().markGameStarted();
        const seed = (Date.now() ^ (level * 0xc2b2ae35)) >>> 0;
        const rng = mulberry32(seed);
        rngRef.current = rng;
        const state = createBalloonPopState({ pool: def.pool, targets: def.targets }, rng);
        stateRef.current = state;
        startRef.current = performance.now();
        const first = currentBalloon(state)!;
        targetRef.current = first;

        fieldRef.current?.stop();
        board.clear();
        const field = createFloatField(board, {
          direction: 'up',
          speedPxPerSec: 46,
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

        setHud({ index: 0, targets: def.targets, target: first });
        announce(first);
      };

      restartRef.current = () => {
        setResult(null);
        setRoundNonce((n) => n + 1);
        setup();
      };

      // Ask Buddy for help → pulse a correct balloon and say the symbol again.
      helpRef.current = () => {
        help();
        hintsRef.current += 1;
        const target = targetRef.current;
        fieldRef.current?.hintValue(target);
        if (useProgress.getState().settings.sound) speakPhrase(`Pop the ${target}`);
      };

      setup();
      return () => {
        fieldRef.current?.stop();
        stopSpeech();
      };
    },
    [def, level, settings.reducedMotion, system, child, win, help, summary, clear],
  );

  if (!def) return <Navigate to="/" replace />;
  const next = nextLevel('balloon-pop', level);

  return (
    <AppShell>
      <GameLayout
        side={settings.buddyPosition}
        feedback={feedback}
        reducedMotion={settings.reducedMotion}
        onHelp={() => helpRef.current()}
        idleMessage="Pop the one I call! 🎈"
        hud={
          <GameHud
            gameName="🎈 Balloons"
            title={`Level ${level}`}
            onBack={() => navigate('/play/balloon-pop')}
            onRestart={() => restartRef.current()}
            analytics={<GameAnalyticsButton gameId="balloon-pop" />}
            home={<HomeButton />}
            nav={<NavIcons hideHome />}
          >
            <Badge variant="secondary" className="px-3 py-1.5 text-2xl shadow">
              {hud.target}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
              {hud.index}/{hud.targets}
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
        onNext={next ? () => navigate(`/play/balloon-pop/${next}`) : undefined}
        onHome={() => navigate('/')}
        analytics={<GameAnalyticsButton gameId="balloon-pop" />}
        reducedMotion={settings.reducedMotion}
      />
    </AppShell>
  );
}
