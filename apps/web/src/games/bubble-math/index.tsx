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
  createBubbleMathState,
  currentProblem,
  popBubble,
  mulberry32,
  pick,
  type BubbleMathState,
  type MathProblem,
  type Rng,
  type RoundResult,
} from '@kids/game-core';
import { nextLevel, type BubbleMathLevel } from '@kids/gamification';
import { useGameLevel } from '../useGameLevel.js';
import { useProgress } from '@kids/storage';

interface Result {
  won: boolean;
  stars: number;
  durationMs: number;
  newStickers: string[];
}

const BUBBLE_FILLS = [0x38bdf8, 0x818cf8, 0x34d399, 0xf472b6, 0xfbbf24];
const problemText = (p: MathProblem): string => `${p.a} ${p.op} ${p.b}`;

export function BubbleMathScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = useGameLevel('bubble-math', level) as BubbleMathLevel | undefined;
  const settings = useProgress((s) => s.settings);
  const { feedback, system, child, win, help, clear, summary } = useFeedback();

  const [result, setResult] = useState<Result | null>(null);
  const [hud, setHud] = useState({ index: 0, targets: def?.targets ?? 0, problem: '' });
  const [roundNonce, setRoundNonce] = useState(0);

  const stateRef = useRef<BubbleMathState | null>(null);
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
        fill: pick(BUBBLE_FILLS, rngRef.current),
      });

      const distractor = (answer: number): string => {
        const max = def.maxOperand;
        for (let tries = 0; tries < 8; tries++) {
          const cand = answer + pick([-2, -1, 1, 2, 3], rngRef.current);
          if (cand >= 0 && cand <= max && cand !== answer) return String(cand);
        }
        let v = Math.floor(rngRef.current() * (max + 1));
        while (v === answer) v = Math.floor(rngRef.current() * (max + 1));
        return String(v);
      };

      const announce = (p: MathProblem): void => {
        system('show', problemText(p)); // 🤖 showed the sum
        if (useProgress.getState().settings.sound) {
          speakPhrase(`${p.a} ${p.op === '+' ? 'plus' : 'minus'} ${p.b}`);
        }
      };

      const finish = (): void => {
        const s = stateRef.current!;
        const round: RoundResult = {
          gameId: 'bubble-math',
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
        const out = popBubble(s, value);
        stateRef.current = out.state;
        const { sound } = useProgress.getState().settings;

        if (out.kind === 'miss') {
          child('tap', 'bad', value); // 🧒 popped the wrong number
          if (sound) playError();
          fieldRef.current?.shakeMiss(id);
          return;
        }

        child('tap', 'good', value); // 🧒 solved the sum
        if (sound) {
          playSuccess();
          speakYay();
        }
        setHud((h) => ({ ...h, index: out.state.index }));
        fieldRef.current?.pop(id);

        if (out.kind === 'won') {
          window.setTimeout(finish, 400);
          return;
        }
        const p = currentProblem(out.state)!;
        targetRef.current = String(p.answer);
        fieldRef.current?.ensureValue(String(p.answer), () => makeSprite(String(p.answer)));
        setHud((h) => ({ ...h, problem: problemText(p) }));
        announce(p);
      };

      const setup = (): void => {
        clear();
        hintsRef.current = 0;
        useProgress.getState().markGameStarted();
        const seed = (Date.now() ^ (level * 0xcafeb0ba)) >>> 0;
        const rng = mulberry32(seed);
        rngRef.current = rng;
        const state = createBubbleMathState(
          { maxOperand: def.maxOperand, ops: def.ops, targets: def.targets },
          rng,
        );
        stateRef.current = state;
        startRef.current = performance.now();
        const first = currentProblem(state)!;
        targetRef.current = String(first.answer);

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
            return makeSprite(present ? distractor(Number(t)) : t);
          },
        });
        fieldRef.current = field;
        field.onPop(handlePop);
        field.start();

        setHud({ index: 0, targets: def.targets, problem: problemText(first) });
        announce(first);
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
        const p = stateRef.current ? currentProblem(stateRef.current) : undefined;
        if (p && useProgress.getState().settings.sound) {
          speakPhrase(`${p.a} ${p.op === '+' ? 'plus' : 'minus'} ${p.b} is ${p.answer}`);
        }
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
  const next = nextLevel('bubble-math', level);

  return (
    <AppShell>
      <GameLayout
        side={settings.buddyPosition}
        feedback={feedback}
        reducedMotion={settings.reducedMotion}
        onHelp={() => helpRef.current()}
        idleMessage="Pop the answer bubble! ➕"
        hud={
          <GameHud
            gameName="➕ Math"
            title={`Level ${level}`}
            onBack={() => navigate('/play/bubble-math')}
            onRestart={() => restartRef.current()}
            analytics={<GameAnalyticsButton gameId="bubble-math" />}
            home={<HomeButton />}
            nav={<NavIcons hideHome />}
          >
            <Badge variant="secondary" className="px-3 py-1.5 text-2xl shadow">
              {hud.problem} = ?
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
        onNext={next ? () => navigate(`/play/bubble-math/${next}`) : undefined}
        onHome={() => navigate('/')}
        analytics={<GameAnalyticsButton gameId="bubble-math" />}
        reducedMotion={settings.reducedMotion}
      />
    </AppShell>
  );
}
