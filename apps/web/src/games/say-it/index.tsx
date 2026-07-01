import { useCallback, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Badge } from '@invana/ui';
import { AppShell, GameHud, GameLayout, GlossyButton, ResultDialog, useFeedback } from '@kids/ui';
import {
  GameCanvas,
  type GameBoard,
  playSuccess,
  playWin,
  speakPhrase,
  speakWord,
  speakWordSlow,
  stopSpeech,
} from '@kids/game-engine';
import {
  confirmSaid,
  createSayItState,
  currentItem,
  hearAgain,
  mulberry32,
  type RoundResult,
  type SayItState,
} from '@kids/game-core';
import { getLevel, nextLevel, type SayItLevel } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import { NavIcons } from '../../components/NavIcons.js';
import { HomeButton } from '../../components/HomeButton.js';
import { GameAnalyticsButton } from '../../components/GameAnalyticsButton.js';

interface Result {
  won: boolean;
  stars: number;
  durationMs: number;
  newStickers: string[];
}

const CARD = 420;
const CARD_FILL = 0xffffff;
const CARD_BORDER = 0xf59e0b;

export function SayItScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = getLevel('say-it', level) as SayItLevel | undefined;
  const settings = useProgress((s) => s.settings);
  const { feedback, system, child, win, help, clear, summary } = useFeedback();

  const [result, setResult] = useState<Result | null>(null);
  const [view, setView] = useState({ word: '', index: 0, targets: def?.targets ?? 0 });

  const stateRef = useRef<SayItState | null>(null);
  const startRef = useRef(0);
  const restartRef = useRef<() => void>(() => {});
  const hearRef = useRef<() => void>(() => {});
  const slowRef = useRef<() => void>(() => {});
  const saidRef = useRef<() => void>(() => {});
  const helpRef = useRef<() => void>(() => {});

  const handleReady = useCallback(
    (board: GameBoard) => {
      if (!def) return;

      const reduced = (): boolean => useProgress.getState().settings.reducedMotion;
      const sound = (): boolean => useProgress.getState().settings.sound;

      // Draw the current item as one big picture card; the word shows in the HUD.
      const draw = (state: SayItState, speak: boolean): void => {
        const item = currentItem(state);
        if (!item) return;
        board.clear();
        board.addTile('card', {
          x: 0,
          y: 0,
          width: CARD,
          height: CARD,
          cornerRadius: 48,
          fill: CARD_FILL,
          glyph: { char: item.emoji, color: 0x1e293b, sizeRatio: 0.62 },
        });
        board.setBorder('card', CARD_BORDER, 8);
        board.fit(110);
        setView({ word: item.word, index: state.index, targets: def.targets });
        if (speak) {
          if (sound()) speakWord(item.word);
          system('show', item.emoji, item.word); // 🤖 showed a picture-word to say
        }
      };

      const setup = (): void => {
        clear();
        useProgress.getState().markGameStarted();
        const seed = (Date.now() ^ (level * 0x9e3779b1)) >>> 0;
        const state = createSayItState({ items: def.items, targets: def.targets }, mulberry32(seed));
        stateRef.current = state;
        startRef.current = performance.now();
        draw(state, true);
      };

      const finish = (): void => {
        const s = stateRef.current!;
        const round: RoundResult = {
          gameId: 'say-it',
          level,
          won: true,
          durationMs: performance.now() - startRef.current,
          metrics: { repeats: s.repeats, items: def.targets },
          actions: summary(),
        };
        const outcome = useProgress.getState().recordRound(round);
        win();
        if (sound()) playWin();
        setResult({
          won: true,
          stars: outcome.stars,
          durationMs: round.durationMs,
          newStickers: outcome.newStickers,
        });
      };

      hearRef.current = () => {
        const s = stateRef.current;
        if (!s || s.phase !== 'speak') return;
        stateRef.current = hearAgain(s);
        const item = currentItem(s);
        if (item && sound()) speakWord(item.word);
      };

      slowRef.current = () => {
        const s = stateRef.current;
        if (!s || s.phase !== 'speak') return;
        stateRef.current = hearAgain(s);
        const item = currentItem(s);
        if (item && sound()) speakWordSlow(item.word);
      };

      saidRef.current = () => {
        const s = stateRef.current;
        if (!s || s.phase !== 'speak') return;
        const item = currentItem(s);
        const out = confirmSaid(s);
        stateRef.current = out.state;
        child('say', 'good', '🗣️', item?.word); // 🧒 said the word (practice, always good)
        if (sound()) playSuccess();
        if (!reduced()) board.pulse('card');
        if (out.kind === 'won') {
          window.setTimeout(finish, 450);
          return;
        }
        window.setTimeout(() => {
          if (stateRef.current === out.state) draw(out.state, true);
        }, 500);
      };

      helpRef.current = () => {
        help();
        const s = stateRef.current;
        if (!s || s.phase !== 'speak') return;
        const item = currentItem(s);
        if (!item) return;
        if (sound()) speakPhrase(`Say ${item.word}`);
      };

      restartRef.current = () => {
        setResult(null);
        setup();
      };

      setup();
      return () => {
        stopSpeech();
      };
    },
    [def, level, system, child, win, help, summary, clear],
  );

  if (!def) return <Navigate to="/" replace />;
  const next = nextLevel('say-it', level);

  return (
    <AppShell>
      <GameLayout
        side={settings.buddyPosition}
        feedback={feedback}
        reducedMotion={settings.reducedMotion}
        onHelp={() => helpRef.current()}
        idleMessage="Look at the picture and say it out loud! 🗣️"
        hud={
          <GameHud
            gameName="🗣️ Say It"
            title={`Level ${level}`}
            onBack={() => navigate('/play/say-it')}
            onRestart={() => restartRef.current()}
            analytics={<GameAnalyticsButton gameId="say-it" />}
            home={<HomeButton />}
            nav={<NavIcons hideHome />}
          >
            <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
              {view.index}/{view.targets}
            </Badge>
          </GameHud>
        }
      >
        <div className="relative h-full w-full">
          <GameCanvas onReady={handleReady} />
          {/* The word to say — big, but the picture above carries the meaning. */}
          <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
            <span className="rounded-full bg-white/90 px-6 py-2 text-4xl font-extrabold tracking-wide text-slate-800 shadow-lg ring-1 ring-amber-300">
              {view.word}
            </span>
          </div>
          {/* Listen-and-repeat controls. No microphone — the child self-confirms. */}
          <div className="absolute inset-x-0 bottom-5 flex flex-wrap items-center justify-center gap-3">
            <GlossyButton icon="🔊" label="Hear it" color="sky" onClick={() => hearRef.current()} />
            <GlossyButton icon="🐢" label="Slow" color="violet" onClick={() => slowRef.current()} />
            <GlossyButton
              icon="👍"
              label="I said it!"
              color="emerald"
              className="h-14 px-7 text-xl"
              onClick={() => saidRef.current()}
            />
          </div>
        </div>
      </GameLayout>
      <ResultDialog
        open={result !== null}
        won={result?.won ?? false}
        stars={result?.stars ?? 0}
        durationMs={result?.durationMs}
        newStickers={result?.newStickers ?? []}
        onPlayAgain={() => restartRef.current()}
        onNext={next ? () => navigate(`/play/say-it/${next}`) : undefined}
        onHome={() => navigate('/')}
        analytics={<GameAnalyticsButton gameId="say-it" />}
      />
    </AppShell>
  );
}
