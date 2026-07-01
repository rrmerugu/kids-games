import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { IconButton } from './IconButton.js';

/**
 * The Home shortcut as a standalone icon button. In a game HUD it lives at the
 * far left (the starting item, beside the game name); elsewhere it rides along in
 * <NavIcons/>. Kept separate so the game HUD can place it on the left instead.
 */
export function HomeButton(): React.JSX.Element {
  const navigate = useNavigate();
  return <IconButton icon={Home} label="Home" tone="emerald" onClick={() => navigate('/')} />;
}
