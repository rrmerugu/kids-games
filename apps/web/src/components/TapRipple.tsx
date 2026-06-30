import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@kids/storage';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const RIPPLE_MS = 650;

/**
 * Whole-screen tap feedback: every pointer-down spawns expanding concentric
 * circles at the touch point, so a child gets an immediate, satisfying "I
 * touched it" signal anywhere on the screen — not just on buttons. Pointer
 * events cover both touch and mouse. Disabled under the "Less motion" setting.
 */
export function TapRipple(): React.JSX.Element | null {
  const reducedMotion = useProgress((s) => s.settings.reducedMotion);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;
    const onPointerDown = (e: PointerEvent): void => {
      const id = nextId.current++;
      setRipples((rs) => [...rs, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setRipples((rs) => rs.filter((r) => r.id !== id));
      }, RIPPLE_MS);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden text-sky-400 dark:text-sky-300">
      {ripples.map((r) => (
        <span key={r.id} className="tap-ripple" style={{ left: r.x, top: r.y }}>
          <span className="tap-ripple-ring" />
          <span className="tap-ripple-ring" style={{ animationDelay: '80ms' }} />
          <span className="tap-ripple-ring" style={{ animationDelay: '160ms' }} />
        </span>
      ))}
    </div>
  );
}
