import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen.js';
import { LevelMapScreen } from './screens/LevelMapScreen.js';
import { SettingsScreen } from './screens/SettingsScreen.js';
import { ParentDashboard } from './screens/ParentDashboard.js';
import { GameRoute } from './games/GameRoute.js';
import { VersionBadge } from './components/VersionBadge.js';
import { TapRipple } from './components/TapRipple.js';
import { useApplyTheme } from './theme.js';

export function App(): React.JSX.Element {
  useApplyTheme();
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/play/:gameId" element={<LevelMapScreen />} />
        <Route path="/play/:gameId/:level" element={<GameRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TapRipple />
      <VersionBadge />
    </BrowserRouter>
  );
}
