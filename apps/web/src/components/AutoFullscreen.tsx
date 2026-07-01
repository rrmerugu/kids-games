import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Every screen except Home runs full-screen. This is an SPA, so full-screen —
 * entered via the toggle on the Home page — persists across route changes, and
 * games/level maps/settings simply inherit it.
 *
 * As a belt-and-braces measure we also try to enter full-screen on arrival at any
 * non-Home route. That succeeds when the navigation came from a tap/click (still
 * inside the browser's transient user-activation window) and is silently ignored
 * otherwise — browsers require a user gesture, so a hard refresh or deep-link
 * can't force it. Rendered once, near the router root; renders nothing.
 */
export function AutoFullscreen(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (pathname === '/') return;
    if (document.fullscreenElement) return;
    // Best-effort — swallow the rejection when there's no active user gesture.
    void document.documentElement.requestFullscreen?.().catch(() => {});
  }, [pathname]);

  return null;
}
