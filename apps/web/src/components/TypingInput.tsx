import { useEffect, useState } from 'react';

/** True on touch-first devices (phones, tablets) that need an on-screen keyboard. */
function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = (): void => setCoarse(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return coarse;
}

/**
 * Brings up the device's on-screen keyboard for the typing games on touch
 * devices. Those games listen for `keydown` on `window` — built for a physical
 * keyboard — but a phone shows its soft keyboard only when a focusable, editable
 * element is focused, and nothing here is.
 *
 * So we lay a full-size transparent <input> over the (display-only) game canvas.
 * Tapping it focuses it and opens the keyboard; each character the child types is
 * re-dispatched as a synthetic `window` keydown, so the game logic runs unchanged.
 * The real keydown from the input is stopped from reaching `window`, so devices
 * with a hardware keyboard (e.g. an iPad + Magic Keyboard) don't double-count.
 *
 * Rendered only on touch devices — desktops keep using their physical keyboard.
 * Place it as a sibling of <GameCanvas> inside <GameLayout> so it overlays only
 * the play area (Buddy + HUD stay tappable).
 */
export function TypingInput(): React.JSX.Element | null {
  const coarse = useCoarsePointer();
  const [typing, setTyping] = useState(false);

  if (!coarse) return null;

  const handleInput = (e: React.FormEvent<HTMLInputElement>): void => {
    for (const ch of e.currentTarget.value) {
      if (ch.length === 1) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
      }
    }
    // Never accumulate — the input stays empty so it always reads the next char.
    e.currentTarget.value = '';
  };

  return (
    <>
      <input
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        aria-label="Tap and type"
        onInput={handleInput}
        // Route everything through onInput; keep the input's own keydown off window
        // so a paired hardware keyboard isn't counted twice.
        onKeyDown={(e) => e.stopPropagation()}
        onFocus={() => setTyping(true)}
        onBlur={() => setTyping(false)}
        // 16px avoids iOS's focus-zoom; transparent text/caret keep it invisible.
        className="absolute inset-0 z-20 h-full w-full cursor-pointer bg-transparent text-[16px] text-transparent caret-transparent outline-none"
      />
      {!typing && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 animate-pulse rounded-full bg-white/90 px-5 py-3 text-lg font-extrabold text-indigo-700 shadow-lg dark:bg-slate-100">
          ⌨️ Tap to type
        </div>
      )}
    </>
  );
}
