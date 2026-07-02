/**
 * Tiny seedable PRNG + array helpers.
 *
 * All game logic takes an {@link Rng} so rounds are deterministic in tests
 * (seed → identical deck/sequence) while staying random in the app (seed from
 * a timestamp at the call site, never inside pure logic).
 */

/** A pseudo-random source returning a float in `[0, 1)`. */
export type Rng = () => number;

/**
 * `mulberry32` — a fast, well-distributed 32-bit PRNG. Deterministic for a
 * given seed; good enough for shuffling decks and picking pads.
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle into a new array — never mutates the input. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = out[i]!;
    out[i] = out[j]!;
    out[j] = a;
  }
  return out;
}

/** Pick one element uniformly at random. Throws on an empty array. */
export function pick<T>(items: readonly T[], rng: Rng): T {
  if (items.length === 0) throw new Error('pick() from empty array');
  return items[Math.floor(rng() * items.length)]!;
}

/** Pick `count` elements at random, *with* repeats allowed. */
export function pickMany<T>(items: readonly T[], count: number, rng: Rng): T[] {
  return Array.from({ length: count }, () => pick(items, rng));
}

/**
 * Draw `count` elements while avoiding repeats: within one pass through the pool
 * every element is unique (a shuffle), and when `count` exceeds the pool we
 * reshuffle and continue — never repeating an element back-to-back across the
 * seam. So a round shows as much variety as the pool allows and never the same
 * word twice in a row. `keyOf` compares items (default: the item itself), so
 * object pools (e.g. `{ word, emoji }`) can dedupe on a field.
 */
export function sampleNoRepeat<T>(
  items: readonly T[],
  count: number,
  rng: Rng,
  keyOf: (item: T) => unknown = (item) => item,
): T[] {
  if (items.length === 0 || count <= 0) return [];
  const out: T[] = [];
  while (out.length < count) {
    const block = shuffle(items, rng);
    // Don't let the new block start with the same item the last one ended on.
    const last = out[out.length - 1];
    if (last !== undefined && block.length > 1 && keyOf(block[0]!) === keyOf(last)) {
      const swap = block.findIndex((it) => keyOf(it) !== keyOf(block[0]!));
      if (swap > 0) [block[0], block[swap]] = [block[swap]!, block[0]!];
    }
    for (const it of block) {
      if (out.length >= count) break;
      out.push(it);
    }
  }
  return out;
}
