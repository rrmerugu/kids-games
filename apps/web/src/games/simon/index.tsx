import { useCallback, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Badge } from '@invana/ui';
import {
  AppShell,
  GameHud,
  GameLayout,
  GlossyButton,
  ResultDialog,
  Stopwatch,
  TurnBanner,
  useFeedback,
} from '@kids/ui';
import type { Turn } from '@kids/ui';
import {
  GameCanvas,
  type GameBoard,
  playError,
  playPad,
  playSuccess,
  playWin,
} from '@kids/game-engine';
import {
  beginInput,
  createSimonState,
  extendSequence,
  mulberry32,
  pressPad,
  type Rng,
  type SimonState,
  type RoundResult,
} from '@kids/game-core';
import { getLevel, nextLevel, type SimonLevel } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import { NavIcons } from '../../components/NavIcons.js';
import { HomeButton } from '../../components/HomeButton.js';
import { GameAnalyticsButton } from '../../components/GameAnalyticsButton.js';
import { padColors } from '../../palette.js';

interface Result {
  won: boolean;
  stars: number;
  durationMs: number;
  newStickers: string[];
}

/** Timeline glyph + recognisable word per pad index (matches the canvas colours). */
const PAD_VIEW = [
  { sq: '🟩', word: 'GREEN' },
  { sq: '🟥', word: 'RED' },
  { sq: '🟦', word: 'BLUE' },
  { sq: '🟨', word: 'YELLOW' },
] as const;
const padView = (pad: number): { sq: string; word: string } => PAD_VIEW[pad % PAD_VIEW.length]!;

