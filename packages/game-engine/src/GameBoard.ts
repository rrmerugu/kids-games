/**
 * `GameBoard` — the game-facing facade over the engine. Games never touch pixi
 * or the renderer directly: they add tiles/circles at a *centre* coordinate,
 * subscribe to taps/hovers, update visual properties, and call a few canned
 * animations. Coordinates are world-space; `(x, y)` is always the shape centre
 * (friendlier for grid layout than pixi's top-left rects).
 */
import type { Canvas } from '@invana/canvas';
import type {
  CircleSpec,
  RectSpec,
  ShapeFill,
  ShapeFillLayer,
  ShapeStroke,
} from '@invana/canvas/primitives';
import type { BoardLayer } from './BoardLayer.js';

/** A font-rendered character (emoji / letter / number) drawn on a shape. */
export interface Glyph {
  char: string;
  color?: number;
  /** Size as a fraction of the shape's smaller dimension. Default `0.62`. */
  sizeRatio?: number;
}

export interface TileOptions {
  /** Centre of the tile in world space. */
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: ShapeFill;
  cornerRadius?: number;
  stroke?: ShapeStroke;
  glyph?: Glyph;
  alpha?: number;
  zIndex?: number;
}

export interface CircleOptions {
  x: number;
  y: number;
  radius: number;
  fill?: ShapeFill;
  stroke?: ShapeStroke;
  glyph?: Glyph;
  alpha?: number;
  zIndex?: number;
}

export interface UpdatePatch {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  fill?: ShapeFill;
  /** Pass `null` to remove the glyph. */
  glyph?: Glyph | null;
  stroke?: ShapeStroke | null;
  cornerRadius?: number;
  alpha?: number;
}

interface RectRec {
  kind: 'rect';
  cx: number;
  cy: number;
  w: number;
  h: number;
  fill: ShapeFill;
  glyph?: Glyph;
  cornerRadius?: number;
  stroke?: ShapeStroke;
  alpha?: number;
  zIndex?: number;
}
interface CircleRec {
  kind: 'circle';
  cx: number;
  cy: number;
  r: number;
  fill: ShapeFill;
  glyph?: Glyph;
  stroke?: ShapeStroke;
  alpha?: number;
  zIndex?: number;
}
type Rec = RectRec | CircleRec;

/** A point returned by {@link GameBoard.gridCells}. */
export interface Cell {
  x: number;
  y: number;
}

const DEFAULT_GLYPH_COLOR = 0x1f2937;

/** Compose a base fill + optional glyph into a layered {@link ShapeFill}. */
function composeFill(fill: ShapeFill | undefined, glyph?: Glyph): ShapeFill {
  const base = fill ?? 0xffffff;
  if (!glyph) return base;
  const layers: ShapeFillLayer[] = [];
  if (typeof base === 'number') layers.push({ kind: 'solid', color: base });
  else if (Array.isArray(base)) layers.push(...(base as ShapeFillLayer[]));
  else layers.push(base as ShapeFillLayer);
  layers.push({
    kind: 'glyph',
    char: glyph.char,
    color: glyph.color ?? DEFAULT_GLYPH_COLOR,
    sizeRatio: glyph.sizeRatio ?? 0.62,
  });
  return layers;
}

function recToSpec(rec: Rec): RectSpec | CircleSpec {
  const fill = composeFill(rec.fill, rec.glyph);
  if (rec.kind === 'rect') {
    return {
      kind: 'rect',
      x: rec.cx - rec.w / 2,
      y: rec.cy - rec.h / 2,
      width: rec.w,
      height: rec.h,
      fill,
      cornerRadius: rec.cornerRadius,
      stroke: rec.stroke,
      alpha: rec.alpha,
      zIndex: rec.zIndex,
    };
  }
  return {
    kind: 'circle',
    x: rec.cx,
    y: rec.cy,
    radius: rec.r,
    fill,
    stroke: rec.stroke,
    alpha: rec.alpha,
    zIndex: rec.zIndex,
  };
}

/** A minimal rAF tween: calls `onFrame(t)` with `t` in `[0,1]`. */
function animate(durationMs: number, onFrame: (t: number) => void, onDone?: () => void): void {
  const start = performance.now();
  const step = (now: number): void => {
    const t = Math.min(1, (now - start) / durationMs);
    onFrame(t);
    if (t < 1) requestAnimationFrame(step);
    else onDone?.();
  };
  requestAnimationFrame(step);
}

