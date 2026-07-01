import { useEffect, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { IconButton } from './IconButton.js';

/**
 * Toggles the browser into (and out of) full-screen so a game can fill the whole
 * display — handy on a monitor/TV or tablet. Self-contained: it drives the native
 * Fullscreen API on the document root and keeps its icon in sync via the
 * `fullscreenchange` event (so the OS/Esc exit is reflected too).
 */
export function FullscreenButton(): React.JSX.Element {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== 'undefined' && document.fullscreenElement !== null,
  );

  useEffect(() => {
    const onChange = (): void => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = (): void => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  };

  return (
    <IconButton
      icon={isFullscreen ? Minimize : Maximize}
      label={isFullscreen ? 'Exit full screen' : 'Full screen'}
      tone="rose"
      onClick={toggle}
    />
  );
}
