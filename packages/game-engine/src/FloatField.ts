/**
 * `FloatField` — the shared "gentle-motion arcade" primitive.
 *
 * A field of balloon/bubble sprites that drift slowly across a fixed play area
 * (up or down). Each sprite carries a logical `value` (a letter, a colour name,
 * a number, a category tag) that the game matches taps against. The field owns
 * three things so the games stay thin:
 *
 *  1. **Motion** — a single `requestAnimationFrame` loop nudges every sprite by
 *     `speedPxPerSec * dt`; a sprite that drifts past the far edge is removed and
 *     the population is topped back up.
 *  2. **Population** — it keeps exactly `population` sprites on screen, calling
 *     the game-supplied `refill(self)` to mint each new one's contents.
 *  3. **Accessibility** — when `reducedMotion` is on, the rAF loop is skipped and
 *     sprites sit in a static `gridCells` layout (re-shuffled on each pop), so the
 *     game is identical to play with no moving targets.
 *
 * The camera is pinned once to the play rectangle via two invisible corner
 * anchors, so drifting sprites never move the viewport.
 *
 * Motion is deliberately calm (see `game-principles.md`): slow drift, no lives,
 * no timer. The value carried by each sprite is the only thing that "means"
 * something — the reason we allow motion at all.
 */
import type { ShapeFill } from '@invana/canvas/primitives';
import type { GameBoard, Glyph } from './GameBoard.js';

export type FloatDirection = 'up' | 'down';

/** The visual + logical content of one sprite. */
export interface FloatSpriteInit {
  /** The logical value this sprite carries (matched against taps). */
  value: string;
  /** Character drawn on the sprite (letter / number / emoji). */
  glyph?: Glyph;
  /** Circle fill colour. Defaults to white. */
  fill?: ShapeFill;
  /** Per-sprite radius override. Defaults to the field radius. */
  radius?: number;
}

export interface FloatFieldOptions {
  /** Drift direction. `up` = balloons rise; `down` = things fall. Default `up`. */
  direction?: FloatDirection;
  /** Drift speed in world px/second. Keep it gentle. Default `50`. */
  speedPxPerSec?: number;
  /** Default sprite radius (world units). Default `92`. */
  radius?: number;
  /** Play-area width / height (world units). Default 1000 × 760. */
  width?: number;
  height?: number;
  /** How many sprites to keep on screen at once. Default `4`. */
  population?: number;
  /** Skip motion and lay sprites out in a static grid instead. Default `false`. */
  reducedMotion?: boolean;
  /** Grid shape used when `reducedMotion`. Default derived from `population`. */
  grid?: { rows: number; cols: number };
  /** Random source in `[0,1)`. Defaults to `Math.random`. */
  rng?: () => number;
  /** Mint the contents of the next sprite (value + look). Receives the field. */
  refill: (self: FloatField) => FloatSpriteInit;
}

interface Sprite {
  id: string;
  value: string;
  x: number;
  y: number;
  radius: number;
}

const POP_MS = 150;

export class FloatField {
  private readonly board: GameBoard;
  private readonly dir: FloatDirection;
  private readonly speed: number;
  private readonly radius: number;
  private readonly halfW: number;
  private readonly halfH: number;
  private readonly population: number;
  private readonly reduced: boolean;
  private readonly grid: { rows: number; cols: number };
  private readonly rng: () => number;
  private readonly refill: (self: FloatField) => FloatSpriteInit;

  private readonly sprites = new Map<string, Sprite>();
  private seq = 0;
  private raf: number | null = null;
  private lastTs = 0;
  private running = false;
  private offTap: (() => void) | null = null;
  private popHandler: ((id: string, value: string) => void) | null = null;
  private exitHandler: ((id: string, value: string) => void) | null = null;

  constructor(board: GameBoard, opts: FloatFieldOptions) {
    this.board = board;
    this.dir = opts.direction ?? 'up';
    this.speed = opts.speedPxPerSec ?? 50;
    this.radius = opts.radius ?? 92;
    this.halfW = (opts.width ?? 1000) / 2;
    this.halfH = (opts.height ?? 760) / 2;
    this.population = Math.max(1, opts.population ?? 4);
    this.reduced = opts.reducedMotion ?? false;
    this.rng = opts.rng ?? Math.random;
    this.refill = opts.refill;
    const cols = opts.grid?.cols ?? Math.min(this.population, 3);
    const rows = opts.grid?.rows ?? Math.ceil(this.population / cols);
    this.grid = { rows, cols };
  }

