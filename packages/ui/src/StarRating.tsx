import { cn } from '@invana/ui';

export interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { sm: 'text-base', md: 'text-2xl', lg: 'text-5xl' } as const;

/** Filled / empty stars, e.g. ★★☆. */
export function StarRating({ value, max = 3, size = 'md', className }: StarRatingProps): React.JSX.Element {
  return (
    <span
      className={cn('inline-flex gap-1 leading-none', SIZES[size], className)}
      aria-label={`${value} of ${max} stars`}
      role="img"
    >
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? 'text-yellow-400' : 'text-slate-300'}>
          ★
        </span>
      ))}
    </span>
  );
}
