import { describe, it, expect } from 'vitest';
import {
  createSayHelloState,
  currentPrompt,
  choose,
  mulberry32,
  type ConvPrompt,
  type SayHelloState,
} from '../src/index.js';

const prompts: ConvPrompt[] = [
  {
    speaker: '🧑',
    text: 'Hi! How are you?',
    choices: [
      { emoji: '😊', label: "I'm good!", correct: true },
      { emoji: '🍎', label: 'Apple', correct: false },
    ],
  },
  {
    speaker: '🐶',
    text: 'Thank you!',
    choices: [
      { emoji: '🤗', label: "You're welcome!", correct: true },
      { emoji: '🚗', label: 'Car', correct: false },
    ],
  },
  {
    speaker: '🐱',
    text: 'Bye bye!',
    choices: [
      { emoji: '👋', label: 'See you!', correct: true },
      { emoji: '🌙', label: 'Moon', correct: false },
    ],
  },
];

/** Index of the correct choice in the current prompt. */
function correctIndex(state: SayHelloState): number {
  return currentPrompt(state)!.choices.findIndex((c) => c.correct);
}

describe('sayHello', () => {
  it('picks distinct turns from the pool, capped at the pool size', () => {
    const s = createSayHelloState({ prompts, targets: 10 }, mulberry32(1));
    expect(s.prompts).toHaveLength(prompts.length);
    const texts = new Set(s.prompts.map((p) => p.text));
    expect(texts.size).toBe(prompts.length);
  });

  it('advances on a correct reply', () => {
    const s = createSayHelloState({ prompts, targets: 3 }, mulberry32(2));
    const out = choose(s, correctIndex(s));
    expect(out.kind).toBe('next');
    expect(out.state.index).toBe(1);
    expect(out.state.misses).toBe(0);
  });

  it('counts a wrong reply as a miss without advancing', () => {
    const s = createSayHelloState({ prompts, targets: 3 }, mulberry32(3));
    const wrong = currentPrompt(s)!.choices.findIndex((c) => !c.correct);
    const out = choose(s, wrong);
    expect(out.kind).toBe('wrong');
    expect(out.state.index).toBe(0);
    expect(out.state.misses).toBe(1);
  });

  it('wins after the last correct reply', () => {
    let s = createSayHelloState({ prompts, targets: 2 }, mulberry32(4));
    s = choose(s, correctIndex(s)).state;
    const out = choose(s, correctIndex(s));
    expect(out.kind).toBe('won');
    expect(out.state.phase).toBe('won');
    expect(currentPrompt(out.state)).toBeUndefined();
  });

  it('ignores choices once the round is won', () => {
    let s = createSayHelloState({ prompts, targets: 1 }, mulberry32(5));
    s = choose(s, correctIndex(s)).state;
    expect(s.phase).toBe('won');
    const out = choose(s, 0);
    expect(out.kind).toBe('won');
    expect(out.state).toBe(s);
  });
});
