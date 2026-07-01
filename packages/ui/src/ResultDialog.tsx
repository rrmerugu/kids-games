import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@invana/ui';
import { formatDuration, stickerById } from '@kids/gamification';
import { GlossyButton } from './GlossyButton.js';
import { StarRating } from './StarRating.js';

export interface ResultDialogProps {
  open: boolean;
  won: boolean;
  stars: number;
  /** Time taken for the round, in ms (shown when provided). */
  durationMs?: number;
  /** Newly-earned sticker ids (resolved to emoji/label for display). */
  newStickers: readonly string[];
  onPlayAgain: () => void;
  /** Omit to hide the "Next" button (e.g. last level, or a loss). */
  onNext?: () => void;
  onHome: () => void;
  /** Per-game analytics control, shown top-right (e.g. <GameAnalyticsButton/>). */
  analytics?: ReactNode;
}

/** End-of-round celebration (or gentle retry prompt on a loss). */
export function ResultDialog({
  open,
  won,
  stars,
  durationMs,
  newStickers,
  onPlayAgain,
  onNext,
  onHome,
  analytics,
}: ResultDialogProps): React.JSX.Element {
  return (
    <Dialog open={open}>
      {/* Force dark theme to match the space game scene, and hide the (non-functional)
          built-in close button via the direct-child-button selector. */}
      <DialogContent className="dark relative rounded-3xl text-center sm:max-w-sm [&>button]:hidden">

        {analytics && <div className="absolute right-4 top-4">{analytics}</div>}

        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-extrabold">
            {won ? 'Great job! 🎉' : 'Try again! 💪'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <span className="text-7xl">{won ? '🌟' : '🙂'}</span>
          {won && <StarRating value={stars} size="lg" />}
          {durationMs !== undefined && (
            <div className="text-lg font-bold text-slate-500 dark:text-slate-300">
              ⏱ {formatDuration(durationMs)}
            </div>
          )}

          {newStickers.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-yellow-50 p-3 dark:bg-yellow-900/30">
              {newStickers.map((id) => {
                const s = stickerById(id);
                if (!s) return null;
                return (
                  <div key={id} className="flex flex-col items-center">
                    <span className="text-4xl">{s.emoji}</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {won && onNext && (
            <GlossyButton
              icon="▶️"
              label="Next"
              color="emerald"
              className="h-14 w-full justify-center text-xl"
              onClick={onNext}
            />
          )}
          <GlossyButton
            icon="🔄"
            label="Play again"
            color="violet"
            className="h-14 w-full justify-center text-xl"
            onClick={onPlayAgain}
          />
          <GlossyButton
            icon="🏠"
            label="Home"
            color="slate"
            className="h-12 w-full justify-center"
            onClick={onHome}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
