import type { ReactNode } from 'react';
import { Button } from '@invana/ui';

interface GlossyIconButtonProps {
  /** Emoji (or any node) shown as the icon. */
  children: ReactNode;
  label: string;
  onClick: () => void;
}

/**
 * Round, glossy icon button: a glass-like vertical gradient with a top sheen
 * (`before`), inset highlight + drop shadow for depth. Keeps the existing emoji
 * glyphs; the global `:active` press animation supplies the tap feedback.
 */
export function GlossyIconButton({ children, label, onClick }: GlossyIconButtonProps): React.JSX.Element {
  return (
    <Button
      variant="secondary"
      size="lg"
      aria-label={label}
      onClick={onClick}
      className={[
        'relative h-12 w-12 overflow-hidden rounded-full p-0 text-2xl',
        'border border-white/70 dark:border-white/10',
        'bg-gradient-to-b from-white to-slate-200 hover:to-slate-300',
        'dark:from-slate-600 dark:to-slate-800 dark:hover:to-slate-700',
        'shadow-[0_4px_10px_rgba(15,23,42,0.20),inset_0_1px_0_rgba(255,255,255,0.9)]',
        'dark:shadow-[0_4px_10px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.18)]',
        "before:pointer-events-none before:absolute before:inset-x-1 before:top-0.5 before:h-1/2",
        "before:rounded-full before:bg-gradient-to-b before:from-white/85 before:to-transparent before:content-['']",
      ].join(' ')}
    >
      <span className="relative z-10">{children}</span>
    </Button>
  );
}
