/** Floating muted app version, pinned to the bottom-left of the viewport on every screen. */
export function VersionBadge(): React.JSX.Element {
  return (
    <span className="pointer-events-none fixed bottom-2 left-2 z-50 text-xs text-slate-400 dark:text-slate-600">
      v{__APP_VERSION__}
    </span>
  );
}
