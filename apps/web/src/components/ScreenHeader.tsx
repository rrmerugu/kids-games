import type { ReactNode } from 'react';
import { NavIcons } from './NavIcons.js';
import { HomeButton } from './HomeButton.js';
import { FullscreenButton } from './FullscreenButton.js';

export interface ScreenHeaderProps {
  /** The screen title, e.g. "Settings ⚙️" or an emoji + label node. */
  title: ReactNode;
  /** Optional sub-line under the title (used on the home page). */
  subtitle?: ReactNode;
  /**
   * The home page itself: drops the left-side Home shortcut (you're already home)
   * and shows the full-screen toggle on the right instead. Every other screen
   * gets Home on the left and no toggle (they inherit full-screen — see
   * AutoFullscreen).
   */
  isHome?: boolean;
}

/**
 * The one shared header for every non-game screen (Home, Level Map, Settings,
 * Parent). Left: the Home shortcut (except on Home) beside the title; right: the
 * global NavIcons switcher (with Home de-duplicated onto the left). Games use
 * <GameHud/> instead. Rendered inside <AppShell header={…}/>, whose bar lays the
 * two groups out with justify-between.
 */
export function ScreenHeader({ title, subtitle, isHome = false }: ScreenHeaderProps): React.JSX.Element {
  return (
    <>
      <div className="flex items-center gap-3">
        {!isHome && <HomeButton />}
        <div className="flex flex-col leading-tight">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          {subtitle && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NavIcons hideHome={!isHome} />
        {isHome && (
          <div className="ml-3 flex items-center">
            <FullscreenButton />
          </div>
        )}
      </div>
    </>
  );
}
