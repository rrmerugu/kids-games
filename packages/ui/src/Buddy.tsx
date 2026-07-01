import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@invana/ui';
import type { ActionStat } from '@kids/game-core';
import { Confetti } from './Confetti.js';

/** Which side Buddy sits on, or `off`. Mirrors storage. */
export type BuddyPosition = 'right' | 'left' | 'off';

/** Who did the thing: the game (`system`) or the player (`child`). */
export type EventActor = 'system' | 'child';
/** Whether a child action was right, wrong, or just a neutral step. */
export type EventOutcome = 'good' | 'bad' | 'neutral';

/**
 * One thing that happened in the round — the unit of Buddy's icon timeline and
 * of the action analytics. Designed for pre-readers: the meaning is carried by
 * `glyph` (a colour dot / letter / picture) plus an optional single recognisable
 * `word`; no sentences.
 */
export interface GameEvent {
  id: number;
  actor: EventActor;
  /** Action type, e.g. `tap` | `type` | `reply` | `say` | `pair` | `show`. */
  type: string;
  outcome: EventOutcome;
  /** Big icon describing the payload (🟩 / A / 🐱 / 🎉). */
  glyph: string;
  /** Optional single recognisable word (GREEN / CAT / H). */
  word?: string;
  /** Monotonic timestamp (`performance.now()`). */
  at: number;
  /** For child actions: ms since the previous event (a response-time proxy). */
  reactionMs?: number;
}

/** The feedback state passed to the UI: the event log, latest entry, try count. */
export interface FeedbackState {
  events: GameEvent[];
  latest: GameEvent | null;
  /** Wrong child actions this round. */
  tries: number;
}

const MAX_HISTORY = 40;

/**
 * Records the round as a timeline of {@link GameEvent}s — `system(...)` for what
 * the game showed, `child(...)` for what the player did (with an outcome), plus
 * `win()` and `help()`. The UI renders it as an icon log beside Buddy and
 * `summary()` rolls it up into per-action-type {@link ActionStat}s for
 * analytics. `clear()` resets it for a new round. A ref mirror keeps the log
 * readable synchronously (e.g. for `summary()` right at round end).
 */
export function useFeedback(): {
  feedback: FeedbackState;
  /** The game presented something (a colour, a letter, a picture). */
  system: (type: string, glyph: string, word?: string) => void;
  /** The player acted, with an outcome. */
  child: (type: string, outcome: EventOutcome, glyph: string, word?: string) => void;
  /** Round won — a celebratory beat (also makes Buddy cheer). */
  win: () => void;
  /** The player asked Buddy for help. */
  help: () => void;
  clear: () => void;
  /** Per-action-type rollup of the current log (for `recordRound`). */
  summary: () => ActionStat[];
} {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const eventsRef = useRef<GameEvent[]>([]);
  const lastAtRef = useRef<number | null>(null);
  const idRef = useRef(0);

  const push = useCallback(
    (actor: EventActor, type: string, outcome: EventOutcome, glyph: string, word?: string) => {
      const at = typeof performance !== 'undefined' ? performance.now() : 0;
      const reactionMs =
        actor === 'child' && lastAtRef.current !== null ? at - lastAtRef.current : undefined;
      lastAtRef.current = at;
      const e: GameEvent = { id: ++idRef.current, actor, type, outcome, glyph, word, at, reactionMs };
      const next = [...eventsRef.current, e];
      eventsRef.current = next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
      setEvents(eventsRef.current);
    },
    [],
  );

  const system = useCallback(
    (type: string, glyph: string, word?: string) => push('system', type, 'neutral', glyph, word),
    [push],
  );
  const child = useCallback(
    (type: string, outcome: EventOutcome, glyph: string, word?: string) =>
      push('child', type, outcome, glyph, word),
    [push],
  );
  const win = useCallback(() => push('system', 'win', 'good', '🎉'), [push]);
  const help = useCallback(() => push('child', 'help', 'neutral', '🙋'), [push]);

  const clear = useCallback(() => {
    eventsRef.current = [];
    lastAtRef.current = null;
    setEvents([]);
  }, []);

  const summary = useCallback((): ActionStat[] => {
    const map = new Map<string, ActionStat>();
    for (const e of eventsRef.current) {
      if (e.actor !== 'child' || e.type === 'help') continue;
      const a = map.get(e.type) ?? {
        type: e.type,
        correct: 0,
        wrong: 0,
        reactionMsTotal: 0,
        reactionCount: 0,
      };
      if (e.outcome === 'good') a.correct += 1;
      else if (e.outcome === 'bad') a.wrong += 1;
      if (e.reactionMs !== undefined) {
        a.reactionMsTotal += e.reactionMs;
        a.reactionCount += 1;
      }
      map.set(e.type, a);
    }
    return [...map.values()];
  }, []);

  const feedback = useMemo<FeedbackState>(
    () => ({
      events,
      latest: events[events.length - 1] ?? null,
      tries: events.filter((e) => e.actor === 'child' && e.outcome === 'bad').length,
    }),
    [events],
  );

  return { feedback, system, child, win, help, clear, summary };
}

