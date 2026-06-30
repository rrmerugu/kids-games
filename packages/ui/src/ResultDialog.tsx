import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@invana/ui';
import { stickerById } from '@kids/gamification';
import { StarRating } from './StarRating.js';

export interface ResultDialogProps {
  open: boolean;
  won: boolean;
  stars: number;
  /** Newly-earned sticker ids (resolved to emoji/label for display). */
  newStickers: readonly string[];
  onPlayAgain: () => void;
  /** Omit to hide the "Next" button (e.g. last level, or a loss). */
  onNext?: () => void;
  onHome: () => void;
}

/** End-of-round celebration (or gentle retry prompt on a loss). */
export function ResultDialog({
  open,
  won,
  stars,
  newStickers,
  onPlayAgain,
  onNext,
  onHome,
}: ResultDialogProps): React.JSX.Element {
  return (
    <Dialog open={open}>
      <DialogContent className="rounded-3xl text-center sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-extrabold">
            {won ? 'Great job! 🎉' : 'Try again! 💪'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <span className="text-7xl">{won ? '🌟' : '🙂'}</span>
          {won && <StarRating value={stars} size="lg" />}

          {newStickers.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-yellow-50 p-3">
              {newStickers.map((id) => {
                const s = stickerById(id);
                if (!s) return null;
                return (
                  <div key={id} className="flex flex-col items-center">
                    <span className="text-4xl">{s.emoji}</span>
                    <span className="text-xs font-semibold text-slate-600">{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {won && onNext && (
            <Button size="lg" className="h-14 w-full text-xl" onClick={onNext}>
              Next ▶️
            </Button>
          )}
          <Button
            size="lg"
            variant={won && onNext ? 'secondary' : 'default'}
            className="h-14 w-full text-xl"
            onClick={onPlayAgain}
          >
            Play again 🔄
          </Button>
          <Button size="lg" variant="ghost" className="h-12 w-full text-lg" onClick={onHome}>
            Home 🏠
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
