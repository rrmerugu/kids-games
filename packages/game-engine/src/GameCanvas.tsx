/**
 * `<GameCanvas>` — mounts an `@invana/canvas` `Canvas` into a div, attaches the
 * single {@link BoardLayer}, and hands the game a ready {@link GameBoard} via
 * `onReady`. The `onReady` callback may return a cleanup function (clear timers,
 * unsubscribe taps) that runs on unmount, right before the canvas is destroyed.
 *
 * Do not wrap the app in `<StrictMode>` — its double-invoke of effects would
 * init/destroy pixi twice per mount.
 */
import { useEffect, useRef, type CSSProperties } from 'react';
import { Canvas } from '@invana/canvas';
import { BoardLayer } from './BoardLayer.js';
import { GameBoard } from './GameBoard.js';

export interface GameCanvasProps {
  /** Called once the board is ready. Return a cleanup fn to run on unmount. */
  onReady: (board: GameBoard) => void | (() => void);
  /** Canvas background colour. Default a soft slate (`0xf8fafc`). */
  backgroundColor?: number;
  className?: string;
  style?: CSSProperties;
}

export function GameCanvas({
  onReady,
  backgroundColor = 0xf8fafc,
  className,
  style,
}: GameCanvasProps): React.JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const canvas = new Canvas({ id: 'kids-game' });
    let disposed = false;
    let cleanupGame: void | (() => void);

    void canvas
      .init({ container: host, autoResize: true, opaque: true, backgroundColor })
      .then(() => {
        if (disposed) return;
        const layer = new BoardLayer({ id: 'board', options: {} });
        canvas.layers.add(layer);
        const board = new GameBoard(canvas, layer);
        cleanupGame = onReadyRef.current(board);
      });

    return () => {
      disposed = true;
      if (typeof cleanupGame === 'function') cleanupGame();
      canvas.destroy();
    };
  }, [backgroundColor]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: '100%', height: '100%', touchAction: 'none', ...style }}
    />
  );
}
