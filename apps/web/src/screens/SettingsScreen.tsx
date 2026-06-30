import { Card, CardContent } from '@invana/ui';
import { AppShell, BuddyPanel, JsonForm } from '@kids/ui';
import { NavIcons } from '../components/NavIcons.js';
import { useProgress, type BuddyPosition, type ThemeMode } from '@kids/storage';
import { SETTINGS_FIELDS } from '../settings/schema.js';

const BUDDY_POSITIONS: readonly BuddyPosition[] = ['right', 'left', 'off'];
const THEMES: readonly ThemeMode[] = ['system', 'light', 'dark'];

function toBuddyPosition(value: unknown): BuddyPosition {
  return BUDDY_POSITIONS.includes(value as BuddyPosition) ? (value as BuddyPosition) : 'right';
}

function toTheme(value: unknown): ThemeMode {
  return THEMES.includes(value as ThemeMode) ? (value as ThemeMode) : 'system';
}

export function SettingsScreen(): React.JSX.Element {
  const settings = useProgress((s) => s.settings);
  const setSetting = useProgress((s) => s.setSetting);

  return (
    <AppShell
      header={
        <>
          <h1 className="text-2xl font-extrabold">Settings ⚙️</h1>
          <NavIcons />
        </>
      }
    >
      <div className="mx-auto max-w-md p-6">
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
