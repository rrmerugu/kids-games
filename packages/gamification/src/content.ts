/** Shared game content (picture pools, letter sets, pad palette). */
import type { ConvPrompt, SpeakItem } from '@kids/game-core';

/** Emoji picture pool for Memory Match. Length ≥ the largest level's pairs. */
export const ANIMAL_FACES = [
  '🐶', '🐱', '🐰', '🦊', '🐼', '🐸', '🐵', '🦁',
  '🐯', '🐮', '🐷', '🐔', '🐧', '🐢', '🐙', '🦄',
  '🐝', '🦋', '🐴', '🐨', '🐤', '🐬', '🦉', '🐞',
] as const;

/** Letter sets the Keyboard Trainer draws from, easiest → fullest. */
export const LETTERS_EASY = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export const LETTERS_MID = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'] as const;
export const LETTERS_FULL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** Simon pad colours (hex, consumed by the engine as `fill`). */
export const SIMON_PAD_COLORS = [0x22c55e, 0xef4444, 0x3b82f6, 0xeab308] as const;

/**
 * Word lists the Word Typing game draws from, easiest → hardest. All uppercase
 * A–Z (no spaces or punctuation, so every character is one keypress). Chosen to
 * be concrete, picture-able nouns a 5–10 year-old already says aloud.
 */
export const WORDS_EASY = [
  'CAT', 'DOG', 'SUN', 'HAT', 'BUS', 'COW', 'PIG', 'BED',
  'CUP', 'BOX', 'FOX', 'EGG', 'BEE', 'CAR', 'PEN', 'BAG',
] as const;
export const WORDS_MID = [
  'FISH', 'BIRD', 'FROG', 'DUCK', 'CAKE', 'MILK', 'BALL', 'TREE',
  'STAR', 'MOON', 'BOOK', 'SHOE', 'HAND', 'DOOR', 'RAIN', 'BOAT',
] as const;
export const WORDS_HARD = [
  'APPLE', 'TIGER', 'HORSE', 'TRAIN', 'HOUSE', 'GRASS', 'CLOUD', 'PLANT',
  'SNAKE', 'BREAD', 'CHAIR', 'SMILE', 'BEACH', 'MOUSE', 'ROBOT', 'HONEY',
] as const;

/* ---------------------------------------------------------------------------
 * Say It! (Speaking) — picture + word the child hears, then repeats aloud.
 * Each item pairs an emoji (the meaning carrier) with the word to say. Easy →
 * hard mirrors the Word Typing curve: short concrete nouns first.
 * ------------------------------------------------------------------------- */
export const SAY_IT_EASY: readonly SpeakItem[] = [
  { word: 'CAT', emoji: '🐱' }, { word: 'DOG', emoji: '🐶' }, { word: 'SUN', emoji: '☀️' },
  { word: 'COW', emoji: '🐮' }, { word: 'PIG', emoji: '🐷' }, { word: 'BEE', emoji: '🐝' },
  { word: 'FOX', emoji: '🦊' }, { word: 'CAR', emoji: '🚗' }, { word: 'BUS', emoji: '🚌' },
  { word: 'HAT', emoji: '🎩' }, { word: 'CUP', emoji: '🥤' }, { word: 'EGG', emoji: '🥚' },
];

export const SAY_IT_MID: readonly SpeakItem[] = [
  { word: 'FISH', emoji: '🐟' }, { word: 'BIRD', emoji: '🐦' }, { word: 'FROG', emoji: '🐸' },
  { word: 'DUCK', emoji: '🦆' }, { word: 'CAKE', emoji: '🍰' }, { word: 'MILK', emoji: '🥛' },
  { word: 'BALL', emoji: '⚽' }, { word: 'TREE', emoji: '🌳' }, { word: 'STAR', emoji: '⭐' },
  { word: 'MOON', emoji: '🌙' }, { word: 'BOOK', emoji: '📖' }, { word: 'SHOE', emoji: '👟' },
];

