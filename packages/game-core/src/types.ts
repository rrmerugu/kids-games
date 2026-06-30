/** The playable games. */
export type GameId = 'memory-match' | 'simon' | 'keyboard' | 'word-typing';

/**
 * Outcome of one finished round, handed to the gamification layer to compute
 * stars and to storage to record progress. `metrics` is game-specific (e.g.
 * `mismatches` for Memory Match, `mistakes` for Simon) — see each game's
 * `*Metrics` for the keys it sets.
 */
export interface RoundResult {
  gameId: GameId;
  level: number;
  won: boolean;
  durationMs: number;
  metrics: Record<string, number>;
}
