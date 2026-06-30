import type { ReactNode } from 'react';

export interface AppShellProps {
  children: ReactNode;
  /** Optional header content (title, sound toggle, avatar). */
  header?: ReactNode;
  /** Optional footer content (credits, license, links). */
  footer?: ReactNode;
}

/** Full-viewport gradient shell with an optional header, a flex-1 main area, and an optional footer. */
export function AppShell({ children, header, footer }: AppShellProps): React.JSX.Element {
  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-gradient-to-b from-sky-100 to-indigo-100 text-slate-800 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100">
      {header && (
        <header className="flex items-center justify-between gap-2 px-4 py-3">{header}</header>
      )}
      <main className="relative flex-1 overflow-hidden">{children}</main>
      {footer && <footer className="shrink-0 px-4 py-3">{footer}</footer>}
    </div>
  );
}
