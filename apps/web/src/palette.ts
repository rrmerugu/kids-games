import { SIMON_PAD_COLORS } from '@kids/gamification';
import type { GameSettings } from '@kids/storage';

/** Higher-contrast pad hues for the colourblind palette. */
const COLORBLIND_PADS = [0x1b9e77, 0xd95f02, 0x7570b3, 0xe7298a] as const;

export function padColors(palette: GameSettings['palette']): readonly number[] {
  return palette === 'colorblind' ? COLORBLIND_PADS : SIMON_PAD_COLORS;
}

/** Memory Match card back colour. */
export const CARD_BACK = 0x6366f1;
export const CARD_FACE = 0xffffff;
