import { cn } from '@invana/ui';

/** Whose turn it is in a turn-based game. */
export type Turn = 'watch' | 'go';

export interface TurnBannerProps {
  turn: Turn | null;
}

/**
 * A big, clear "whose turn" banner for turn-based games (e.g. Simon): the game
 * shows `👀 Watch!` while it plays, then `👆 Your turn!` when the child should
 * act. Overlaid on the play area; non-interactive.
 */
export function TurnBanner({ turn }: TurnBannerProps): React.JSX.Element | null {
  if (!turn) return null;
  const watch = turn === 'watch';
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center" aria-hidden="true">
      <style>{`@keyframes kg-turn-pop{0%{opacity:0;transform:translateY(-8px) scale(.9)}100%{opacity:1;transform:none}}`}</style>
      <div
        key={turn}
        style={{ animation: 'kg-turn-pop .3s ease-out' }}
        className={cn(
          'rounded-full px-6 py-2 text-2xl font-extrabold shadow-lg',
          watch ? 'bg-amber-400 text-amber-950' : 'bg-emerald-500 text-white',
        )}
      >
        {watch ? '👀 Watch!' : '👆 Your turn!'}
      </div>
    </div>
  );
}