const BUDDY_KEYFRAMES = `
@keyframes kg-buddy-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes kg-buddy-cheer { 0% { transform: scale(1); } 30% { transform: scale(1.25) rotate(-8deg); } 60% { transform: scale(1.12) rotate(8deg); } 100% { transform: scale(1); } }
@keyframes kg-buddy-wiggle { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-10deg); } 75% { transform: rotate(10deg); } }
@keyframes kg-buddy-clap { 0%,100% { transform: rotate(0) scale(1); } 25% { transform: rotate(-20deg) scale(1.15); } 50% { transform: rotate(16deg) scale(1.05); } 75% { transform: rotate(-12deg) scale(1.12); } }
@keyframes kg-bubble-pop { 0% { transform: scale(0) translateY(8px); opacity: 0; } 60% { transform: scale(1.15) translateY(0); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
`;

/** How long Buddy reacts before drifting back to his idle float. */
const REACTION_MS = 1800;

export interface BuddyProps {
  /** The latest event — drives Buddy's reaction animation. */
  latest: GameEvent | null;
  reducedMotion?: boolean;
  /** Mascot emoji. Default 🧑‍🚀 (astronaut). */
  character?: string;
  /** Shown under Buddy. Default "Buddy". */
  name?: string;
}

/**
 * Buddy — a cute floating astronaut. Idles with a gentle float and reacts
 * (bounce on cheer / wiggle on retry) to the latest feedback. The actual
 * messages live in `MessageFeed` beside him.
 */
export function Buddy({
  latest,
  reducedMotion = false,
  character = '🧑‍🚀',
  name = 'Buddy',
}: BuddyProps): React.JSX.Element {
  const [reacting, setReacting] = useState<'good' | 'bad' | null>(null);

  useEffect(() => {
    // A good outcome (correct / win) bounces; a wrong one wiggles. Neutral
    // events (the game just showing something) leave Buddy idly floating.
    if (latest?.outcome !== 'good' && latest?.outcome !== 'bad') return;
    setReacting(latest.outcome);
    const t = window.setTimeout(() => setReacting(null), REACTION_MS);
    return () => clearTimeout(t);
  }, [latest]);

  const charAnim = reducedMotion
    ? undefined
    : reacting === 'good'
      ? 'kg-buddy-cheer .6s ease-out'
      : reacting === 'bad'
        ? 'kg-buddy-wiggle .5s ease-in-out'
        : 'kg-buddy-float 3.5s ease-in-out infinite';

  // A correct answer (or a round win) rains a quick confetti burst around Buddy.
  const goodTrigger = latest?.outcome === 'good' ? latest.id : null;

  return (
    <div className="flex flex-col items-center gap-1" aria-hidden="true">
      <style>{BUDDY_KEYFRAMES}</style>
      <div className="relative">
        {/* A cheerful pop of confetti on every correct answer. */}
        <Confetti trigger={goodTrigger} variant="burst" reducedMotion={reducedMotion} />

        {/* Yaay :) / Naay :( speech bubble from Buddy's top-right corner. */}
        {reacting && (
          <div
            key={`bubble-${latest?.id ?? ''}`}
            style={{ animation: reducedMotion ? undefined : 'kg-bubble-pop .35s ease-out both' }}
            className={cn(
              'absolute -right-8 -top-6 z-30 select-none whitespace-nowrap rounded-3xl px-5 py-3 text-2xl font-extrabold shadow-xl sm:text-3xl',
              reacting === 'good' ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950',
            )}
          >
            {reacting === 'good' ? 'Yaay :)' : 'Naay :('}
            {/* little pointer tail toward Buddy */}
            <span
              className={cn(
                'absolute -bottom-1.5 left-5 h-5 w-5 rotate-45',
                reacting === 'good' ? 'bg-emerald-400' : 'bg-amber-300',
              )}
            />
          </div>
        )}

        <div
          key={latest?.id ?? 'idle'}
          style={{ animation: charAnim }}
          className="select-none text-5xl drop-shadow-xl sm:text-7xl lg:text-8xl"
        >
          {character}
        </div>

        {/* Buddy claps to celebrate a correct answer. */}
        {reacting === 'good' && (
          <span
            style={{ animation: reducedMotion ? undefined : 'kg-buddy-clap .45s ease-in-out 2' }}
            className="absolute -bottom-1 -left-3 z-30 select-none text-2xl drop-shadow sm:text-3xl"
          >
            👏
          </span>
        )}
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-indigo-200/80">{name}</span>
    </div>
  );
}
