import { useEffect, useRef, useState } from 'react';
import { cn } from '@invana/ui';
import type { FeedbackKind, FeedbackMessage } from './Buddy.js';

/** Generic space-themed encouragements rotated as Buddy's idle line. */
const IDLE_TIPS = ['You can do it!', 'I believe in you!', 'You’re a star!'] as const;

/** How many recent lines to keep in view. */
const VISIBLE = 12;

/** Icon + text colour per message kind. */
const STYLE: Record<FeedbackKind, { icon: string; cls: string }> = {
  cheer: { icon: '✅', cls: 'text-emerald-300' },
  retry: { icon: '🔁', cls: 'text-rose-300' },
  help: { icon: '🙋', cls: 'text-sky-300' },
  hint: { icon: '💡', cls: 'text-amber-300' },
};

export interface MessageFeedProps {
  messages: FeedbackMessage[];
  reducedMotion?: boolean;
  /** Per-game hint, rotated into Buddy's idle line. */
  idleMessage?: string;
}

/**
 * Buddy's message log — a left-aligned conversation feed: the kid's help
 * requests and Buddy's replies, plus success/try-again lines, each an
 * icon + coloured line. Large, well-spaced text for early readers (5+). Shows a
 * "Tries" count and auto-scrolls to the newest line.
 */
export function MessageFeed({ messages, reducedMotion, idleMessage }: MessageFeedProps): React.JSX.Element {
  const tips = idleMessage ? [idleMessage, ...IDLE_TIPS] : [...IDLE_TIPS];
  const [tip, setTip] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTip((i) => i + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const tries = messages.filter((m) => m.kind === 'retry').length;
  const recent = messages.slice(-VISIBLE);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <div className="w-full max-w-[20rem] rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="mb-2 flex items-center justify-between text-sm font-bold uppercase tracking-wide text-indigo-300/80">
        <span>🚀 Buddy</span>
        {tries > 0 && (
          <span>
            tries <span className="text-rose-300">{tries}</span>
          </span>
        )}
      </div>

      <div ref={scrollRef} className="flex max-h-56 flex-col gap-2.5 overflow-y-auto pr-1">
        <div className="flex items-start gap-2 text-lg font-semibold text-indigo-100">
          <span aria-hidden="true">🚀</span>
          <span>{tips[tip % tips.length]}</span>
        </div>

        {recent.map((m, idx) => {
          const style = STYLE[m.kind];
          return (
            <div
              key={m.id}
              style={{
                animation:
                  idx === recent.length - 1 && !reducedMotion ? 'kg-msg-pop .25s ease-out' : undefined,
              }}
              className={cn('flex items-start gap-2 text-lg font-semibold', style.cls)}
            >
              <span aria-hidden="true">{style.icon}</span>
              <span>{m.text}</span>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes kg-msg-pop{0%{opacity:0;transform:translateX(-6px)}100%{opacity:1;transform:none}}`}</style>
    </div>
  );
}
