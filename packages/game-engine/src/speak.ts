/**
 * Buddy's voice — spoken encouragement via the Web Speech API, the meaning
 * carrier for pre-readers. All calls no-op when speech synthesis is
 * unavailable; callers gate on the user's sound setting. Each utterance cancels
 * the previous one so rapid taps don't pile up a backlog.
 */

const CHEERS = [
  'Great job!',
  'Awesome!',
  'You did it!',
  'Yay!',
  'Super!',
  'Well done!',
  'Brilliant!',
] as const;

const YAYS = ['Yay!', 'Yes!', 'Good!', 'Nice!', 'Woohoo!', 'Great!', 'Bravo!'] as const;

const RETRIES = [
  'Try again. Good luck!',
  'Almost! Good luck!',
  'Keep going, you can do it!',
  'So close! Try again.',
  'Nearly there. Good luck!',
] as const;

function randomOf<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function speak(text: string, pitch: number, rate: number): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1;
    u.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* speech is best-effort */
  }
}

/** A short, snappy "yay" for each correct answer. */
export function speakYay(): void {
  speak(randomOf(YAYS), 1.4, 1.15);
}

/** A bright, upbeat cheer for finishing a round. */
export function speakCheer(): void {
  speak(randomOf(CHEERS), 1.25, 1.0);
}

/** A warm, encouraging "try again". */
export function speakRetry(): void {
  speak(randomOf(RETRIES), 1.15, 0.95);
}

/** Read out a letter as a hint, e.g. "Press A". */
export function speakLetter(letter: string): void {
  speak(`Press ${letter}`, 1.1, 0.95);
}

/** Read out a whole word so a pre-reader knows what to spell, e.g. "Cat". */
export function speakWord(word: string): void {
  speak(word, 1.1, 0.9);
}

/** "Watch!" — the game is taking its turn (e.g. flashing a sequence). */
export function speakWatch(): void {
  speak('Watch!', 1.1, 1.0);
}

/** "Your turn!" — hand control to the player. */
export function speakYourTurn(): void {
  speak('Your turn!', 1.2, 1.05);
}

/** Stop any in-progress speech (e.g. on screen unmount). */
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
