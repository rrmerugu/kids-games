import type { ReactNode } from 'react';
import { GlossyButton } from './GlossyButton.js';

export interface GameHudProps {
  /** Short status, e.g. "🐶 Level 2". */
  title: string;
  onBack: () => void;
  onRestart: () => void;
  /** Extra status widgets (progress, attempts, stopwatch). */
  children?: ReactNode;
  /** Global section switcher shown on the right (e.g. <NavIcons/>). */
  nav?: ReactNode;
}

/**
 * Top bar for a game — a normal flex row (not an overlay) above the board, with
 * glossy back/restart buttons, a readable title chip, room for status widgets
 * (counts, stopwatch), and an optional global section switcher on the right.
 */
export function GameHud({ title, onBack, onRestart, children, nav }: GameHudProps): React.JSX.Element {
  return (
    <div className="z-10 flex shrink-0 flex-wrap items-center justify-between gap-2 px-3 py-2">
      <GlossyButton icon="⬅️" label="Back" color="sky" onClick={onBack} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-12 items-center rounded-full bg-white/10 px-4 text-lg font-bold text-white shadow ring-1 ring-white/20 backdrop-blur">
          {title}
        </span>
        {children}
      </div>

      <div className="flex items-center gap-2">
        {nav}
        <GlossyButton icon="🔄" label="Restart" color="violet" onClick={onRestart} />
      </div>
    </div>
  );
}
