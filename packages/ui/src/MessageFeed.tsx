import { useEffect, useRef } from 'react';
import { cn } from '@invana/ui';
import type { GameEvent } from './Buddy.js';

/** How many recent events to keep in view. */
const VISIBLE = 14;

/** Actor icon: who did it — the game, or the child. */
const ACTOR_ICON: Record<GameEvent['actor'], string> = {
  system: '🤖',
  child: '🧒',
};

export interface MessageFeedProps {
  events: GameEvent[];
  /** Wrong attempts so far (shown as a small count). */
  tries?: number;
  reducedMotion?: boolean;
}

/**
 * Buddy's event timeline — a pre-reader-friendly icon log of what happened:
 * each row is **who** (🤖 game / 🧒 child), the **thing** (a colour dot, a
 * letter, a picture), an optional single recognisable **word**, and a ✅ / 🔁
 * outcome. No sentences — the icons carry the meaning, so a kid who can't read
 * still follows "the game showed this, then I did that". A faint gap marks each
 * new turn (a system event after a child one). Auto-scrolls to the newest row.
 */
export function MessageFeed({ events, tries = 0, reducedMotion }: MessageFeedProps): React.JSX.Element {
  const recent = events.slice(-VISIBLE);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events.length]);

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

      <div ref={scrollRef} className="flex max-h-60 flex-col gap-1.5 overflow-y-auto pr-1">
        {recent.length === 0 && (
          <div className="flex items-center gap-2 text-lg font-semibold text-indigo-100">
            <span aria-hidden="true">🚀</span>
            <span className="text-2xl">🎮</span>
          </div>
        )}

        {recent.map((e, idx) => {
          const isChild = e.actor === 'child';
          const prev = recent[idx - 1];
          // A system event right after a child one starts a fresh turn.
          const newTurn = e.actor === 'system' && prev?.actor === 'child';
          const tint =
            e.outcome === 'good'
              ? 'text-emerald-200'
              : e.outcome === 'bad'
                ? 'text-amber-200'
                : isChild
                  ? 'text-white'
                  : 'text-indigo-200/90';
          return (
            <div
              key={e.id}
              style={{
                animation:
                  idx === recent.length - 1 && !reducedMotion ? 'kg-msg-pop .25s ease-out' : undefined,
              }}
              className={cn(
                'flex items-center gap-2 rounded-xl px-2 py-1 text-lg font-semibold',
                isChild ? 'bg-white/5' : 'bg-transparent',
                newTurn && 'mt-2',
                tint,
              )}
            >
              <span aria-hidden="true" className="text-base opacity-80">
                {ACTOR_ICON[e.actor]}
              </span>
              <span aria-hidden="true" className="text-2xl leading-none">
                {e.glyph}
              </span>
              {e.word && <span className="tracking-wide">{e.word}</span>}
              <span className="ml-auto text-xl leading-none" aria-hidden="true">
                {e.outcome === 'good' ? '✅' : e.outcome === 'bad' ? '🔁' : ''}
              </span>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes kg-msg-pop{0%{opacity:0;transform:translateX(-6px)}100%{opacity:1;transform:none}}`}</style>
    </div>
  );
}
