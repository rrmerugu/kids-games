import type { ReactNode } from 'react';
import { GlossyButton } from './GlossyButton.js';

export interface GameHudProps {
  /** Short status, e.g. "🐶 Level 2". */
  title: string;
  onBack: () => void;
  onRestart: () => void;
  /** Extra status widgets (progress, attempts, stopwatch). */
  children?: ReactNode;
}

/**
 * Top bar for a game — a normal flex row (not an overlay) above the board, with
 * glossy back/restart buttons, a readable title chip, and room for status
 * widgets (counts, stopwatch).
 */
export function GameHud({ title, onBack, onRestart, children }: GameHudProps): React.JSX.Element {
  return (
    <div className="z-10 flex shrink-0 flex-wrap items-center justify-between gap-2 px-3 py-2">
      <GlossyButton icon="⬅️" label="Back" color="sky" onClick={onBack} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-12 items-center rounded-full bg-white/10 px-4 text-lg font-bold text-white shadow ring-1 ring-white/20 backdrop-blur">
          {title}
        </span>
        {children}
      </div>

      <GlossyButton icon="🔄" label="Restart" color="violet" onClick={onRestart} />
    </div>
  );
}