export class GameBoard {
  private readonly records = new Map<string, Rec>();
  /** Active per-shape rAF handles (breathing borders), so we can cancel them. */
  private readonly anims = new Map<string, number>();

  constructor(
    private readonly canvas: Canvas,
    private readonly layer: BoardLayer,
  ) {
    if (!layer.renderer) {
      throw new Error('GameBoard created before the BoardLayer mounted');
    }
  }

  private get renderer() {
    const r = this.layer.renderer;
    if (!r) throw new Error('BoardLayer renderer is not available');
    return r;
  }

  addTile(id: string, o: TileOptions): void {
    const rec: RectRec = {
      kind: 'rect',
      cx: o.x,
      cy: o.y,
      w: o.width,
      h: o.height,
      fill: o.fill ?? 0xffffff,
      glyph: o.glyph,
      cornerRadius: o.cornerRadius,
      stroke: o.stroke,
      alpha: o.alpha,
      zIndex: o.zIndex,
    };
    this.records.set(id, rec);
    this.renderer.addShape(id, recToSpec(rec));
  }

  addCircle(id: string, o: CircleOptions): void {
    const rec: CircleRec = {
      kind: 'circle',
      cx: o.x,
      cy: o.y,
      r: o.radius,
      fill: o.fill ?? 0xffffff,
      glyph: o.glyph,
      stroke: o.stroke,
      alpha: o.alpha,
      zIndex: o.zIndex,
    };
    this.records.set(id, rec);
    this.renderer.addShape(id, recToSpec(rec));
  }

  /** Patch a shape's geometry / appearance. No-op for unknown ids. */
  update(id: string, patch: UpdatePatch): void {
    const rec = this.records.get(id);
    if (!rec) return;
    if (patch.x !== undefined) rec.cx = patch.x;
    if (patch.y !== undefined) rec.cy = patch.y;
    if (patch.fill !== undefined) rec.fill = patch.fill;
    if (patch.glyph !== undefined) rec.glyph = patch.glyph ?? undefined;
    if (patch.stroke !== undefined) rec.stroke = patch.stroke ?? undefined;
    if (patch.alpha !== undefined) rec.alpha = patch.alpha;
    if (rec.kind === 'rect') {
      if (patch.width !== undefined) rec.w = patch.width;
      if (patch.height !== undefined) rec.h = patch.height;
      if (patch.cornerRadius !== undefined) rec.cornerRadius = patch.cornerRadius;
    } else if (patch.radius !== undefined) {
      rec.r = patch.radius;
    }
    const spec = recToSpec(rec);
    // Narrow the union so updateShape's generic infers a single spec kind.
    if (spec.kind === 'rect') this.renderer.updateShape<RectSpec>(id, spec);
    else this.renderer.updateShape<CircleSpec>(id, spec);
  }

  remove(id: string): void {
    this.cancelAnim(id);
    if (this.records.delete(id)) this.renderer.removeShape(id);
  }

  clear(): void {
    for (const id of this.anims.keys()) cancelAnimationFrame(this.anims.get(id)!);
    this.anims.clear();
    for (const id of this.records.keys()) this.renderer.removeShape(id);
    this.records.clear();
  }

  // --- borders / highlights ----------------------------------------------

  private cancelAnim(id: string): void {
    const h = this.anims.get(id);
    if (h !== undefined) {
      cancelAnimationFrame(h);
      this.anims.delete(id);
    }
  }

  /** Set a static border on a shape (e.g. red for "wrong"). */
  setBorder(id: string, color: number, width = 6): void {
    this.cancelAnim(id);
    this.update(id, { stroke: { color, width, alpha: 1 } });
  }

  /**
   * A "breathing" highlight border — stroke width + alpha pulse for `durationMs`
   * (signals "correct!"), then settle to a steady border so the shape stays
   * marked. Cheap: only the few highlighted shapes animate, and they stop.
   */
  breatheBorder(id: string, color: number, durationMs = 1500): void {
    this.cancelAnim(id);
    const start = performance.now();
    const tick = (now: number): void => {
      const e = (now - start) / durationMs;
      const s = (Math.sin(e * Math.PI * 4) + 1) / 2; // ~2 pulses over the duration
      if (e < 1) {
        this.update(id, { stroke: { color, width: 5 + 6 * s, alpha: 0.55 + 0.45 * s } });
        this.anims.set(id, requestAnimationFrame(tick));
      } else {
        this.anims.delete(id);
        this.update(id, { stroke: { color, width: 6, alpha: 1 } });
      }
    };
    this.anims.set(id, requestAnimationFrame(tick));
  }

