import { useCallback, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Badge } from '@invana/ui';
import { AppShell, GameHud, GameLayout, ResultDialog, Stopwatch, useFeedback } from '@kids/ui';
import {
  GameCanvas,
  type GameBoard,
  playError,
  playSuccess,
  playWin,
  speakLetter,
  speakWord,
  stopSpeech,
} from '@kids/game-engine';
import {
  createWordTypingState,
  currentLetter,
  currentWord,
  mulberry32,
  typeLetter,
  type RoundResult,
  type WordTypingState,
} from '@kids/game-core';
import { getLevel, nextLevel, type WordTypingLevel } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import { NavIcons } from '../../components/NavIcons.js';
import { GameAnalyticsButton } from '../../components/GameAnalyticsButton.js';

interface Result {
  won: boolean;
  stars: number;
  durationMs: number;
  newStickers: string[];
}

// Letter-tile palette. A tile is pending (not yet typed), current (type me next),
// or done (typed correctly) — colour + border carry the meaning for pre-readers.
const TILE = 116;
const GAP = 20;
const PENDING_FILL = 0xffffff;
const PENDING_GLYPH = 0x1e293b;
const PENDING_BORDER = 0xcbd5e1;
const CURRENT_FILL = 0xe0f2fe;
const CURRENT_GLYPH = 0x0c4a6e;
const CURRENT_BORDER = 0x0ea5e9;
const DONE_FILL = 0x22c55e;
const DONE_GLYPH = 0xffffff;
const DONE_BORDER = 0x16a34a;

