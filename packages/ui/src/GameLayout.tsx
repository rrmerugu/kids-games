import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@invana/ui';
import { Buddy, type BuddyPosition, type FeedbackState } from './Buddy.js';
import { MessageFeed } from './MessageFeed.js';
import { Starfield } from './Starfield.js';

/**
 * Stack the scene (game on top, Buddy as a bottom strip) only on a narrow
 * *portrait* screen — i.e. a phone held upright. Any landscape screen (laptops,
 * Macs, iPads, a TV, a phone turned sideways) keeps the side-by-side layout, so
 * a small or zoomed desktop window still gets the centred board, not the phone
 * layout. Orientation-based, not a blanket width breakpoint.
 */
const STACK_QUERY = '(max-width: 639px) and (orientation: portrait)';

function useStackedLayout(): boolean {
  const [stacked, setStacked] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(STACK_QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(STACK_QUERY);
    const update = (): void => setStacked(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return stacked;
}

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
  const stacked = useStackedLayout();

  const buddyColumn = visible ? (
    // Portrait phone: a compact bottom strip (row, capped height). Everywhere
    // else: the full side panel beside the board, ~30% wide.
    <div
      className={cn(
        'z-10 flex shrink-0 items-center justify-center gap-3 overflow-hidden',
        stacked ? 'order-2 max-h-[32vh] w-full flex-row p-2' : 'h-full w-[30%] flex-col p-3',
      )}
    >
      <Buddy latest={feedback.latest} reducedMotion={reducedMotion} character={character} />
      <MessageFeed events={feedback.events} tries={feedback.tries} reducedMotion={reducedMotion} />
      {onHelp && (
        <button
          type="button"
          onClick={onHelp}
          className={cn(
            'max-w-[14rem] rounded-2xl bg-amber-400 font-extrabold text-amber-950 shadow-lg transition-transform hover:scale-105 active:scale-95',
            stacked ? 'w-auto shrink-0 px-3 py-2 text-base' : 'w-full px-4 py-3 text-lg',
          )}
        >
          🙋{!stacked && <span> Help me!</span>}
        </button>
      )}
    </div>
  ) : null;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-indigo-950 to-slate-900">
      <Starfield reducedMotion={reducedMotion} />
      {/* Header spans the full width, above the game + Buddy row. */}
      {hud && <div className="z-10 shrink-0">{hud}</div>}
      {/* Portrait phone stacks (game on top, Buddy strip below); everything else
          sits them side by side with the board centred in its column. */}
      <div className={cn('z-10 flex min-h-0 flex-1 overflow-hidden', stacked ? 'flex-col' : 'flex-row')}>
        {onLeft && buddyColumn}
        {/* Play area: transparent canvas fills the remaining space. */}
        <div className={cn('relative min-h-0 flex-1 overflow-hidden', stacked && 'order-1')}>{children}</div>
        {!onLeft && buddyColumn}
      </div>
    </div>
  );
}
