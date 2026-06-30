/**
 * `BoardLayer` — the single `WorldLayer` every game renders into. It owns a
 * {@link PrimitivesRenderer} created in `onMount` (the idiomatic engine pattern:
 * build the renderer from the layer's container + the canvas camera). The
 * renderer self-attaches global pointer listeners, so shape click/hover events
 * fire without any behaviour; we still delegate `hitTest` to it so the canvas
 * tick's hit-routing stays correct.
 */
import { WorldLayer } from '@invana/canvas';
import type { CanvasContext, WorldLayerHit } from '@invana/canvas';
import { PrimitivesRenderer } from '@invana/canvas/primitives';

export class BoardLayer extends WorldLayer {
  /** The renderer — assigned on mount, cleared on unmount. */
  renderer?: PrimitivesRenderer;

  protected createState(): object {
    return {};
  }

  protected override onMount(ctx: CanvasContext): void {
    this.renderer = new PrimitivesRenderer({
      container: this.container,
      camera: ctx.camera,
      canvasElement: ctx.canvasElement,
      // Generous touch target — these are kids on tablets.
      hitFloorPx: 16,
    });
  }

  protected override onUnmount(): void {
    this.renderer?.destroy();
    this.renderer = undefined;
  }

  override hitTest(worldX: number, worldY: number): WorldLayerHit | null {
    const hit = this.renderer?.hitTest(worldX, worldY);
    return hit ? { id: hit.id, kind: hit.kind } : null;
  }
}