export function SimonScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = getLevel('simon', level) as SimonLevel | undefined;
  const settings = useProgress((s) => s.settings);
  const { feedback, system, child, win, help, clear, summary } = useFeedback();

  const [result, setResult] = useState<Result | null>(null);
  const [hud, setHud] = useState({ len: 0, target: def?.targetLength ?? 0 });
  const [turn, setTurn] = useState<Turn | null>(null);
  const [roundNonce, setRoundNonce] = useState(0);

  const stateRef = useRef<SimonState | null>(null);
  const rngRef = useRef<Rng>(() => 0);
  const replaysRef = useRef(0);
  const startRef = useRef(0);
  const showingRef = useRef(false);
  const restartRef = useRef<() => void>(() => {});
  const showAgainRef = useRef<() => void>(() => {});

  const handleReady = useCallback(
    (board: GameBoard) => {
      if (!def) return;
      const timeouts = new Set<number>();
      const after = (ms: number, fn: () => void): void => {
        const t = window.setTimeout(() => {
          timeouts.delete(t);
          fn();
        }, ms);
        timeouts.add(t);
      };

      const flash = (pad: number, on: boolean): void =>
        board.update(`pad${pad}`, { alpha: on ? 1 : 0.55 });

      const showSequence = (): void => {
        const seq = stateRef.current!.sequence;
        const sound = useProgress.getState().settings.sound;
        showingRef.current = true;
        setTurn('watch'); // game's turn — child should watch
        const stepMs = 620;
        const litMs = 380;
        seq.forEach((pad, idx) => {
          after(idx * stepMs, () => {
            flash(pad, true);
            if (sound) playPad(pad);
            const v = padView(pad);
            system('show', v.sq, v.word); // 🤖 lit this colour — child should watch
          });
          after(idx * stepMs + litMs, () => flash(pad, false));
        });
        after(seq.length * stepMs + 150, () => {
          showingRef.current = false;
          stateRef.current = beginInput({ ...stateRef.current!, inputIndex: 0 });
          setTurn('go'); // player's turn — go!
        });
      };

      const setup = (): void => {
        clear();
        useProgress.getState().markGameStarted();
        const seed = (Date.now() ^ (level * 0x85ebca6b)) >>> 0;
        rngRef.current = mulberry32(seed);
        let s = createSimonState({ pads: 4, targetLength: def.targetLength });
        s = extendSequence(s, rngRef.current);
        stateRef.current = s;
        replaysRef.current = 0;
        startRef.current = performance.now();

        const colors = padColors(useProgress.getState().settings.palette);
        const cell = 150;
        const cells = board.gridCells(2, 2, cell, 44);
        board.clear();
        for (let i = 0; i < 4; i++) {
          const p = cells[i]!;
          board.addTile(`pad${i}`, {
            x: p.x,
            y: p.y,
            width: cell,
            height: cell,
            fill: colors[i % colors.length]!,
            cornerRadius: 28,
            alpha: 0.55,
            stroke: { color: 0xffffff, width: 6 },
          });
        }
        board.fit(70);
        setHud({ len: s.sequence.length, target: def.targetLength });
        after(700, showSequence);
      };

      const finish = (won: boolean): void => {
        setTurn(null);
        const round: RoundResult = {
          gameId: 'simon',
          level,
          won,
          durationMs: performance.now() - startRef.current,
          metrics: {
            replays: replaysRef.current,
            hints: replaysRef.current,
            mistakes: stateRef.current?.mistakes ?? 0,
          },
          actions: summary(),
        };
        const { sound } = useProgress.getState().settings;
        const outcome = useProgress.getState().recordRound(round);
        if (won) {
          win();
          if (sound) playWin();
        }
        setResult({
          won,
          stars: outcome.stars,
          durationMs: round.durationMs,
          newStickers: outcome.newStickers,
        });
      };

      const handleTap = (id: string): void => {
        if (showingRef.current) return;
        const s = stateRef.current;
        if (!s || s.phase !== 'input' || !id.startsWith('pad')) return;
        const pad = Number(id.slice(3));
        const out = pressPad(s, pad);
        stateRef.current = out.state;
        const { sound } = useProgress.getState().settings;
        const v = padView(pad);

        if (out.kind === 'wrong') {
          child('tap', 'bad', v.sq, v.word); // 🧒 tapped the wrong colour
          if (sound) playError();
          board.shake(`pad${pad}`);
          after(600, () => finish(false));
          return;
        }

        child('tap', 'good', v.sq, v.word); // 🧒 matched a colour
        flash(pad, true);
        if (sound) playPad(pad);
        after(220, () => flash(pad, false));

        if (out.kind === 'round-complete') {
          if (sound) playSuccess();
          after(520, () => {
            stateRef.current = extendSequence(stateRef.current!, rngRef.current);
            setHud((h) => ({ ...h, len: stateRef.current!.sequence.length }));
            showSequence();
          });
        } else if (out.kind === 'won') {
          after(520, () => finish(true));
        }
      };

      restartRef.current = () => {
        setResult(null);
        setRoundNonce((n) => n + 1);
        setup();
      };
      showAgainRef.current = () => {
        if (showingRef.current || stateRef.current?.phase !== 'input') return;
        replaysRef.current += 1;
        stateRef.current = { ...stateRef.current, inputIndex: 0 };
        showSequence();
      };

      setup();
      const off = board.onTap(handleTap);
      return () => {
        off();
        timeouts.forEach((t) => clearTimeout(t));
      };
    },
    [def, level, system, child, win, summary, clear],
  );

  if (!def) return <Navigate to="/" replace />;
  const next = nextLevel('simon', level);

  return (
    <AppShell>
      <GameLayout
        side={settings.buddyPosition}
        feedback={feedback}
        reducedMotion={settings.reducedMotion}
        onHelp={() => {
          help();
          showAgainRef.current();
        }}
        idleMessage={
          turn === 'watch'
            ? 'Watch carefully! 👀'
            : turn === 'go'
              ? 'Your turn — tap! 👆'
              : 'Watch, then tap the colours! 🎵'
        }
        hud={
          <GameHud
            gameName="🎵 Colors"
            title={`Level ${level}`}
            onBack={() => navigate('/play/simon')}
            onRestart={() => restartRef.current()}
            analytics={<GameAnalyticsButton gameId="simon" />}
            home={<HomeButton />}
            nav={<NavIcons hideHome />}
          >
            <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
              {hud.len}/{hud.target}
            </Badge>
            <Stopwatch resetSignal={roundNonce} />
            <GlossyButton
              icon="👀"
              label="Again"
              color="amber"
              ariaLabel="Show again"
              onClick={() => showAgainRef.current()}
            />
          </GameHud>
        }
      >
        <GameCanvas onReady={handleReady} />
        <TurnBanner turn={turn} />
      </GameLayout>
      <ResultDialog
        open={result !== null}
        won={result?.won ?? false}
        stars={result?.stars ?? 0}
        durationMs={result?.durationMs}
        newStickers={result?.newStickers ?? []}
        onPlayAgain={() => restartRef.current()}
        onNext={next ? () => navigate(`/play/simon/${next}`) : undefined}
        onHome={() => navigate('/')}
        analytics={<GameAnalyticsButton gameId="simon" />}
      />
    </AppShell>
  );
}
