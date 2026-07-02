import { useEffect, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@invana/ui';
import { formatDuration, stickerById } from '@kids/gamification';
import { Confetti } from './Confetti.js';
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
  /** Suppress the winning confetti celebration for motion-sensitive players. */
  reducedMotion?: boolean;
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
  reducedMotion,
}: ResultDialogProps): React.JSX.Element {
  // Pressing Enter takes the child straight to the next level (or replays the
  // last one), so a keyboard player never has to reach for the mouse. Stats stay
  // on-screen in the left column — Enter just advances.
  useEffect(() => {
    if (!open) return;
    const advance = won && onNext ? onNext : onPlayAgain;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      e.stopPropagation();
      advance();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [open, won, onNext, onPlayAgain]);

  return (
    <Dialog open={open}>
      {/* Full-screen confetti rains down to celebrate completing the level. */}
      <Confetti trigger={open && won ? 1 : null} variant="rain" fullscreen reducedMotion={reducedMotion} />
      {/* Force dark theme to match the space game scene, and hide the (non-functional)
          built-in close button via the direct-child-button selector. */}
      <DialogContent className="dark rounded-3xl sm:max-w-lg [&>button]:hidden">

        {analytics && <div className="absolute right-4 top-4">{analytics}</div>}

        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-extrabold">
            {won ? 'Great job! 🎉' : 'Try again! 💪'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 sm:items-center">
          {/* Left column — how this level went. */}
          <div className="flex flex-col items-center gap-3 text-center">
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

          {/* Right column — big icon+word buttons (Enter = Next). */}
          <div className="flex flex-col gap-2">
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
              label="Replay"
              color="violet"
              className="h-14 w-full justify-center text-xl"
              onClick={onPlayAgain}
            />
            <GlossyButton
              icon="🏠"
              label="Home"
              color="slate"
              className="h-14 w-full justify-center text-xl"
              onClick={onHome}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