  /** Subscribe to taps on any shape. Returns an unsubscribe fn. */
  onTap(handler: (id: string) => void): () => void {
    return this.renderer.events.on('shape:click', (e) => handler(e.id));
  }

  /** Subscribe to hover enter/leave. Returns an unsubscribe fn. */
  onHover(over: (id: string) => void, out: (id: string) => void): () => void {
    const offOver = this.renderer.events.on('shape:pointerover', (e) => over(e.id));
    const offOut = this.renderer.events.on('shape:pointerout', (e) => out(e.id));
    return () => {
      offOver();
      offOut();
    };
  }

  /**
   * Even grid of cell centres, centred on the world origin. `cell` is the cell
   * size, `gap` the spacing between cells. Returns `rows * cols` points in
   * row-major order.
   */
  gridCells(rows: number, cols: number, cell: number, gap: number): Cell[] {
    const stepX = cell + gap;
    const stepY = cell + gap;
    const totalW = cols * cell + (cols - 1) * gap;
    const totalH = rows * cell + (rows - 1) * gap;
    const x0 = -totalW / 2 + cell / 2;
    const y0 = -totalH / 2 + cell / 2;
    const cells: Cell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({ x: x0 + c * stepX, y: y0 + r * stepY });
      }
    }
    return cells;
  }

  /** Fit the camera to everything currently on the board. */
  fit(padding = 80): void {
    const b = this.computeBounds();
    if (b) this.canvas.camera.fitContent(b, padding);
  }

  private computeBounds(): { x: number; y: number; width: number; height: number } | null {
    if (this.records.size === 0) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const rec of this.records.values()) {
      const hw = rec.kind === 'rect' ? rec.w / 2 : rec.r;
      const hh = rec.kind === 'rect' ? rec.h / 2 : rec.r;
      minX = Math.min(minX, rec.cx - hw);
      minY = Math.min(minY, rec.cy - hh);
      maxX = Math.max(maxX, rec.cx + hw);
      maxY = Math.max(maxY, rec.cy + hh);
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  // --- canned animations -------------------------------------------------

  /** A quick grow-and-settle, for positive feedback. */
  pulse(id: string): void {
    const rec = this.records.get(id);
    if (!rec) return;
    if (rec.kind === 'circle') {
      const r0 = rec.r;
      animate(
        120,
        (t) => this.update(id, { radius: r0 * (1 + 0.18 * t) }),
        () =>
          animate(
            140,
            (t) => this.update(id, { radius: r0 * (1.18 - 0.18 * t) }),
            () => this.update(id, { radius: r0 }),
          ),
      );
    } else {
      const w0 = rec.w;
      const h0 = rec.h;
      animate(
        120,
        (t) => this.update(id, { width: w0 * (1 + 0.12 * t), height: h0 * (1 + 0.12 * t) }),
        () =>
          animate(
            140,
            (t) =>
              this.update(id, {
                width: w0 * (1.12 - 0.12 * t),
                height: h0 * (1.12 - 0.12 * t),
              }),
            () => this.update(id, { width: w0, height: h0 }),
          ),
      );
    }
  }

  /** A short horizontal shake, for "try again". */
  shake(id: string): void {
    const rec = this.records.get(id);
    if (!rec) return;
    const cx0 = rec.cx;
    animate(
      300,
      (t) => this.update(id, { x: cx0 + Math.sin(t * Math.PI * 6) * 10 * (1 - t) }),
      () => this.update(id, { x: cx0 }),
    );
  }

  /**
   * Card-flip a rect: collapse its width to zero, swap the face (fill/glyph) at
   * the midpoint, then expand back. Resolves when the flip completes. Non-rect
   * shapes are updated instantly.
   */
  flip(id: string, face: { fill?: ShapeFill; glyph?: Glyph | null }): Promise<void> {
    const rec = this.records.get(id);
    if (!rec || rec.kind !== 'rect') {
      this.update(id, { fill: face.fill, glyph: face.glyph });
      return Promise.resolve();
    }
    const w0 = rec.w;
    return new Promise((resolve) => {
      animate(
        130,
        (t) => this.update(id, { width: w0 * (1 - t) }),
        () => {
          this.update(id, { width: 0.001, fill: face.fill, glyph: face.glyph });
          animate(
            130,
            (t) => this.update(id, { width: w0 * t }),
            () => {
              this.update(id, { width: w0 });
              resolve();
            },
          );
        },
      );
    });
  }
}
