import { useEffect } from 'react';
import { useProgress } from '@kids/storage';

const RING_COUNT = 3;
const RING_SIZE = 30; // px, before scaling

/**
 * Whole-screen tap feedback: every pointer-down spawns expanding concentric
 * circles at the touch point, so a child gets an immediate, satisfying "I
 * touched it" signal anywhere on the screen — not just on buttons.
 *
 * Implemented imperatively against `document.body` with the Web Animations API
 * so it never depends on stylesheet load order, Tailwind purging, or React
 * stacking contexts — the rings always paint above everything. Pointer events
 * cover both touch and mouse. Disabled under the "Less motion" setting.
 */
export function TapRipple(): null {
  const reducedMotion = useProgress((s) => s.settings.reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;

    const layer = document.createElement('div');
    Object.assign(layer.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: '2147483646',
    });
    document.body.appendChild(layer);

    const onPointerDown = (e: PointerEvent): void => {
      const color = document.documentElement.classList.contains('dark') ? '#7dd3fc' : '#38bdf8';
      for (let i = 0; i < RING_COUNT; i++) {
        const ring = document.createElement('div');
        Object.assign(ring.style, {
          position: 'absolute',
          left: `${e.clientX - RING_SIZE / 2}px`,
          top: `${e.clientY - RING_SIZE / 2}px`,
          width: `${RING_SIZE}px`,
          height: `${RING_SIZE}px`,
          borderRadius: '9999px',
          border: `3px solid ${color}`,
          opacity: '0',
        });
        layer.appendChild(ring);
        const anim = ring.animate(
          [
            { transform: 'scale(0.3)', opacity: 0.7 },
            { transform: 'scale(4.5)', opacity: 0 },
          ],
          { duration: 600, delay: i * 80, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', fill: 'forwards' },
        );
        anim.onfinish = (): void => ring.remove();
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      layer.remove();
    };
  }, [reducedMotion]);

  return null;
}
