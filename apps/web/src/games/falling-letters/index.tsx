import { useCallback, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Badge } from '@invana/ui';
import { AppShell, GameHud, GameLayout, ResultDialog, Stopwatch, useFeedback } from '@kids/ui';
import { NavIcons } from '../../components/NavIcons.js';
import { HomeButton } from '../../components/HomeButton.js';
import { TypingInput } from '../../components/TypingInput.js';
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
  stopSpeech,
} from '@kids/game-engine';
import {
  createFallingLettersState,
  registerCatch,
  registerMiss,
  mulberry32,
  pick,
  type FallingLettersState,
  type Rng,
  type RoundResult,
} from '@kids/game-core';
import { getLevel, nextLevel, type FallingLettersLevel } from '@kids/gamification';
import { useProgress } from '@kids/storage';

interface Result {
  won: boolean;
  stars: number;
  durationMs: number;
  newStickers: string[];
}

const LETTER_FILLS = [0xf97316, 0x22c55e, 0x3b82f6, 0xa855f7, 0xef4444, 0x14b8a6];

export function FallingLettersScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = getLevel('falling-letters', level) as FallingLettersLevel | undefined;
  const settings = useProgress((s) => s.settings);
  const { feedback, system, child, win, help, clear, summary } = useFeedback();

  const [result, setResult] = useState<Result | null>(null);
  const [hud, setHud] = useState({ caught: 0, targets: def?.targets ?? 0 });
  const [roundNonce, setRoundNonce] = useState(0);

  const stateRef = useRef<FallingLettersState | null>(null);
  const fieldRef = useRef<FloatField | null>(null);
  const rngRef = useRef<Rng>(() => 0);
  const startRef = useRef(0);
  const hintsRef = useRef(0);
  const restartRef = useRef<() => void>(() => {});
  const helpRef = useRef<() => void>(() => {});

  const handleReady = useCallback(
    (board: GameBoard) => {
      if (!def) return;

      const makeSprite = (value: string): FloatSpriteInit => ({
        value,
        glyph: { char: value, color: 0xffffff, sizeRatio: 0.55 },
        fill: pick(LETTER_FILLS, rngRef.current),
      });

      const finish = (): void => {
        const s = stateRef.current!;
        const round: RoundResult = {
          gameId: 'falling-letters',
          level,
          won: true,
          durationMs: performance.now() - startRef.current,
          metrics: { misses: s.missed, targets: def.targets, hints: hintsRef.current },
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

      const catchLetter = (id: string, letter: string): void => {
        const s = stateRef.current;
        if (!s || s.phase !== 'input') return;
        const out = registerCatch(s);
        stateRef.current = out.state;
        child('type', 'good', letter); // 🧒 caught a letter
        if (useProgress.getState().settings.sound) {
          playSuccess();
          speakYay();
        }
        fieldRef.current?.pop(id);
        setHud((h) => ({ ...h, caught: out.state.caught }));
        if (out.kind === 'won') window.setTimeout(finish, 400);
      };

      const handleKey = (e: KeyboardEvent): void => {
        if (e.key.length !== 1) return; // ignore Shift, arrows, etc.
        const s = stateRef.current;
        if (!s || s.phase !== 'input') return;
        const key = e.key.toUpperCase();
        const match = fieldRef.current?.values().find((v) => v.value === key);
        if (match) catchLetter(match.id, key); // no penalty for a key with no letter falling
      };

      const setup = (): void => {
        clear();
        hintsRef.current = 0;
        useProgress.getState().markGameStarted();
        const seed = (Date.now() ^ (level * 0xdeadbeef)) >>> 0;
        const rng = mulberry32(seed);
        rngRef.current = rng;
        const state = createFallingLettersState({ targets: def.targets });
        stateRef.current = state;
        startRef.current = performance.now();

        fieldRef.current?.stop();
        board.clear();
        const field = createFloatField(board, {
          direction: 'down',
          speedPxPerSec: def.speed,
          population: def.onScreen,
          reducedMotion: settings.reducedMotion,
          rng,
          refill: () => makeSprite(pick(def.pool, rng)),
        });
        fieldRef.current = field;
        field.onPop((id, value) => catchLetter(id, value));
        field.onExit(() => {
          const s = stateRef.current;
          if (s && s.phase === 'input') stateRef.current = registerMiss(s);
        });
        field.start();

        setHud({ caught: 0, targets: def.targets });
        system('show', 'A'); // 🤖 letters are falling — catch them
      };

      restartRef.current = () => {
        setResult(null);
        setRoundNonce((n) => n + 1);
        setup();
      };

      // Help → pulse and cheer on the lowest (soonest) letter so a key press lands.
      helpRef.current = () => {
        help();
        hintsRef.current += 1;
        const first = fieldRef.current?.values()[0];
        if (first) fieldRef.current?.hintValue(first.value);
      };

      setup();
      window.addEventListener('keydown', handleKey);
      return () => {
        window.removeEventListener('keydown', handleKey);
        fieldRef.current?.stop();
        stopSpeech();
      };
    },
    [def, level, settings.reducedMotion, system, child, win, help, summary, clear],
  );

  if (!def) return <Navigate to="/" replace />;
  const next = nextLevel('falling-letters', level);

  return (
    <AppShell>
      <GameLayout
        side={settings.buddyPosition}
        feedback={feedback}
        reducedMotion={settings.reducedMotion}
        onHelp={() => helpRef.current()}
        idleMessage="Catch the letters — press or tap them! 🪂"
        hud={
          <GameHud
            gameName="🪂 Catch"
            title={`Level ${level}`}
            onBack={() => navigate('/play/falling-letters')}
            onRestart={() => restartRef.current()}
            analytics={<GameAnalyticsButton gameId="falling-letters" />}
            home={<HomeButton />}
            nav={<NavIcons hideHome />}
          >
            <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
              {hud.caught}/{hud.targets}
            </Badge>
            <Stopwatch resetSignal={roundNonce} />
          </GameHud>
        }
      >
        <GameCanvas onReady={handleReady} />
        <TypingInput />
      </GameLayout>
      <ResultDialog
        open={result !== null}
        won={result?.won ?? false}
        stars={result?.stars ?? 0}
        durationMs={result?.durationMs}
        newStickers={result?.newStickers ?? []}
        onPlayAgain={() => restartRef.current()}
        onNext={next ? () => navigate(`/play/falling-letters/${next}`) : undefined}
        onHome={() => navigate('/')}
        analytics={<GameAnalyticsButton gameId="falling-letters" />}
        reducedMotion={settings.reducedMotion}
      />
    </AppShell>
  );
}