export const SAY_IT_HARD: readonly SpeakItem[] = [
  { word: 'APPLE', emoji: '🍎' }, { word: 'TIGER', emoji: '🐯' }, { word: 'HORSE', emoji: '🐴' },
  { word: 'TRAIN', emoji: '🚆' }, { word: 'HOUSE', emoji: '🏠' }, { word: 'SNAKE', emoji: '🐍' },
  { word: 'BREAD', emoji: '🍞' }, { word: 'MOUSE', emoji: '🐭' }, { word: 'ROBOT', emoji: '🤖' },
  { word: 'HONEY', emoji: '🍯' }, { word: 'PANDA', emoji: '🐼' }, { word: 'LEMON', emoji: '🍋' },
];

/* ---------------------------------------------------------------------------
 * Say Hello! (Conversation) — a character speaks a line; the child taps the
 * right reply. Greetings, politeness, and asking for / offering help. Each
 * prompt carries its own choices (one correct), so the screen just renders them.
 * ------------------------------------------------------------------------- */
export const GREETINGS: readonly ConvPrompt[] = [
  {
    speaker: '🧑',
    text: 'Hi! How are you?',
    choices: [
      { emoji: '😊', label: "I'm good!", correct: true },
      { emoji: '🍎', label: 'Apple', correct: false },
      { emoji: '🚗', label: 'Car', correct: false },
    ],
  },
  {
    speaker: '👩',
    text: 'Good morning!',
    choices: [
      { emoji: '🌅', label: 'Morning!', correct: true },
      { emoji: '🌙', label: 'Goodnight', correct: false },
      { emoji: '🍌', label: 'Banana', correct: false },
    ],
  },
  {
    speaker: '🧒',
    text: 'Thank you!',
    choices: [
      { emoji: '🤗', label: "You're welcome!", correct: true },
      { emoji: '🐸', label: 'Frog', correct: false },
      { emoji: '⚽', label: 'Ball', correct: false },
    ],
  },
  {
    speaker: '🧑',
    text: "What's your name?",
    choices: [
      { emoji: '😀', label: "I'm Sam!", correct: true },
      { emoji: '🍕', label: 'Pizza', correct: false },
      { emoji: '🌧️', label: 'Rain', correct: false },
    ],
  },
  {
    speaker: '🧓',
    text: 'Can you help me?',
    choices: [
      { emoji: '🙌', label: 'Yes, I can!', correct: true },
      { emoji: '🐟', label: 'Fish', correct: false },
      { emoji: '🎈', label: 'Balloon', correct: false },
    ],
  },
  {
    speaker: '🧑',
    text: 'Bye bye!',
    choices: [
      { emoji: '👋', label: 'See you!', correct: true },
      { emoji: '🍪', label: 'Cookie', correct: false },
      { emoji: '🌵', label: 'Cactus', correct: false },
    ],
  },
  {
    speaker: '👧',
    text: 'Nice to meet you!',
    choices: [
      { emoji: '😊', label: 'You too!', correct: true },
      { emoji: '🚲', label: 'Bike', correct: false },
      { emoji: '🧦', label: 'Sock', correct: false },
    ],
  },
  {
    speaker: '🧑',
    text: 'Achoo! 🤧',
    choices: [
      { emoji: '💗', label: 'Bless you!', correct: true },
      { emoji: '🦒', label: 'Giraffe', correct: false },
      { emoji: '🥁', label: 'Drum', correct: false },
    ],
  },
  {
    speaker: '🧒',
    text: 'Please pass the ball.',
    choices: [
      { emoji: '⚽', label: 'Here you go!', correct: true },
      { emoji: '🌝', label: 'Moon', correct: false },
      { emoji: '🧊', label: 'Ice', correct: false },
    ],
  },
  {
    speaker: '👩',
    text: 'Good night!',
    choices: [
      { emoji: '🌙', label: 'Sweet dreams!', correct: true },
      { emoji: '🌅', label: 'Morning', correct: false },
      { emoji: '🍇', label: 'Grapes', correct: false },
    ],
  },
  {
    speaker: '🧑',
    text: 'How old are you?',
    choices: [
      { emoji: '🖐️', label: "I'm five!", correct: true },
      { emoji: '🌈', label: 'Rainbow', correct: false },
      { emoji: '🚀', label: 'Rocket', correct: false },
    ],
  },
  {
    speaker: '🧓',
    text: "I'm sorry!",
    choices: [
      { emoji: '😌', label: "That's okay!", correct: true },
      { emoji: '🐛', label: 'Bug', correct: false },
      { emoji: '🧀', label: 'Cheese', correct: false },
    ],
  },
  {
    speaker: '👧',
    text: 'Do you want to play?',
    choices: [
      { emoji: '🎉', label: 'Yes please!', correct: true },
      { emoji: '🥕', label: 'Carrot', correct: false },
      { emoji: '🪨', label: 'Rock', correct: false },
    ],
  },
  {
    speaker: '🧑',
    text: 'Are you hungry?',
    choices: [
      { emoji: '🍽️', label: "Yes, let's eat!", correct: true },
      { emoji: '📚', label: 'Books', correct: false },
      { emoji: '🚦', label: 'Lights', correct: false },
    ],
  },
  {
    speaker: '👨',
    text: 'Happy birthday!',
    choices: [
      { emoji: '🎂', label: 'Thank you!', correct: true },
      { emoji: '🧦', label: 'Socks', correct: false },
      { emoji: '🌵', label: 'Cactus', correct: false },
    ],
  },
  {
    speaker: '🧒',
    text: 'Can I have a turn?',
    choices: [
      { emoji: '🤝', label: 'Sure, here!', correct: true },
      { emoji: '🐜', label: 'Ant', correct: false },
      { emoji: '🔔', label: 'Bell', correct: false },
    ],
  },
  {
    speaker: '👩',
    text: 'Look, it started to rain!',
    choices: [
      { emoji: '☂️', label: "Let's get an umbrella!", correct: true },
      { emoji: '🍉', label: 'Melon', correct: false },
      { emoji: '🎺', label: 'Trumpet', correct: false },
    ],
  },
  {
    speaker: '🧑',
    text: 'Would you like some water?',
    choices: [
      { emoji: '💧', label: 'Yes, thank you!', correct: true },
      { emoji: '🚲', label: 'Bike', correct: false },
      { emoji: '🪁', label: 'Kite', correct: false },
    ],
  },
  {
    speaker: '🧓',
    text: 'Have a nice day!',
    choices: [
      { emoji: '🌞', label: 'You too!', correct: true },
      { emoji: '🥔', label: 'Potato', correct: false },
      { emoji: '📎', label: 'Clip', correct: false },
    ],
  },
  {
    speaker: '👧',
    text: 'I like your shoes!',
    choices: [
      { emoji: '😄', label: 'Thank you!', correct: true },
      { emoji: '🦖', label: 'Dino', correct: false },
      { emoji: '🧅', label: 'Onion', correct: false },
    ],
  },
  {
    speaker: '🧑',
    text: 'Excuse me, may I pass?',
    choices: [
      { emoji: '🙂', label: 'Of course!', correct: true },
      { emoji: '🍩', label: 'Donut', correct: false },
      { emoji: '🧲', label: 'Magnet', correct: false },
    ],
  },
  {
    speaker: '👨',
    text: 'Welcome!',
    choices: [
      { emoji: '🤗', label: 'Thank you!', correct: true },
      { emoji: '🐌', label: 'Snail', correct: false },
      { emoji: '🕯️', label: 'Candle', correct: false },
    ],
  },
  {
    speaker: '🧒',
    text: 'Do you want to share?',
    choices: [
      { emoji: '🍪', label: 'Yes, thank you!', correct: true },
      { emoji: '🚂', label: 'Train', correct: false },
      { emoji: '🧤', label: 'Gloves', correct: false },
    ],
  },
];
