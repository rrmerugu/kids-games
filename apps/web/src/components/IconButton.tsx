import type { LucideIcon } from 'lucide-react';
import { Button } from '@invana/ui';

/** Soft pastel tones — a light tinted disc with a deeper icon of the same hue. */
export type IconTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'slate';

const TONES: Record<IconTone, string> = {
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300',
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300',
  slate: 'bg-slate-200 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300',
};

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  tone: IconTone;
  onClick: () => void;
}

/**
 * Flat, round icon button: a soft pastel disc with a clean Lucide line icon — no
 * gloss, no heavy shadow. The global `:active` press animation supplies tap
 * feedback. Big enough (44px) for small fingers.
 */
export function IconButton({ icon: Icon, label, tone, onClick }: IconButtonProps): React.JSX.Element {
  return (
    <Button
      variant="ghost"
      size="lg"
      aria-label={label}
      onClick={onClick}
      className={`h-11 w-11 rounded-full border-0 p-0 shadow-none transition-transform hover:scale-105 ${TONES[tone]}`}
    >
      <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden />
    </Button>
  );
}
