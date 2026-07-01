import type { ReactNode } from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@invana/ui';
import { GlossyButton } from './GlossyButton.js';

export interface GameHudProps {
  /** Name of the game, shown as the first chip in the middle group (e.g. "🐶 Match"). */
  gameName?: string;
  /** Short status, e.g. "Level 2". */
  title: string;
  onBack: () => void;
  onRestart: () => void;
  /** Extra status widgets (progress, attempts, stopwatch). */
  children?: ReactNode;
  /** Per-game analytics control shown on the right (e.g. <GameAnalyticsButton/>). */
  analytics?: ReactNode;
  /** Global section switcher shown on the right (e.g. <NavIcons/>). */
  nav?: ReactNode;
  /** Home shortcut shown as the first item on the left, beside the game name. */
  home?: ReactNode;
}

/**
 * Top bar for a game — a normal flex row (not an overlay) above the board, with
 * glossy back/restart buttons, a readable title chip, room for status widgets
 * (counts, stopwatch), and an optional global section switcher on the right.
 */
export function GameHud({ gameName, title, onBack, onRestart, children, analytics, nav, home }: GameHudProps): React.JSX.Element {
  const [confirmRestart, setConfirmRestart] = useState(false);

  return (
    <div className="z-10 flex shrink-0 flex-wrap items-center justify-between gap-2 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {home}
        <GlossyButton icon="⬅️" label="Back" color="sky" onClick={onBack} />
        {gameName && (
          <span className="inline-flex h-12 items-center rounded-full bg-gradient-to-b from-indigo-500 to-indigo-700 px-4 text-lg font-extrabold text-white shadow ring-1 ring-white/30 backdrop-blur">
            {gameName}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-12 items-center rounded-full bg-white/10 px-4 text-lg font-bold text-white shadow ring-1 ring-white/20 backdrop-blur">
          {title}
        </span>
        {children}
      </div>

      <div className="flex items-center gap-2">
        {analytics}
        {nav}
        <GlossyButton icon="🔄" label="Restart" color="violet" onClick={() => setConfirmRestart(true)} />
      </div>

      <Dialog open={confirmRestart} onOpenChange={setConfirmRestart}>
        {/* Force dark theme to match the game scene; hide the built-in close button. */}
        <DialogContent className="dark rounded-3xl text-center sm:max-w-sm [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-extrabold">
              Restart the game? 🔄
            </DialogTitle>
          </DialogHeader>

          <DialogFooter className="flex-row justify-center gap-3 sm:justify-center">
            <GlossyButton
              icon="✅"
              label="Yes"
              color="emerald"
              className="h-14 min-w-28 justify-center text-xl"
              onClick={() => {
                setConfirmRestart(false);
                onRestart();
              }}
            />
            <GlossyButton
              icon="❌"
              label="No"
              color="rose"
              className="h-14 min-w-28 justify-center text-xl"
              onClick={() => setConfirmRestart(false)}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
