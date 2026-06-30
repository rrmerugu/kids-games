import type { ReactNode } from 'react';
import { Badge, Button } from '@invana/ui';

export interface GameHudProps {
  /** Short status, e.g. "🐶 Level 2". */
  title: string;
  onBack: () => void;
  onRestart: () => void;
  /** Extra status widgets (progress, attempts, "show again" button). */
  children?: ReactNode;
}

/**
 * Floating top bar over the canvas. Uses `pointer-events-none` on the bar so the
 * canvas stays interactive, re-enabling pointer events only on the controls.
 */
export function GameHud({ title, onBack, onRestart, children }: GameHudProps): React.JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 p-3">
      <Button
        variant="secondary"
        size="lg"
        className="pointer-events-auto h-12 w-12 rounded-full p-0 text-2xl shadow"
        aria-label="Back"
        onClick={onBack}
      >
        ⬅️
      </Button>

      <div className="pointer-events-auto flex items-center gap-2">
        <Badge variant="secondary" className="px-3 py-1.5 text-lg shadow">
          {title}
        </Badge>
        {children}
      </div>

      <Button
        variant="secondary"
        size="lg"
        className="pointer-events-auto h-12 w-12 rounded-full p-0 text-2xl shadow"
        aria-label="Restart"
        onClick={onRestart}
      >
        🔄
      </Button>
    </div>
  );
}
