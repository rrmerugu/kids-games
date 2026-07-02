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
  createFeedMonsterState,
  currentCategory,
  feed,
  mulberry32,
  pick,
  type FeedMonsterState,
  type Rng,
  type RoundResult,
} from '@kids/game-core';
import { getLevel, nextLevel, type FeedMonsterLevel } from '@kids/gamification';
import { useProgress } from '@kids/storage';

interface Result {
  won: boolean;
  stars: number;
  durationMs: number;
  newStickers: string[];
}

/** Friendly spoken words for the internal category tags. */
const FOOD_WORDS: Record<string, string> = {
  FRUIT: 'fruit',
  VEGGIE: 'vegetables',
  LAND: 'land animals',
  SEA: 'sea animals',
  ANIMAL: 'animals',
  VEHICLE: 'cars',
};
const foodWord = (cat: string): string => FOOD_WORDS[cat] ?? cat.toLowerCase();

export function FeedMonsterScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = getLevel('feed-monster', level) as FeedMonsterLevel | undefined;
  const settings = useProgress((s) => s.settings);
  const { feedback, system, child, win, help, clear, summary } = useFeedback();

  const [result, setResult] = useState<Result | null>(null);
  const [hud, setHud] = useState({ index: 0, targets: def?.targets ?? 0, food: '' });
  const [roundNonce, setRoundNonce] = useState(0);

  const stateRef = useRef<FeedMonsterState | null>(null);
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
      const categories = [...new Set(def.items.map((i) => i.category))];
      const emojiFor = (cat: string): string =>
        pick(
          def.items.filter((i) => i.category === cat),
          rngRef.current,
        ).emoji;

      const makeSprite = (cat: string): FloatSpriteInit => ({
        value: cat,
        glyph: { char: emojiFor(cat), sizeRatio: 0.62 },
        fill: 0xfef3c7,
      });

      const distractor = (target: string): string => {
        if (categories.length <= 1) return target;
        let v = pick(categories, rngRef.current);
        while (v === target) v = pick(categories, rngRef.current);
        return v;
      };

      const announce = (cat: string): void => {
        system('show', foodWord(cat)); // 🤖 asked for a category
        if (useProgress.getState().settings.sound) speakPhrase(`Feed the monster ${foodWord(cat)}`);
      };

      const finish = (): void => {
        const s = stateRef.current!;
        const round: RoundResult = {
          gameId: 'feed-monster',
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
        const out = feed(s, value);
        stateRef.current = out.state;
        const { sound } = useProgress.getState().settings;

        if (out.kind === 'miss') {
          child('tap', 'bad', foodWord(value)); // 🧒 fed the wrong thing
          if (sound) playError();
          fieldRef.current?.shakeMiss(id);
          return;
        }

        child('tap', 'good', foodWord(value)); // 🧒 fed the right thing
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
        const nextCat = currentCategory(out.state)!;
        targetRef.current = nextCat;
        fieldRef.current?.ensureValue(nextCat, () => makeSprite(nextCat));
        setHud((h) => ({ ...h, food: foodWord(nextCat) }));
        announce(nextCat);
      };

      const setup = (): void => {
        clear();
        hintsRef.current = 0;
        useProgress.getState().markGameStarted();
        const seed = (Date.now() ^ (level * 0xa0761d65)) >>> 0;
        const rng = mulberry32(seed);
        rngRef.current = rng;
        const state = createFeedMonsterState({ categories, targets: def.targets }, rng);
        stateRef.current = state;
        startRef.current = performance.now();
        const first = currentCategory(state)!;
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
            const useTarget = !present || rng() < 0.5;
            return makeSprite(useTarget ? t : distractor(t));
          },
        });
        fieldRef.current = field;
        field.onPop(handlePop);
        field.start();
        // The hungry monster watches from the bottom of the scene.
        board.addTile('__monster', {
          x: 0,
          y: 320,
          width: 150,
          height: 150,
          fill: 0x1e293b,
          cornerRadius: 32,
          glyph: { char: '🐲', sizeRatio: 0.8 },
          zIndex: -1,
        });

        setHud({ index: 0, targets: def.targets, food: foodWord(first) });
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
        if (useProgress.getState().settings.sound) {
          speakPhrase(`Feed the monster ${foodWord(targetRef.current)}`);
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
  const next = nextLevel('feed-monster', level);

  return (
    <AppShell>
      <GameLayout
        side={settings.buddyPosition}
        feedback={feedback}
        reducedMotion={settings.reducedMotion}
        onHelp={() => helpRef.current()}
        idleMessage="Feed the monster the right food! 🐲"
        hud={
          <GameHud
            gameName="🐲 Feed"
            title={`Level ${level}`}
            onBack={() => navigate('/play/feed-monster')}
            onRestart={() => restartRef.current()}
            analytics={<GameAnalyticsButton gameId="feed-monster" />}
            home={<HomeButton />}
            nav={<NavIcons hideHome />}
          >
            <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
              {hud.food}
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
        onNext={next ? () => navigate(`/play/feed-monster/${next}`) : undefined}
        onHome={() => navigate('/')}
        analytics={<GameAnalyticsButton gameId="feed-monster" />}
        reducedMotion={settings.reducedMotion}
      />
    </AppShell>
  );
}
