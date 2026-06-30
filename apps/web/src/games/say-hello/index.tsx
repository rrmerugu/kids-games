import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Badge, cn } from '@invana/ui';
import { AppShell, GameHud, GameLayout, ResultDialog, useFeedback } from '@kids/ui';
import { playError, playSuccess, playWin, speakPhrase, stopSpeech } from '@kids/game-engine';
import {
  choose,
  createSayHelloState,
  currentPrompt,
  mulberry32,
  type RoundResult,
  type SayHelloState,
} from '@kids/game-core';
import { getLevel, nextLevel, type SayHelloLevel } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import { NavIcons } from '../../components/NavIcons.js';
import { GameAnalyticsButton } from '../../components/GameAnalyticsButton.js';

interface Result {
  won: boolean;
  stars: number;
  durationMs: number;
  newStickers: string[];
}

export function SayHelloScreen({ level }: { level: number }): React.JSX.Element {
  const navigate = useNavigate();
  const def = getLevel('say-hello', level) as SayHelloLevel | undefined;
  const settings = useProgress((s) => s.settings);
  const { feedback, cheer, retry, help, hint, clear } = useFeedback();

  const [result, setResult] = useState<Result | null>(null);
  const [state, setState] = useState<SayHelloState | null>(null);
  const [locked, setLocked] = useState(false);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [revealIdx, setRevealIdx] = useState<number | null>(null);
  const startRef = useRef(0);

  // (Re)start a round. Mounting the screen and "restart" both call this.
  const setup = useCallback(() => {
    if (!def) return;
    clear();
    setResult(null);
    setLocked(false);
    setWrongIdx(null);
    setRevealIdx(null);
    useProgress.getState().markGameStarted();
    const seed = (Date.now() ^ (level * 0x85ebca6b)) >>> 0;
    setState(createSayHelloState({ prompts: def.prompts, targets: def.targets }, mulberry32(seed)));
    startRef.current = performance.now();
  }, [def, level, clear]);

  useEffect(() => {
    setup();
    return () => stopSpeech();
  }, [setup]);

  // Read the current line aloud whenever the turn changes.
  const prompt = state ? currentPrompt(state) : undefined;
  const turnKey = state ? state.index : -1;
  useEffect(() => {
    if (prompt && useProgress.getState().settings.sound) speakPhrase(prompt.text);
    // Speak once per turn; prompt.text identifies the turn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnKey]);

  if (!def) return <Navigate to="/" replace />;
  const next = nextLevel('say-hello', level);

  const onChoose = (i: number): void => {
    if (!state || locked) return;
    const out = choose(state, i);
    const sound = useProgress.getState().settings.sound;

    if (out.kind === 'wrong') {
      setState(out.state);
      retry();
      if (sound) playError();
      setWrongIdx(i);
      window.setTimeout(() => setWrongIdx(null), 450);
      return;
    }

    // Correct — celebrate, then advance or finish.
    if (sound) playSuccess();
    cheer();
    setLocked(true);
    setRevealIdx(i);

    if (out.kind === 'won') {
      const round: RoundResult = {
        gameId: 'say-hello',
        level,
        won: true,
        durationMs: performance.now() - startRef.current,
        metrics: { misses: out.state.misses, turns: out.state.prompts.length },
      };
      const outcome = useProgress.getState().recordRound(round);
      window.setTimeout(() => {
        if (sound) playWin();
        setResult({
          won: true,
          stars: outcome.stars,
          durationMs: round.durationMs,
          newStickers: outcome.newStickers,
        });
      }, 550);
      return;
    }

    window.setTimeout(() => {
      setState(out.state);
      setLocked(false);
      setRevealIdx(null);
    }, 650);
  };

  const onHelp = (): void => {
    help();
    if (!prompt) return;
    const correct = prompt.choices.findIndex((c) => c.correct);
    hint('Listen again and pick the friendly reply! 👂');
    if (useProgress.getState().settings.sound) speakPhrase(prompt.text);
    setRevealIdx(correct);
    window.setTimeout(() => setRevealIdx((r) => (r === correct ? null : r)), 1200);
  };

  return (
    <AppShell>
      <GameLayout
        side={settings.buddyPosition}
        feedback={feedback}
        reducedMotion={settings.reducedMotion}
        onHelp={onHelp}
        idleMessage="Listen, then tap the best reply! 👂"
        hud={
          <GameHud
            gameName="👋 Say Hello"
            title={`Level ${level}`}
            onBack={() => navigate('/play/say-hello')}
            onRestart={setup}
            analytics={<GameAnalyticsButton gameId="say-hello" />}
            nav={<NavIcons />}
          >
            <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
              {turnKey >= 0 ? turnKey : 0}/{state?.prompts.length ?? def.targets}
            </Badge>
          </GameHud>
        }
      >
        <div className="flex h-full w-full flex-col items-center justify-center gap-8 p-6">
          {/* The character + what they say (also read aloud). */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-8xl drop-shadow-lg">{prompt?.speaker ?? '🙂'}</span>
            <div className="relative max-w-xl rounded-3xl bg-white px-7 py-4 text-center text-3xl font-extrabold text-slate-800 shadow-xl">
              {prompt?.text ?? ''}
              <button
                type="button"
                aria-label="Hear it again"
                onClick={() => prompt && speakPhrase(prompt.text)}
                className="absolute -right-3 -top-3 grid h-11 w-11 place-items-center rounded-full bg-sky-500 text-xl shadow-lg ring-2 ring-white transition-transform hover:scale-110 active:scale-95"
              >
                🔊
              </button>
            </div>
          </div>

          {/* Reply choices — big emoji + short word, touch and keyboard friendly. */}
          <div className="flex flex-wrap items-stretch justify-center gap-4">
            {prompt?.choices.map((c, i) => (
              <button
                key={`${turnKey}-${i}`}
                type="button"
                disabled={locked}
                onClick={() => onChoose(i)}
                className={cn(
                  'flex min-w-[10rem] flex-col items-center gap-2 rounded-3xl bg-white px-6 py-5 text-2xl font-extrabold text-slate-800 shadow-lg ring-2 ring-transparent transition',
                  'hover:scale-105 active:scale-95 disabled:cursor-default',
                  revealIdx === i && 'ring-emerald-400 ring-4 scale-105',
                  wrongIdx === i && 'animate-[shake_0.4s] ring-rose-300',
                )}
              >
                <span className="text-5xl leading-none">{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </GameLayout>
      <ResultDialog
        open={result !== null}
        won={result?.won ?? false}
        stars={result?.stars ?? 0}
        durationMs={result?.durationMs}
        newStickers={result?.newStickers ?? []}
        onPlayAgain={setup}
        onNext={next ? () => navigate(`/play/say-hello/${next}`) : undefined}
        onHome={() => navigate('/')}
      />
    </AppShell>
  );
}
