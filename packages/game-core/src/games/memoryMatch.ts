/**
 * Memory Match (Concentration) — pure rules.
 *
 * A grid of face-down cards, each picture present exactly twice. The player
 * flips two at a time; a matching pair stays up, a mismatch flips back. Round
 * is won when every pair is matched. Trains visual recognition memory.
 *
 * This module is pure and presentation-free: it never times the flip-back
 * delay (the UI does), it only exposes the `flipped` pair and a
 * {@link resolveMismatch} to clear it.
 */
import type { Rng } from '../rng.js';
import { shuffle } from '../rng.js';

export interface MemoryMatchConfig {
  /** Number of distinct pictures; the deck has `pairs * 2` cards. */
  pairs: number;
  /** Picture pool (emoji). Must have at least `pairs` entries. */
  faces: readonly string[];
}

export interface Card {
  /** Stable id, also used as the rendered shape id. */
  id: string;
  /** The picture (emoji) on the card's face. */
  face: string;
  matched: boolean;
}

export interface MemoryMatchState {
  cards: Card[];
  /** Ids of currently face-up, not-yet-matched cards (0, 1, or 2). */
  flipped: string[];
  matchedPairs: number;
  /** Completed two-card attempts. */
  moves: number;
  mismatches: number;
}

/** Result of a single {@link flipCard} call. */
export type FlipOutcome =
  | { kind: 'ignored'; state: MemoryMatchState }
  | { kind: 'flip'; state: MemoryMatchState }
  | { kind: 'match'; state: MemoryMatchState; pair: [string, string] }
  | { kind: 'mismatch'; state: MemoryMatchState; pair: [string, string] };

/** Build a fresh, shuffled deck for the given config. */
export function createMemoryMatchState(
  config: MemoryMatchConfig,
  rng: Rng,
): MemoryMatchState {
  if (config.faces.length < config.pairs) {
    throw new Error(
      `Need at least ${config.pairs} faces, got ${config.faces.length}`,
    );
  }
  const chosen = config.faces.slice(0, config.pairs);
  const deck = shuffle(
    chosen.flatMap((face, i) => [
      { id: `c${i}a`, face, matched: false },
      { id: `c${i}b`, face, matched: false },
    ]),
    rng,
  );
  return { cards: deck, flipped: [], matchedPairs: 0, moves: 0, mismatches: 0 };
}

function card(state: MemoryMatchState, id: string): Card | undefined {
  return state.cards.find((c) => c.id === id);
}

/**
 * Flip the card `id` face-up. Ignored if the card is already matched, already
 * flipped, or while two cards are already showing (caller must
 * {@link resolveMismatch} first). On the second flip the move is scored and the
 * outcome reports `match` / `mismatch` with the pair of ids involved.
 */
export function flipCard(state: MemoryMatchState, id: string): FlipOutcome {
  const target = card(state, id);
  if (
    !target ||
    target.matched ||
    state.flipped.includes(id) ||
    state.flipped.length >= 2
  ) {
    return { kind: 'ignored', state };
  }

  const flipped = [...state.flipped, id];
  if (flipped.length < 2) {
    return { kind: 'flip', state: { ...state, flipped } };
  }

  const [aId, bId] = flipped as [string, string];
  const a = card(state, aId)!;
  const b = card(state, bId)!;
  const moves = state.moves + 1;

  if (a.face === b.face) {
    const cards = state.cards.map((c) =>
      c.id === aId || c.id === bId ? { ...c, matched: true } : c,
    );
    return {
      kind: 'match',
      pair: [aId, bId],
      state: {
        ...state,
        cards,
        flipped: [],
        moves,
        matchedPairs: state.matchedPairs + 1,
      },
    };
  }

  return {
    kind: 'mismatch',
    pair: [aId, bId],
    state: { ...state, flipped, moves, mismatches: state.mismatches + 1 },
  };
}

/** Clear the two mismatched cards (UI calls this after the flip-back delay). */
export function resolveMismatch(state: MemoryMatchState): MemoryMatchState {
  return { ...state, flipped: [] };
}

export function isWon(state: MemoryMatchState): boolean {
  return state.matchedPairs >= state.cards.length / 2;
}
