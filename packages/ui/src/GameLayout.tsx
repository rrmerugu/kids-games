import type { ReactNode } from 'react';
import { Buddy, type BuddyPosition, type FeedbackState } from './Buddy.js';
import { MessageFeed } from './MessageFeed.js';
import { Starfield } from './Starfield.js';

export interface GameLayoutProps {
  /** Which side Buddy sits on, or `off` to hide him. */
  side: BuddyPosition;
  feedback: FeedbackState;
  reducedMotion?: boolean;
  /** Per-game idle hint shown in Buddy's bubble. */
  idleMessage?: string;
  character?: string;
  /** If set, Buddy shows a "Help me!" button that calls this (hint / replay). */
  onHelp?: () => void;
  /** Header bar above the play area. */
  hud?: ReactNode;
  /** The game canvas (rendered transparent over the shared space scene). */
  children: ReactNode;
}

/**
 * One continuous space scene: a shared starfield background spanning the whole
 * play area, with the game board (a transparent canvas) and Buddy living on the
 * *same* surface side by side — game ~70%, Buddy ~30%, no divider or boxed
 * panel. Buddy is right there next to the content, not in a sidebar.
 */
export function GameLayout({
  side,
  feedback,
  reducedMotion,
  // idleMessage is accepted for back-compat but no longer rendered: the event
  // timeline is icon-based (no sentences) and Buddy speaks his encouragement.
  character,
  onHelp,
  hud,
  children,
}: GameLayoutProps): React.JSX.Element {
  // Tolerant of legacy values: hide on 'off', left on 'left', else right.
  const onLeft = side === 'left';
  const visible = side !== 'off';

  const buddyColumn = visible ? (
    // Phones: a compact bottom strip (row, capped height). Tablets/desktop (sm+):
    // the full side panel beside the board, ~30% wide.
    <div className="z-10 order-2 flex max-h-[32vh] w-full shrink-0 flex-row items-center justify-center gap-3 overflow-hidden p-2 sm:order-none sm:h-full sm:max-h-none sm:w-[30%] sm:flex-col sm:p-3">
      <Buddy latest={feedback.latest} reducedMotion={reducedMotion} character={character} />
      <MessageFeed events={feedback.events} tries={feedback.tries} reducedMotion={reducedMotion} />
      {onHelp && (
        <button
          type="button"
          onClick={onHelp}
          className="w-auto max-w-[14rem] shrink-0 rounded-2xl bg-amber-400 px-3 py-2 text-base font-extrabold text-amber-950 shadow-lg transition-transform hover:scale-105 active:scale-95 sm:w-full sm:px-4 sm:py-3 sm:text-lg"
        >
          🙋 <span className="hidden sm:inline">Help me!</span>
        </button>
      )}
    </div>
  ) : null;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-indigo-950 to-slate-900">
      <Starfield reducedMotion={reducedMotion} />
      {/* Header spans the full width, above the game + Buddy row. */}
      {hud && <div className="z-10 shrink-0">{hud}</div>}
      {/* Phones stack (game on top, Buddy strip below); sm+ sits them side by side. */}
      <div className="z-10 flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
        {onLeft && buddyColumn}
        {/* Play area: transparent canvas fills the remaining space. */}
        <div className="relative order-1 min-h-0 flex-1 overflow-hidden sm:order-none">{children}</div>
        {!onLeft && buddyColumn}
      </div>
    </div>
  );
}
