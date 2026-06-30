import { useEffect, useRef, useState } from 'react';
import { GlossyButton } from './GlossyButton.js';

function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
}

export interface StopwatchProps {
  /** Change this to reset the widget (collapse to the icon) on replay / new level. */
  resetSignal: number;
}

/**
 * An opt-in stopwatch for the HUD. Starts collapsed as a glossy ⏱ button;
 * tapping it starts the clock and reveals a glossy time chip + pause/resume.
 * A self-directed timer for the kid — independent of the recorded round time.
 */
export function Stopwatch({ resetSignal }: StopwatchProps): React.JSX.Element {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const baseRef = useRef(0);

  useEffect(() => {
    setRunning(false);
    setElapsed(0);
  }, [resetSignal]);

  useEffect(() => {
    if (!running) return;
    baseRef.current = performance.now() - elapsed;
    const id = window.setInterval(() => setElapsed(performance.now() - baseRef.current), 250);
    return () => clearInterval(id);
    // Intentionally excludes `elapsed`: read once on (re)start to resume.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  if (!running && elapsed === 0) {
    return (
      <GlossyButton
        icon="⏱"
        label="Time"
        color="emerald"
        ariaLabel="Start stopwatch"
        onClick={() => setRunning(true)}
      />
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex h-12 items-center rounded-full bg-white/10 px-4 text-lg font-extrabold tabular-nums text-white shadow ring-1 ring-white/20 backdrop-blur">
        ⏱ {formatClock(elapsed)}
      </span>
      <GlossyButton
        icon={running ? '⏸️' : '▶️'}
        color={running ? 'amber' : 'emerald'}
        ariaLabel={running ? 'Pause stopwatch' : 'Resume stopwatch'}
        onClick={() => setRunning((r) => !r)}
      />
    </div>
  );
}
