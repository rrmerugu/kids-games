import { describe, it, expect, beforeEach } from 'vitest';
import type { RoundResult } from '@kids/game-core';
import { useProgress } from '../src/index.js';

const win = (over: Partial<RoundResult> = {}): RoundResult => ({
  gameId: 'memory-match',
  level: 1,
  won: true,
  durationMs: 1000,
  metrics: { mismatches: 0, pairs: 4 },
  ...over,
});

describe('progressStore', () => {
  beforeEach(() => useProgress.getState().reset());

  it('records stars and keeps the best across replays', () => {
    const first = useProgress.getState().recordRound(win({ metrics: { mismatches: 2, pairs: 4 } }));
    expect(first.stars).toBe(2);
    expect(useProgress.getState().bestFor('memory-match')[1]).toBe(2);

    // A worse replay does not lower the best.
    useProgress.getState().recordRound(win({ metrics: { mismatches: 9, pairs: 4 } }));
    expect(useProgress.getState().bestFor('memory-match')[1]).toBe(2);

    // A better replay raises it.
    useProgress.getState().recordRound(win({ metrics: { mismatches: 0, pairs: 4 } }));
    expect(useProgress.getState().bestFor('memory-match')[1]).toBe(3);
  });

  it('grants stickers once', () => {
    const out = useProgress.getState().recordRound(win());
    expect(out.newStickers).toContain('first-win');
    expect(useProgress.getState().stickers).toContain('first-win');

    const again = useProgress.getState().recordRound(win({ level: 2 }));
    expect(again.newStickers).not.toContain('first-win');
  });

  it('updates settings and profile', () => {
    useProgress.getState().setSetting('sound', false);
    expect(useProgress.getState().settings.sound).toBe(false);
    useProgress.getState().setProfile({ name: 'Ava', avatar: '🦄' });
    expect(useProgress.getState().profile?.name).toBe('Ava');
  });
});
