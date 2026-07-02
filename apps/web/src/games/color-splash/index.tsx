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
  createColorSplashState,
  currentColor,
  popColor,
  mulberry32,
  pick,
  type ColorSplashState,
  type Rng,
  type RoundResult,
} from '@kids/game-core';
import { nextLevel, type ColorSplashLevel } from '@kids/gamification';
import { useGameLevel } from '../useGameLevel.js';
import { useProgress } from '@kids/storage';

interface Result {
  won: boolean;
  stars: number;
  durationMs: number;
  newStickers: string[];
}

export function ColorSplashScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = useGameLevel('color-splash', level) as ColorSplashLevel | undefined;
  const settings = useProgress((s) => s.settings);
  const { feedback, system, child, win, help, clear, summary } = useFeedback();

  const totalPops = (def?.targets ?? 0) * (def?.perColor ?? 1);

  const [result, setResult] = useState<Result | null>(null);
  const [hud, setHud] = useState({ done: 0, total: totalPops, color: '' });
  const [roundNonce, setRoundNonce] = useState(0);

  const stateRef = useRef<ColorSplashState | null>(null);
  const fieldRef = useRef<FloatField | null>(null);
  const rngRef = useRef<Rng>(() => 0);
  const targetRef = useRef('');
  const startRef = useRef(0);
  const hintsRef = useRef(0);
  const poppedRef = useRef(0);
  const restartRef = useRef<() => void>(() => {});
  const helpRef = useRef<() => void>(() => {});

  const handleReady = useCallback(
    (board: GameBoard) => {
      if (!def) return;
      const names = def.colors.map((c) => c.name);
      const hexOf = (name: string): number =>
        def.colors.find((c) => c.name === name)?.hex ?? 0xffffff;

      const makeSprite = (name: string): FloatSpriteInit => ({ value: name, fill: hexOf(name) });

      const distractor = (target: string): string => {
        if (names.length <= 1) return target;
        let v = pick(names, rngRef.current);
        while (v === target) v = pick(names, rngRef.current);
        return v;
      };

      const announce = (color: string, remaining: number): void => {
        system('show', color); // 🤖 called a colour
        if (useProgress.getState().settings.sound) {
          speakPhrase(remaining > 1 ? `Pop the ${color} ones` : `Pop the ${color} one`);
        }
      };

      const finish = (): void => {
        const s = stateRef.current!;
        const round: RoundResult = {
          gameId: 'color-splash',
          level,
          won: true,
          durationMs: performance.now() - startRef.current,
          metrics: { misses: s.misses, targets: totalPops, hints: hintsRef.current },
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
        const out = popColor(s, value);
        stateRef.current = out.state;
        const { sound } = useProgress.getState().settings;

        if (out.kind === 'miss') {
          child('tap', 'bad', value); // 🧒 popped the wrong colour
          if (sound) playError();
          fieldRef.current?.shakeMiss(id);
          return;
        }

        child('tap', 'good', value); // 🧒 popped the right colour
        if (sound) {
          playSuccess();
          speakYay();
        }
        poppedRef.current += 1;
        setHud((h) => ({ ...h, done: poppedRef.current }));
        fieldRef.current?.pop(id);

        if (out.kind === 'won') {
          window.setTimeout(finish, 400);
          return;
        }
        if (out.kind === 'cleared') {
          const nextColor = currentColor(out.state)!;
          targetRef.current = nextColor;
          fieldRef.current?.clearValue(value); // drift away the finished colour
          fieldRef.current?.ensureValue(nextColor, () => makeSprite(nextColor));
          setHud((h) => ({ ...h, color: nextColor }));
          announce(nextColor, out.state.remaining);
        } else {
          fieldRef.current?.ensureValue(value, () => makeSprite(value));
        }
      };

      const setup = (): void => {
        clear();
        hintsRef.current = 0;
        poppedRef.current = 0;
        useProgress.getState().markGameStarted();
        const seed = (Date.now() ^ (level * 0x9e3779b1)) >>> 0;
        const rng = mulberry32(seed);
        rngRef.current = rng;
        const state = createColorSplashState(
          { colors: names, targets: def.targets, perColor: def.perColor },
          rng,
        );
        stateRef.current = state;
        startRef.current = performance.now();
        const first = currentColor(state)!;
        targetRef.current = first;

        fieldRef.current?.stop();
        board.clear();
        const field = createFloatField(board, {
          direction: 'up',
          speedPxPerSec: 42,
          population: def.onScreen,
          reducedMotion: settings.reducedMotion,
          rng,
          refill: (self) => {
            const t = targetRef.current;
            const present = self.values().some((v) => v.value === t);
            // Bias toward the target colour so a few of it float together (a "set").
            const useTarget = !present || rng() < 0.5;
            return makeSprite(useTarget ? t : distractor(t));
          },
        });
        fieldRef.current = field;
        field.onPop(handlePop);
        field.start();

        setHud({ done: 0, total: totalPops, color: first });
        announce(first, state.remaining);
      };

      restartRef.current = () => {
        setResult(null);
        setRoundNonce((n) => n + 1);
        setup();
      };

      helpRef.current = () => {
        help();
        hintsRef.current += 1;
        const target = targetRef.current;
        fieldRef.current?.hintValue(target);
        if (useProgress.getState().settings.sound) speakPhrase(`Pop the ${target} ones`);
      };

      setup();
      return () => {
        fieldRef.current?.stop();
        stopSpeech();
      };
    },
    [def, level, totalPops, settings.reducedMotion, system, child, win, help, summary, clear],
  );

  if (!def) return <Navigate to="/" replace />;
  const next = nextLevel('color-splash', level);

  return (
    <AppShell>
      <GameLayout
        side={settings.buddyPosition}
        feedback={feedback}
        reducedMotion={settings.reducedMotion}
        onHelp={() => helpRef.current()}
        idleMessage="Pop all the colour I call! 🎨"
        hud={
          <GameHud
            gameName="🎨 Splash"
            title={`Level ${level}`}
            onBack={() => navigate('/play/color-splash')}
            onRestart={() => restartRef.current()}
            analytics={<GameAnalyticsButton gameId="color-splash" />}
            home={<HomeButton />}
            nav={<NavIcons hideHome />}
          >
            <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
              {hud.color}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
              {hud.done}/{hud.total}
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
        onNext={next ? () => navigate(`/play/color-splash/${next}`) : undefined}
        onHome={() => navigate('/')}
        analytics={<GameAnalyticsButton gameId="color-splash" />}
        reducedMotion={settings.reducedMotion}
      />
    </AppShell>
  );
}
