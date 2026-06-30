import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '@invana/ui';
import { AppShell, JsonForm } from '@kids/ui';
import { useProgress } from '@kids/storage';
import { SETTINGS_FIELDS } from '../settings/schema.js';

export function SettingsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const settings = useProgress((s) => s.settings);
  const setSetting = useProgress((s) => s.setSetting);

  return (
    <AppShell
      header={
        <>
          <Button
            variant="secondary"
            size="lg"
            className="h-12 w-12 rounded-full p-0 text-2xl"
            aria-label="Back"
            onClick={() => navigate('/')}
          >
            ⬅️
          </Button>
          <h1 className="text-2xl font-extrabold">Settings ⚙️</h1>
          <span className="w-12" />
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
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
