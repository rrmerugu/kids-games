import { useCallback, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Badge } from '@invana/ui';
import { AppShell, GameHud, GameLayout, ResultDialog, Stopwatch, useFeedback } from '@kids/ui';
import { NavIcons } from '../../components/NavIcons.js';
import {
  GameCanvas,
  type GameBoard,
  playError,
  playSuccess,
  playWin,
} from '@kids/game-engine';
import {
  createMemoryMatchState,
  flipCard,
  isWon,
  mulberry32,
  resolveMismatch,
  type MemoryMatchState,
  type RoundResult,
} from '@kids/game-core';
import { getLevel, nextLevel, type MemoryMatchLevel } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import {
  BORDER_HINT,
  BORDER_IDLE,
  BORDER_OK,
  BORDER_WRONG,
  CARD_BACK,
  CARD_FACE,
} from '../../palette.js';

interface Result {
  won: boolean;
  stars: number;
  durationMs: number;
  newStickers: string[];
}

export function MemoryMatchScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = getLevel('memory-match', level) as MemoryMatchLevel | undefined;
  const settings = useProgress((s) => s.settings);
  const { feedback, cheer, retry, help, hint, clear } = useFeedback();

  const [result, setResult] = useState<Result | null>(null);
  const [hud, setHud] = useState({ matched: 0, pairs: def?.pairs ?? 0 });
  const [roundNonce, setRoundNonce] = useState(0);

  const stateRef = useRef<MemoryMatchState | null>(null);
  const startRef = useRef(0);
  const hintsRef = useRef(0);
  const restartRef = useRef<() => void>(() => {});
  const helpRef = useRef<() => void>(() => {});

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

      const faceOf = (id: string): string =>
        stateRef.current?.cards.find((c) => c.id === id)?.face ?? '';

      const reveal = (id: string): void => {
        const face = { fill: CARD_FACE, glyph: { char: faceOf(id), sizeRatio: 0.66 } };
        if (useProgress.getState().settings.reducedMotion) board.update(id, face);
        else void board.flip(id, face);
      };
      const hide = (id: string): void => {
        board.setBorder(id, BORDER_IDLE, 5); // restore the resting white border
        const back = { fill: CARD_BACK, glyph: null };
        if (useProgress.getState().settings.reducedMotion) board.update(id, back);
        else void board.flip(id, back);
      };

      const setup = (): void => {
        clear();
        hintsRef.current = 0;
        useProgress.getState().markGameStarted();
        const seed = (Date.now() ^ (level * 0x9e3779b1)) >>> 0;
        const state = createMemoryMatchState(
          { pairs: def.pairs, faces: def.faces },
          mulberry32(seed),
        );
        stateRef.current = state;
        startRef.current = performance.now();

        const n = def.pairs * 2;
        const cols = Math.ceil(Math.sqrt(n));
        const rows = Math.ceil(n / cols);
        const cell = 120;
        // Generous gap so small fingers don't tap the wrong card.
        const cells = board.gridCells(rows, cols, cell, 34);

        board.clear();
        state.cards.forEach((c, i) => {
          const p = cells[i]!;
          board.addTile(c.id, {
            x: p.x,
            y: p.y,
            width: cell,
            height: cell,
            fill: CARD_BACK,
            cornerRadius: 18,
            stroke: { color: 0xffffff, width: 5 },
          });
        });
        board.fit(80);
        setHud({ matched: 0, pairs: def.pairs });
      };

      const finish = (won: boolean): void => {
        const s = stateRef.current;
        if (!s) return;
        const round: RoundResult = {
          gameId: 'memory-match',
          level,
          won,
          durationMs: performance.now() - startRef.current,
          metrics: { mismatches: s.mismatches, pairs: def.pairs, hints: hintsRef.current },
        };
        const { sound } = useProgress.getState().settings;
        const outcome = useProgress.getState().recordRound(round);
        if (won) {
          cheer();
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
        const s = stateRef.current;
        if (!s) return;
        const out = flipCard(s, id);
        if (out.kind === 'ignored') return;
        stateRef.current = out.state;
        const { sound } = useProgress.getState().settings;

        if (out.kind === 'flip') {
          reveal(id);
        } else if (out.kind === 'match') {
          reveal(id);
          cheer();
          if (sound) playSuccess();
          setHud((h) => ({ ...h, matched: out.state.matchedPairs }));
          const reduced = useProgress.getState().settings.reducedMotion;
          // Green highlight once both faces are up: breathing border = "correct!".
          out.pair.forEach((pid) =>
            after(320, () =>
              reduced ? board.setBorder(pid, BORDER_OK) : board.breatheBorder(pid, BORDER_OK),
            ),
          );
          if (isWon(out.state)) after(1400, () => finish(true));
        } else {
          // mismatch — show both faces with a red border, then flip back.
          reveal(id);
          retry();
          if (sound) playError();
          after(320, () => out.pair.forEach((pid) => board.setBorder(pid, BORDER_WRONG)));
          after(1300, () => {
            stateRef.current = resolveMismatch(stateRef.current!);
            out.pair.forEach((pid) => hide(pid));
          });
        }
      };

      restartRef.current = () => {
        setResult(null);
        setRoundNonce((n) => n + 1);
        setup();
      };

      // Ask Buddy for help → peek a matching unmatched pair.
      helpRef.current = () => {
        help();
        hintsRef.current += 1;
        const s = stateRef.current;
        if (!s || s.flipped.length >= 2) {
          hint('Finish your two cards first! 🙂');
          return;
        }
        const byFace = new Map<string, string[]>();
        for (const c of s.cards) {
          if (c.matched || s.flipped.includes(c.id)) continue;
          byFace.set(c.face, [...(byFace.get(c.face) ?? []), c.id]);
        }
        const pair = [...byFace.values()].find((ids) => ids.length >= 2);
        if (!pair) {
          hint('Tap a card to start! 👆');
          return;
        }
        hint('Look at the glowing cards! ✨');
        const [a, b] = pair as [string, string];
        reveal(a);
        reveal(b);
        board.setBorder(a, BORDER_HINT);
        board.setBorder(b, BORDER_HINT);
        after(1300, () => {
          const cur = stateRef.current;
          if (!cur) return;
          [a, b].forEach((id) => {
            const card = cur.cards.find((c) => c.id === id);
            if (card && !card.matched && !cur.flipped.includes(id)) hide(id);
          });
        });
      };

      setup();
      const off = board.onTap(handleTap);
      return () => {
        off();
        timeouts.forEach((t) => clearTimeout(t));
      };
    },
    [def, level, cheer, retry, help, hint, clear],
  );

  if (!def) return <Navigate to="/" replace />;
  const next = nextLevel('memory-match', level);

  return (
    <AppShell>
      <GameLayout
        side={settings.buddyPosition}
        feedback={feedback}
        reducedMotion={settings.reducedMotion}
        onHelp={() => helpRef.current()}
        idleMessage="Find the matching pairs! 🐾"
        hud={
          <GameHud
            title={`🐶 Level ${level}`}
            onBack={() => navigate('/play/memory-match')}
            onRestart={() => restartRef.current()}
            nav={<NavIcons />}
          >
            <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
              {hud.matched}/{hud.pairs} ✅
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
        onNext={next ? () => navigate(`/play/memory-match/${next}`) : undefined}
        onHome={() => navigate('/')}
      />
    </AppShell>
  );
}
