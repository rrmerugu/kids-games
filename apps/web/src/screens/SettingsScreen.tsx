import { useNavigate } from 'react-router-dom';
import { BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { Button, Card, CardContent } from '@invana/ui';
import { AppShell, BuddyPanel, JsonForm } from '@kids/ui';
import { ScreenHeader } from '../components/ScreenHeader.js';
import {
  GAME_LENGTH_MAX_SEC,
  GAME_LENGTH_MIN_SEC,
  useProgress,
  type BuddyPosition,
  type ThemeMode,
} from '@kids/storage';
import { SETTINGS_FIELDS } from '../settings/schema.js';

/** Show a round length as a friendly "2 min" / "2½ min" label. */
function formatLength(sec: number): string {
  const half = Math.round((sec / 60) * 2) / 2;
  const whole = Math.floor(half);
  const frac = half - whole > 0 ? '½' : '';
  return `${whole || ''}${frac || (whole ? '' : '0')} min`;
}

const BUDDY_POSITIONS: readonly BuddyPosition[] = ['right', 'left', 'off'];
const THEMES: readonly ThemeMode[] = ['system', 'light', 'dark'];

function toBuddyPosition(value: unknown): BuddyPosition {
  return BUDDY_POSITIONS.includes(value as BuddyPosition) ? (value as BuddyPosition) : 'right';
}

function toTheme(value: unknown): ThemeMode {
  return THEMES.includes(value as ThemeMode) ? (value as ThemeMode) : 'system';
}

export function SettingsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const settings = useProgress((s) => s.settings);
  const setSetting = useProgress((s) => s.setSetting);

  return (
    <AppShell
      header={
        <ScreenHeader
          title={
            <span className="inline-flex items-center gap-2">
              Settings
              <SettingsIcon className="h-6 w-6 shrink-0" strokeWidth={2.5} aria-hidden />
            </span>
          }
        />
      }
    >
      <div className="mx-auto max-w-md p-6">
        <Card className="mb-6 rounded-3xl">
          <CardContent className="p-6">
            <label htmlFor="game-length" className="flex items-baseline justify-between">
              <span className="text-lg font-semibold">Game length ⏱</span>
              <span className="text-xl font-extrabold text-indigo-500 dark:text-indigo-300">
                {formatLength(settings.gameLengthSec)}
              </span>
            </label>
            <input
              id="game-length"
              type="range"
              min={GAME_LENGTH_MIN_SEC}
              max={GAME_LENGTH_MAX_SEC}
              step={15}
              value={settings.gameLengthSec}
              onChange={(e) => setSetting('gameLengthSec', Number(e.target.value))}
              className="mt-3 h-3 w-full cursor-pointer appearance-none rounded-full bg-indigo-100 accent-indigo-500 dark:bg-slate-700"
            />
            <div className="mt-1 flex justify-between text-xs font-semibold text-slate-400">
              <span>Shorter 🐢</span>
              <span>Longer 🚀</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <JsonForm
              fields={SETTINGS_FIELDS}
              value={{ ...settings }}
              onChange={(v) => {
                setSetting('sound', Boolean(v.sound));
                setSetting('reducedMotion', Boolean(v.reducedMotion));
                setSetting('palette', v.palette === 'colorblind' ? 'colorblind' : 'classic');
                setSetting('buddyPosition', toBuddyPosition(v.buddyPosition));
                setSetting('theme', toTheme(v.theme));
              }}
            />
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="mt-6 h-14 w-full justify-center gap-2 rounded-2xl text-lg font-bold"
          onClick={() => navigate('/parent')}
        >
          <BarChart3 className="h-5 w-5" aria-hidden /> Parent Dashboard 📊
        </Button>

        {settings.buddyPosition !== 'off' && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Say hi to Buddy 👋
            </span>
            <BuddyPanel className="h-56 w-full rounded-3xl" reducedMotion={settings.reducedMotion} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
