import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** Which side Buddy sits on, or `off`. Mirrors storage. */
export type BuddyPosition = 'right' | 'left' | 'off';

export type FeedbackKind = 'cheer' | 'retry' | 'help' | 'hint';

/** One feedback message in Buddy's history. */
export interface FeedbackMessage {
  id: number;
  kind: FeedbackKind;
  text: string;
}

/** The feedback state passed to the UI: the full history + the latest entry. */
export interface FeedbackState {
  messages: FeedbackMessage[];
  latest: FeedbackMessage | null;
}

const DEFAULT_CHEER = 'Great job!';
const DEFAULT_RETRY = 'Try again! Good luck!';
const MAX_HISTORY = 30;

/**
 * Records Buddy feedback as a message log. `cheer()` / `retry()` append a
 * message (default text or a custom one) so the UI can show success/failure
 * popups and a running attempt history; `clear()` resets it for a new round.
 */
export function useFeedback(): {
  feedback: FeedbackState;
  cheer: (text?: string) => void;
  retry: (text?: string) => void;
  /** The kid asked Buddy for help (logged as their message). */
  help: (text?: string) => void;
  /** Buddy's hint response. */
  hint: (text: string) => void;
  clear: () => void;
} {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const idRef = useRef(0);

  const push = useCallback((kind: FeedbackKind, text: string) => {
    setMessages((m) => {
      const next = [...m, { id: ++idRef.current, kind, text }];
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
    });
  }, []);

  const cheer = useCallback((text = DEFAULT_CHEER) => push('cheer', text), [push]);
  const retry = useCallback((text = DEFAULT_RETRY) => push('retry', text), [push]);
  const help = useCallback((text = 'Buddy, can you help me?') => push('help', text), [push]);
  const hint = useCallback((text: string) => push('hint', text), [push]);
  const clear = useCallback(() => setMessages([]), []);

  const feedback = useMemo<FeedbackState>(
    () => ({ messages, latest: messages[messages.length - 1] ?? null }),
    [messages],
  );

  return { feedback, cheer, retry, help, hint, clear };
}

const BUDDY_KEYFRAMES = `
@keyframes kg-buddy-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes kg-buddy-cheer { 0% { transform: scale(1); } 30% { transform: scale(1.25) rotate(-8deg); } 60% { transform: scale(1.12) rotate(8deg); } 100% { transform: scale(1); } }
@keyframes kg-buddy-wiggle { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-10deg); } 75% { transform: rotate(10deg); } }
`;

/** How long Buddy reacts before drifting back to his idle float. */
const REACTION_MS = 1800;

export interface BuddyProps {
  /** The latest feedback message — drives Buddy's reaction animation. */
  latest: FeedbackMessage | null;
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
  const [reacting, setReacting] = useState<FeedbackKind | null>(null);

  useEffect(() => {
    // Only cheer/retry drive the bounce/wiggle; help/hint stay calm.
    if (latest?.kind !== 'cheer' && latest?.kind !== 'retry') return;
    setReacting(latest.kind);
    const t = window.setTimeout(() => setReacting(null), REACTION_MS);
    return () => clearTimeout(t);
  }, [latest]);

  const charAnim = reducedMotion
    ? undefined
    : reacting === 'cheer'
      ? 'kg-buddy-cheer .6s ease-out'
      : reacting === 'retry'
        ? 'kg-buddy-wiggle .5s ease-in-out'
        : 'kg-buddy-float 3.5s ease-in-out infinite';

  return (
    <div className="flex flex-col items-center gap-1" aria-hidden="true">
      <style>{BUDDY_KEYFRAMES}</style>
      <div
        key={latest?.id ?? 'idle'}
        style={{ animation: charAnim }}
        className="select-none text-7xl drop-shadow-xl lg:text-8xl"
      >
        {character}
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-indigo-200/80">{name}</span>
    </div>
  );
}
