import { cn, Progress } from '@invana/ui';

export interface GameTileProps {
  emoji: string;
  label: string;
  /** Tailwind background class(es), e.g. `'bg-rose-400'`. */
  color: string;
  onClick: () => void;
  /** Optional 0–100 progress shown as a bar under the label. */
  progress?: number;
}

/** A big, friendly home-screen game button. No reading required to recognise it. */
export function GameTile({ emoji, label, color, onClick, progress }: GameTileProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-3xl p-4 shadow-xl',
        'transition-transform duration-150 hover:scale-[1.03] active:scale-95',
        color,
      )}
    >
      <span className="text-5xl drop-shadow-sm">{emoji}</span>
      <span className="text-lg font-extrabold text-white drop-shadow">{label}</span>
      {progress !== undefined && (
        <Progress value={progress} className="h-2 w-3/4 bg-white/40" />
      )}
    </button>
  );
}
