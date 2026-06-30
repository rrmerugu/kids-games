import { useCallback, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Badge } from '@invana/ui';
import { AppShell, GameHud, ResultDialog } from '@kids/ui';
import { GameCanvas, type GameBoard, playHit, playWin, playWrong } from '@kids/game-engine';
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
import { CARD_BACK, CARD_FACE } from '../../palette.js';

interface Result {
  won: boolean;
  stars: number;
  newStickers: string[];
}

export function MemoryMatchScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = getLevel('memory-match', level) as MemoryMatchLevel | undefined;

  const [result, setResult] = useState<Result | null>(null);
  const [hud, setHud] = useState({ matched: 0, pairs: def?.pairs ?? 0 });

  const stateRef = useRef<MemoryMatchState | null>(null);
  const startRef = useRef(0);
  const restartRef = useRef<() => void>(() => {});

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
        const back = { fill: CARD_BACK, glyph: null };
        if (useProgress.getState().settings.reducedMotion) board.update(id, back);
        else void board.flip(id, back);
      };

      const setup = (): void => {
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
        const cell = 110;
        const cells = board.gridCells(rows, cols, cell, 16);

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
        board.fit(50);
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
          metrics: { mismatches: s.mismatches, pairs: def.pairs },
        };
        const { sound } = useProgress.getState().settings;
        const outcome = useProgress.getState().recordRound(round);
        if (sound) playWin();
        setResult({ won, stars: outcome.stars, newStickers: outcome.newStickers });
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
          if (sound) playHit();
          setHud((h) => ({ ...h, matched: out.state.matchedPairs }));
          if (!useProgress.getState().settings.reducedMotion) {
            out.pair.forEach((pid) => after(180, () => board.pulse(pid)));
          }
          if (isWon(out.state)) after(400, () => finish(true));
        } else {
          // mismatch
          reveal(id);
          if (sound) playWrong();
          after(950, () => {
            stateRef.current = resolveMismatch(stateRef.current!);
            out.pair.forEach((pid) => hide(pid));
          });
        }
      };

      restartRef.current = () => {
        setResult(null);
        setup();
      };

      setup();
      const off = board.onTap(handleTap);
      return () => {
        off();
        timeouts.forEach((t) => clearTimeout(t));
      };
    },
    [def, level],
  );

  if (!def) return <Navigate to="/" replace />;
  const next = nextLevel('memory-match', level);

  return (
    <AppShell>
      <GameCanvas onReady={handleReady} backgroundColor={0xeef2ff} />
      <GameHud
        title={`🐶 Level ${level}`}
        onBack={() => navigate('/play/memory-match')}
        onRestart={() => restartRef.current()}
      >
        <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
          {hud.matched}/{hud.pairs} ✅
        </Badge>
      </GameHud>
      <ResultDialog
        open={result !== null}
        won={result?.won ?? false}
        stars={result?.stars ?? 0}
        newStickers={result?.newStickers ?? []}
        onPlayAgain={() => restartRef.current()}
        onNext={next ? () => navigate(`/play/memory-match/${next}`) : undefined}
        onHome={() => navigate('/')}
      />
    </AppShell>
  );
}
