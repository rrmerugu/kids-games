import { useEffect, useRef, useState } from 'react';
import { cn } from '@invana/ui';

/** Bright, kid-friendly confetti colours (no assets — just coloured shapes). */
const COLORS = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#818cf8', '#f472b6'];

/** Inline CSS vars alongside the standard properties. */
type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

interface Piece {
  id: number;
  bg: string;
  size: number;
  round: boolean;
  delay: number;
  duration: number;
  /** rain: horizontal start (%) + drift/spin. */
  left: number;
  drift: number;
  spin: number;
  /** burst: radial offset from the origin. */
  dx: number;
  dy: number;
}

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, id) => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 40 + Math.random() * 120;
    return {
      id,
      bg: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      size: 7 + Math.random() * 9,
      round: Math.random() < 0.5,
      delay: Math.random() * 240,
      duration: 1300 + Math.random() * 1500,
      left: Math.random() * 100,
      drift: (Math.random() - 0.5) * 260,
      spin: Math.random() * 720 - 360,
      dx: Math.cos(angle) * radius,
      dy: Math.sin(angle) * radius,
    };
  });
}

const KEYFRAMES = `
@keyframes kg-confetti-fall {
  0% { transform: translate3d(0, -10%, 0) rotate(0deg); opacity: 0; }
  8% { opacity: 1; }
  100% { transform: translate3d(var(--kg-drift), 108vh, 0) rotate(var(--kg-spin)); opacity: 1; }
}
@keyframes kg-confetti-burst {
  0% { transform: translate(-50%, -50%) scale(.5) rotate(0deg); opacity: 1; }
  100% { transform: translate(calc(-50% + var(--kg-dx)), calc(-50% + var(--kg-dy))) scale(1) rotate(var(--kg-spin)); opacity: 0; }
}
`;

export interface ConfettiProps {
  /**
   * Fire a fresh burst whenever this changes to a non-null value (e.g. the id of
   * the winning event). Pass `null` for "nothing to celebrate right now".
   */
  trigger: number | string | null;
  /** Pieces per burst (defaults: 90 for rain, 16 for burst). */
  count?: number;
  reducedMotion?: boolean;
  /** `rain` falls from the top (level complete); `burst` pops outward (a correct answer). */
  variant?: 'rain' | 'burst';
  /** Cover the whole viewport (fixed) instead of the nearest positioned parent. */
  fullscreen?: boolean;
}

/**
 * A self-contained celebratory confetti overlay — no assets, just animated
 * coloured shapes. Purely decorative (`aria-hidden`, `pointer-events-none`) and
 * fully suppressed under `reducedMotion`. Mount it inside a positioned parent
 * (or pass `fullscreen`) and bump `trigger` to celebrate.
 */
export function Confetti({
  trigger,
  count,
  reducedMotion,
  variant = 'rain',
  fullscreen,
}: ConfettiProps): React.JSX.Element | null {
  const [burst, setBurst] = useState<{ key: number; pieces: Piece[] } | null>(null);
  const keyRef = useRef(0);
  const n = count ?? (variant === 'rain' ? 90 : 16);

  useEffect(() => {
    if (trigger == null || reducedMotion) return;
    const pieces = makePieces(n);
    const key = ++keyRef.current;
    setBurst({ key, pieces });
    const maxMs = Math.max(...pieces.map((p) => p.delay + p.duration)) + 250;
    const t = window.setTimeout(() => {
      setBurst((b) => (b && b.key === key ? null : b));
    }, maxMs);
    return () => window.clearTimeout(t);
  }, [trigger, reducedMotion, n]);

  if (!burst) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none',
        fullscreen ? 'fixed inset-0 z-[120] overflow-hidden' : 'absolute inset-0 z-20',
        variant === 'rain' && !fullscreen && 'overflow-hidden',
      )}
    >
      <style>{KEYFRAMES}</style>
      {burst.pieces.map((p) => {
        const common: CSSVars = {
          position: 'absolute',
          width: p.size,
          height: p.round ? p.size : p.size * 0.5,
          background: p.bg,
          borderRadius: p.round ? '50%' : '1px',
          '--kg-spin': `${p.spin}deg`,
        };
        const style: CSSVars =
          variant === 'rain'
            ? {
                ...common,
                top: '-8%',
                left: `${p.left}%`,
                '--kg-drift': `${p.drift}px`,
                animation: `kg-confetti-fall ${p.duration}ms ${p.delay}ms cubic-bezier(.2,.6,.4,1) both`,
              }
            : {
                ...common,
                top: '50%',
                left: '50%',
                '--kg-dx': `${p.dx}px`,
                '--kg-dy': `${p.dy}px`,
                animation: `kg-confetti-burst ${p.duration}ms ${p.delay}ms cubic-bezier(.15,.7,.3,1) both`,
              };
        return <span key={p.id} style={style} />;
      })}
    </div>
  );
}