export function WordTypingScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = getLevel('word-typing', level) as WordTypingLevel | undefined;
  const settings = useProgress((s) => s.settings);
  const { feedback, cheer, retry, help, hint, clear } = useFeedback();

  const [result, setResult] = useState<Result | null>(null);
  const [hud, setHud] = useState({ words: 0, targets: def?.targets ?? 0 });
  const [roundNonce, setRoundNonce] = useState(0);

  const stateRef = useRef<WordTypingState | null>(null);
  const tileCountRef = useRef(0);
  const startRef = useRef(0);
  const hintsRef = useRef(0);
  const restartRef = useRef<() => void>(() => {});
  const helpRef = useRef<() => void>(() => {});

  const handleReady = useCallback(
    (board: GameBoard) => {
      if (!def) return;

      const reduced = (): boolean => useProgress.getState().settings.reducedMotion;

      // The glyph char is fixed per tile (the word's letter); only its colour
      // changes with state, so we keep each tile's char here and recolour it.
      const charByTile = new Map<string, string>();
      const glyphFor = (id: string, color: number): { char: string; color: number; sizeRatio: number } => ({
        char: charByTile.get(id) ?? '',
        color,
        sizeRatio: 0.66,
      });

      // Re-style every tile of the current word to match `state`'s cursor.
      const paint = (state: WordTypingState): void => {
        for (let i = 0; i < tileCountRef.current; i++) {
          const id = `letter-${i}`;
          if (i < state.letterIndex) {
            board.update(id, { fill: DONE_FILL, glyph: glyphFor(id, DONE_GLYPH) });
            board.setBorder(id, DONE_BORDER, 6);
          } else if (i === state.letterIndex) {
            board.update(id, { fill: CURRENT_FILL, glyph: glyphFor(id, CURRENT_GLYPH) });
            if (reduced()) board.setBorder(id, CURRENT_BORDER, 8);
            else board.breatheBorder(id, CURRENT_BORDER);
          } else {
            board.update(id, { fill: PENDING_FILL, glyph: glyphFor(id, PENDING_GLYPH) });
            board.setBorder(id, PENDING_BORDER, 4);
          }
        }
      };

      // Lay out the current word as a centred row of letter tiles.
      const drawWord = (state: WordTypingState): void => {
        board.clear();
        charByTile.clear();
        const word = currentWord(state) ?? '';
        tileCountRef.current = word.length;
        const cells = board.gridCells(1, word.length, TILE, GAP);
        for (let i = 0; i < word.length; i++) {
          const id = `letter-${i}`;
          charByTile.set(id, word[i]!);
          board.addTile(id, {
            x: cells[i]!.x,
            y: 0,
            width: TILE,
            height: TILE,
            cornerRadius: 22,
            fill: PENDING_FILL,
            glyph: { char: word[i]!, color: PENDING_GLYPH, sizeRatio: 0.66 },
          });
        }
        board.fit(90);
        paint(state);
        if (useProgress.getState().settings.sound) speakWord(word);
      };

      const setup = (): void => {
        clear();
        hintsRef.current = 0;
        useProgress.getState().markGameStarted();
        const seed = (Date.now() ^ (level * 0xc2b2ae35)) >>> 0;
        const state = createWordTypingState(
          { words: def.words, targets: def.targets },
          mulberry32(seed),
        );
        stateRef.current = state;
        startRef.current = performance.now();
        drawWord(state);
        setHud({ words: 0, targets: def.targets });
      };

      const finish = (): void => {
        const s = stateRef.current!;
        const letters = s.words.join('').length;
        const round: RoundResult = {
          gameId: 'word-typing',
          level,
          won: true,
          durationMs: performance.now() - startRef.current,
          metrics: { misses: s.misses, letters, words: def.targets, hints: hintsRef.current },
        };
        const { sound } = useProgress.getState().settings;
        const outcome = useProgress.getState().recordRound(round);
        cheer();
        if (sound) playWin();
        setResult({
          won: true,
          stars: outcome.stars,
          durationMs: round.durationMs,
          newStickers: outcome.newStickers,
        });
      };

      // Mark every tile of the just-finished word green (a tiny "word done!" beat).
      const markWordDone = (): void => {
        for (let i = 0; i < tileCountRef.current; i++) {
          const id = `letter-${i}`;
          board.update(id, { fill: DONE_FILL, glyph: glyphFor(id, DONE_GLYPH) });
          board.setBorder(id, DONE_BORDER, 6);
        }
      };

      const handleKey = (e: KeyboardEvent): void => {
        // Only react to single-character keys (ignore Shift, arrows, etc.).
        if (e.key.length !== 1) return;
        const s = stateRef.current;
        if (!s || s.phase !== 'input') return;
        const out = typeLetter(s, e.key);
        stateRef.current = out.state;
        const { sound } = useProgress.getState().settings;

        if (out.kind === 'miss') {
          retry();
          if (sound) playError();
          board.shake(`letter-${s.letterIndex}`);
          return;
        }

        if (sound) playSuccess();
        const justTyped = s.letterIndex; // index within the word we just completed a letter of

        if (out.kind === 'hit') {
          board.update(`letter-${justTyped}`, {
            fill: DONE_FILL,
            glyph: glyphFor(`letter-${justTyped}`, DONE_GLYPH),
          });
          board.setBorder(`letter-${justTyped}`, DONE_BORDER, 6);
          if (!reduced()) board.pulse(`letter-${justTyped}`);
          paint(out.state);
          return;
        }

        // A whole word was finished (kind 'word' or 'won').
        markWordDone();
        if (!reduced()) board.pulse(`letter-${justTyped}`);

        if (out.kind === 'won') {
          window.setTimeout(finish, 450);
          return;
        }

        // kind === 'word' — celebrate briefly, then show the next word.
        const wordsDone = out.state.wordIndex;
        setHud((h) => ({ ...h, words: wordsDone }));
        cheer();
        window.setTimeout(() => {
          if (stateRef.current === out.state) drawWord(out.state);
        }, 600);
      };

      restartRef.current = () => {
        setResult(null);
        setRoundNonce((n) => n + 1);
        setup();
      };

      // Ask Buddy for help → say the word and the next letter, and pulse its tile.
      helpRef.current = () => {
        help();
        hintsRef.current += 1;
        const s = stateRef.current;
        if (!s || s.phase !== 'input') return;
        const letter = currentLetter(s);
        const word = currentWord(s);
        if (!letter) return;
        hint(`Spell ${word}. Press the ${letter} key! 👇`);
        if (useProgress.getState().settings.sound) speakLetter(letter);
        if (!reduced()) board.pulse(`letter-${s.letterIndex}`);
      };

      setup();
      window.addEventListener('keydown', handleKey);
      return () => {
        window.removeEventListener('keydown', handleKey);
        stopSpeech();
      };
    },
    [def, level, cheer, retry, help, hint, clear],
  );

  if (!def) return <Navigate to="/" replace />;
  const next = nextLevel('word-typing', level);

  return (
    <AppShell>
      <GameLayout
        side={settings.buddyPosition}
        feedback={feedback}
        reducedMotion={settings.reducedMotion}
        onHelp={() => helpRef.current()}
        idleMessage="Type the word you see! 📝"
        hud={
          <GameHud
            title={`📝 Level ${level}`}
            onBack={() => navigate('/play/word-typing')}
            onRestart={() => restartRef.current()}
            analytics={<GameAnalyticsButton gameId="word-typing" />}
            nav={<NavIcons />}
          >
            <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
              {hud.words}/{hud.targets}
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
        onNext={next ? () => navigate(`/play/word-typing/${next}`) : undefined}
        onHome={() => navigate('/')}
      />
    </AppShell>
  );
}
