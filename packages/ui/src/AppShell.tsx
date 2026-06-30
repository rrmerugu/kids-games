import type { ReactNode } from 'react';

export interface AppShellProps {
  children: ReactNode;
  /** Optional header content (title, sound toggle, avatar). */
  header?: ReactNode;
}

/** Full-viewport gradient shell with an optional header and a flex-1 main area. */
export function AppShell({ children, header }: AppShellProps): React.JSX.Element {
  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-gradient-to-b from-sky-100 to-indigo-100 text-slate-800 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100">
      {header && (
        <header className="flex items-center justify-between gap-2 px-4 py-3">{header}</header>
      )}
      <main className="relative flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
