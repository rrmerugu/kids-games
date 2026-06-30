/**
 * Star scoring — turn a {@link RoundResult} into 1–3 stars. A won round always
 * earns at least one star (we never punish a 6-year-old who finished). Stars
 * reward *clean* play: few mistakes / no hints.
 *
 * Metric keys each game is expected to set on `result.metrics`:
 * - memory-match: `mismatches`, `pairs`
 * - simon:        `replays` (times the sequence was re-shown)
 * - keyboard:     `misses`, `targets`
 * - word-typing:  `misses`, `letters` (total letters typed across the round)
 * - say-it:       (none) — a no-grading practice game; finishing is the win
 * - say-hello:    `misses`, `turns`
 */
import type { RoundResult } from '@kids/game-core';

export type Stars = 1 | 2 | 3;

export function starsFor(result: RoundResult): Stars {
  if (!result.won) return 1;

  switch (result.gameId) {
    case 'memory-match': {
      const mismatches = result.metrics.mismatches ?? 0;
      const pairs = result.metrics.pairs ?? 1;
      if (mismatches === 0) return 3;
      if (mismatches <= Math.ceil(pairs / 2)) return 2;
      return 1;
    }
    case 'simon': {
      const replays = result.metrics.replays ?? 0;
      if (replays === 0) return 3;
      if (replays <= 2) return 2;
      return 1;
    }
    case 'keyboard': {
      const misses = result.metrics.misses ?? 0;
      const targets = result.metrics.targets ?? 1;
      if (misses === 0) return 3;
      if (misses <= Math.ceil(targets / 2)) return 2;
      return 1;
    }
    case 'word-typing': {
      const misses = result.metrics.misses ?? 0;
      const letters = result.metrics.letters ?? 1;
      if (misses === 0) return 3;
      if (misses <= Math.ceil(letters / 3)) return 2;
      return 1;
    }
    case 'say-it': {
      // Pure listen-and-repeat practice — there is no wrong answer, so finishing
      // always earns 3 stars. We never grade a child's voice.
      return 3;
    }
    case 'say-hello': {
      const misses = result.metrics.misses ?? 0;
      const turns = result.metrics.turns ?? 1;
      if (misses === 0) return 3;
      if (misses <= Math.ceil(turns / 2)) return 2;
      return 1;
    }
  }
}