  /** Begin motion (if any) and fill the field to its target population. */
  start(): void {
    if (this.running) return;
    this.running = true;
    // Pin the camera to the play rectangle with invisible corner anchors so
    // drifting sprites never shift the viewport.
    this.board.addCircle('__ff_a0', { x: -this.halfW, y: -this.halfH, radius: 1, alpha: 0 });
    this.board.addCircle('__ff_a1', { x: this.halfW, y: this.halfH, radius: 1, alpha: 0 });
    this.board.fit(40);

    this.offTap = this.board.onTap((id) => {
      const s = this.sprites.get(id);
      if (s) this.popHandler?.(id, s.value);
    });

    for (let i = 0; i < this.population; i++) this.addSprite(i, true);
    if (this.reduced) this.relayout();
    else {
      this.lastTs = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  /** Cancel motion and taps. Call from the screen's cleanup. */
  stop(): void {
    this.running = false;
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.offTap?.();
    this.offTap = null;
  }

  /** Register the tap→pop handler (the game validates the value). */
  onPop(handler: (id: string, value: string) => void): void {
    this.popHandler = handler;
  }

  /** Register a handler for sprites that drift off the far edge uncaught. */
  onExit(handler: (id: string, value: string) => void): void {
    this.exitHandler = handler;
  }

  /** The values currently on screen (for match / invariant checks). */
  values(): { id: string; value: string }[] {
    return [...this.sprites.values()].map((s) => ({ id: s.id, value: s.value }));
  }

  /** Gentle shake for a wrong tap — the sprite stays (never punish). */
  shakeMiss(id: string): void {
    if (this.sprites.has(id)) this.board.shake(id);
  }

  /** Pulse one on-screen sprite carrying `value` (a hint). */
  hintValue(value: string): void {
    const hit = [...this.sprites.values()].find((s) => s.value === value);
    if (hit) this.board.pulse(hit.id);
  }

  /** Remove every sprite carrying `value` (e.g. an old colour that just cleared). */
  clearValue(value: string): void {
    for (const s of [...this.sprites.values()]) {
      if (s.value === value) {
        this.board.remove(s.id);
        this.sprites.delete(s.id);
      }
    }
    while (this.running && this.sprites.size < this.population) this.addSprite(this.sprites.size);
    if (this.reduced) this.relayout();
  }

  /** Pop a sprite (grow + vanish) and top the population back up. */
  pop(id: string): void {
    const s = this.sprites.get(id);
    if (!s) return;
    this.sprites.delete(id);
    this.board.pulse(id);
    window.setTimeout(() => this.board.remove(id), POP_MS);
    if (this.running) {
      this.addSprite(this.sprites.size);
      if (this.reduced) this.relayout();
    }
  }

  /**
   * Guarantee at least one on-screen sprite carries `value`. If none does, a
   * random distractor is swapped out for a fresh sprite built by `make`. Call
   * this whenever the sought answer changes so the target is always reachable.
   */
  ensureValue(value: string, make: () => FloatSpriteInit): void {
    if ([...this.sprites.values()].some((s) => s.value === value)) return;
    const victim = this.pickDistractor(value);
    if (victim) {
      this.board.remove(victim);
      this.sprites.delete(victim);
    }
    this.spawn(make(), false);
    if (this.reduced) this.relayout();
  }

  // --- internals ---------------------------------------------------------

  private pickDistractor(value: string): string | null {
    const others = [...this.sprites.values()].filter((s) => s.value !== value);
    if (others.length === 0) return null;
    return others[Math.floor(this.rng() * others.length)]!.id;
  }

  /** Add one sprite via `refill`. `spread` scatters it across the field (initial fill). */
  private addSprite(index: number, spread = false): void {
    this.spawn(this.refill(this), spread, index);
  }

  private spawn(init: FloatSpriteInit, spread: boolean, index = this.sprites.size): void {
    const id = `__ff_${this.seq++}`;
    const r = init.radius ?? this.radius;
    const x = this.randomX(r);
    // Entry edge: sprites travelling `up` start at the bottom (+y is down), and
    // vice-versa. On the initial fill we scatter them across the whole height.
    const enterY = this.dir === 'up' ? this.halfH + r : -this.halfH - r;
    const y = spread ? (this.rng() * 2 - 1) * this.halfH : enterY;
    const sprite: Sprite = { id, value: init.value, x, y, radius: r };
    this.sprites.set(id, sprite);
    this.board.addCircle(id, {
      x,
      y,
      radius: r,
      fill: init.fill ?? 0xffffff,
      glyph: init.glyph,
      stroke: { color: 0xffffff, width: 6, alpha: 0.9 },
    });
  }

  private randomX(r: number): number {
    const span = this.halfW - r;
    return (this.rng() * 2 - 1) * span;
  }

  /** Static grid layout for reduced-motion mode. */
  private relayout(): void {
    const cells = this.board.gridCells(this.grid.rows, this.grid.cols, this.radius * 2, 40);
    let i = 0;
    for (const s of this.sprites.values()) {
      const cell = cells[i++ % cells.length]!;
      s.x = cell.x;
      s.y = cell.y;
      this.board.update(s.id, { x: cell.x, y: cell.y });
    }
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.lastTs) / 1000);
    this.lastTs = now;
    const step = this.speed * dt * (this.dir === 'up' ? -1 : 1);
    const exited: string[] = [];
    for (const s of this.sprites.values()) {
      s.y += step;
      this.board.update(s.id, { y: s.y });
      const past = this.dir === 'up' ? s.y < -this.halfH - s.radius : s.y > this.halfH + s.radius;
      if (past) exited.push(s.id);
    }
    for (const id of exited) {
      const s = this.sprites.get(id);
      if (s) this.exitHandler?.(id, s.value);
      this.board.remove(id);
      this.sprites.delete(id);
      this.addSprite(this.sprites.size); // top back up at the entry edge
    }
    this.raf = requestAnimationFrame(this.tick);
  };
}

/** Create and return a {@link FloatField} over a board. Call `start()` to run. */
export function createFloatField(board: GameBoard, opts: FloatFieldOptions): FloatField {
  return new FloatField(board, opts);
}
