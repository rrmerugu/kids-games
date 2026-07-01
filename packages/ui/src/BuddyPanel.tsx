import { cn } from '@invana/ui';
import { Buddy } from './Buddy.js';
import { MessageFeed } from './MessageFeed.js';
import { Starfield } from './Starfield.js';

export interface BuddyPanelProps {
  className?: string;
  reducedMotion?: boolean;
  character?: string;
  name?: string;
}

/**
 * A self-contained boxed astronaut "console" — starry backdrop, Buddy, and his
 * rotating idle encouragement. Used for the Settings preview. In-game,
 * `GameLayout` places Buddy directly on the shared space scene instead.
 */
export function BuddyPanel({
  className,
  reducedMotion,
  character,
  name,
}: BuddyPanelProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-b from-indigo-950 to-slate-900 p-3',
        className,
      )}
    >
      <Starfield reducedMotion={reducedMotion} />
      <div className="z-10 flex flex-col items-center gap-3">
        <Buddy latest={null} reducedMotion={reducedMotion} character={character} name={name} />
        <MessageFeed events={[]} reducedMotion={reducedMotion} />
      </div>
    </div>
  );
}
