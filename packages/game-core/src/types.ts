/** The playable games. */
export type GameId =
  | 'memory-match'
  | 'simon'
  | 'keyboard'
  | 'word-typing'
  | 'say-it'
  | 'say-hello'
  | 'balloon-pop'
  | 'color-splash'
  | 'counting-balloons'
  | 'feed-monster'
  | 'bubble-math'
  | 'falling-letters';

/**
 * Per-action-type tally for a round, derived from the Buddy event timeline
 * (system shows / child responds). Powers the "accuracy + speed by action type"
 * analytics. One entry per child action `type` (e.g. `tap`, `type`, `reply`).
 */
export interface ActionStat {
  /** Action type, e.g. `tap` | `type` | `reply` | `say` | `pair`. */
  type: string;
  /** Correct child responses of this type. */
  correct: number;
  /** Wrong child responses of this type. */
  wrong: number;
  /** Sum of response times (ms) over the responses that had one. */
  reactionMsTotal: number;
  /** How many responses contributed a response time. */
  reactionCount: number;
}

/**
 * Outcome of one finished round, handed to the gamification layer to compute
 * stars and to storage to record progress. `metrics` is game-specific (e.g.
 * `mismatches` for Memory Match, `mistakes` for Simon) — see each game's
 * `*Metrics` for the keys it sets. `actions` is the optional per-action-type
 * breakdown captured from Buddy's event timeline.
 */
export interface RoundResult {
  gameId: GameId;
  level: number;
  won: boolean;
  durationMs: number;
  metrics: Record<string, number>;
  actions?: readonly ActionStat[];
}
