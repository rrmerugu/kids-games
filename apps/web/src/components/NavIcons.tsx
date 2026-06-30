import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Moon, Settings, Sun, Volume2, VolumeX } from 'lucide-react';
import { IconButton } from './IconButton.js';
import { useProgress } from '@kids/storage';
import { useResolvedTheme } from '../theme.js';

/**
 * The global section switcher: a row of soft pastel Lucide-icon buttons (Home,
 * sound, theme, settings) shown in every screen's header / game HUD so a kid or
 * parent can jump to any section from anywhere. Self-contained — reads and writes
 * settings directly and navigates on its own. (The parent dashboard now lives
 * behind Settings; per-game analytics live in the game HUD.)
 */
export function NavIcons(): React.JSX.Element {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const sound = useProgress((s) => s.settings.sound);
  const setSetting = useProgress((s) => s.setSetting);
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="flex gap-2">
      {pathname !== '/' && (
        <IconButton icon={Home} label="Home" tone="emerald" onClick={() => navigate('/')} />
      )}
      <IconButton
        icon={sound ? Volume2 : VolumeX}
        label="Toggle sound"
        tone="sky"
        onClick={() => setSetting('sound', !sound)}
      />
      <IconButton
        icon={isDark ? Sun : Moon}
        label="Toggle theme"
        tone="amber"
        onClick={() => setSetting('theme', isDark ? 'light' : 'dark')}
      />
      <IconButton
        icon={Settings}
        label="Settings"
        tone="slate"
        onClick={() => navigate('/settings')}
      />
    </div>
  );
}
