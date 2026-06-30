import { useEffect, useState } from 'react';
import { useProgress } from '@kids/storage';

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/** Resolve the effective theme from the user's setting + OS preference. */
export function useResolvedTheme(): 'light' | 'dark' {
  const theme = useProgress((s) => s.settings.theme);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (): void => setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
}

/** Apply the resolved theme + motion preference as classes on <html>. */
export function useApplyTheme(): void {
  const resolved = useResolvedTheme();
  const reducedMotion = useProgress((s) => s.settings.reducedMotion);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [resolved]);
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
  }, [reducedMotion]);
}
