import type { ReactNode } from 'react';
import { cn } from '@invana/ui';

export type GlossyColor = 'slate' | 'indigo' | 'violet' | 'amber' | 'emerald' | 'sky' | 'rose';

const GRADIENTS: Record<GlossyColor, string> = {
  slate: 'from-slate-500 to-slate-700',
  indigo: 'from-indigo-400 to-indigo-600',
  violet: 'from-violet-400 to-violet-600',
  amber: 'from-amber-400 to-amber-600',
  emerald: 'from-emerald-400 to-emerald-600',
  sky: 'from-sky-400 to-sky-600',
  rose: 'from-rose-400 to-rose-600',
};

export interface GlossyButtonProps {
  icon?: ReactNode;
  label?: ReactNode;
  color?: GlossyColor;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * A chunky, glossy kid-friendly button: colour gradient + a top sheen highlight,
 * bold white icon/label, springy press. Readable on the dark space scene.
 */
export function GlossyButton({
  icon,
  label,
  color = 'indigo',
  onClick,
  ariaLabel,
  className,
}: GlossyButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
      className={cn(
        'relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full px-5 text-lg font-extrabold text-white shadow-lg ring-1 ring-white/30 transition-transform duration-150 hover:scale-[1.04] active:scale-95',
        'bg-gradient-to-b',
        GRADIENTS[color],
        className,
      )}
    >
      {/* glossy sheen */}
      <span
        className="pointer-events-none absolute inset-x-1.5 top-1 h-2/5 rounded-full bg-white/30 blur-[1px]"
        aria-hidden="true"
      />
      {icon !== undefined && <span className="relative text-xl leading-none">{icon}</span>}
      {label !== undefined && <span className="relative drop-shadow-sm">{label}</span>}
    </button>
  );
}
