import { Navigate, useParams } from 'react-router-dom';
import { gameMeta } from './registry.js';
import { MemoryMatchScreen } from './memory-match/index.js';
import { SimonScreen } from './simon/index.js';
import { KeyboardScreen } from './keyboard/index.js';
import { WordTypingScreen } from './word-typing/index.js';

/** Resolve `/play/:gameId/:level` to the matching game screen. */
export function GameRoute(): React.JSX.Element {
  const { gameId, level } = useParams();
  const meta = gameMeta(gameId);
  const lvl = Number(level);

  if (!meta || !Number.isInteger(lvl) || lvl < 1) return <Navigate to="/" replace />;

  // key forces a fresh mount (and a fresh canvas) when the level changes.
  const key = `${meta.id}-${lvl}`;
  switch (meta.id) {
    case 'memory-match':
      return <MemoryMatchScreen key={key} level={lvl} />;
    case 'simon':
      return <SimonScreen key={key} level={lvl} />;
    case 'keyboard':
      return <KeyboardScreen key={key} level={lvl} />;
    case 'word-typing':
      return <WordTypingScreen key={key} level={lvl} />;
    default:
      return <Navigate to="/" replace />;
  }
}
