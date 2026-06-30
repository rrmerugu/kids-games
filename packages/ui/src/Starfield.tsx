import { cn } from '@invana/ui';

const STARFIELD_KEYFRAMES = `
@keyframes kg-twinkle { 0%,100% { opacity: .25; transform: scale(.9); } 50% { opacity: 1; transform: scale(1.15); } }
`;

/** Fixed (deterministic) star positions so the field doesn't reshuffle on render. */
const STARS = [
  { top: '6%', left: '10%', size: 12, delay: 0 },
  { top: '12%', left: '34%', size: 8, delay: 0.6 },
  { top: '9%', left: '62%', size: 10, delay: 1.2 },
  { top: '16%', left: '85%', size: 12, delay: 0.3 },
  { top: '28%', left: '20%', size: 8, delay: 0.9 },
  { top: '33%', left: '50%', size: 10, delay: 1.4 },
  { top: '26%', left: '78%', size: 9, delay: 0.5 },
  { top: '45%', left: '12%', size: 11, delay: 1.1 },
  { top: '52%', left: '40%', size: 8, delay: 0.2 },
  { top: '48%', left: '70%', size: 12, delay: 0.8 },
  { top: '62%', left: '88%', size: 9, delay: 1.5 },
  { top: '70%', left: '24%', size: 10, delay: 0.4 },
  { top: '74%', left: '56%', size: 8, delay: 1.0 },
  { top: '84%', left: '14%', size: 12, delay: 0.7 },
  { top: '88%', left: '74%', size: 9, delay: 1.3 },
  { top: '92%', left: '44%', size: 8, delay: 0.5 },
] as const;

/** A twinkling starfield + a planet, absolutely filling its positioned parent. */
export function Starfield({
  reducedMotion,
  className,
}: {
  reducedMotion?: boolean;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <style>{STARFIELD_KEYFRAMES}</style>
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: s.top,
            left: s.left,
            width: s.size / 2,
            height: s.size / 2,
            animation: reducedMotion ? undefined : `kg-twinkle ${2 + s.delay}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <span className="absolute right-6 top-6 text-2xl">🪐</span>
    </div>
  );
}
