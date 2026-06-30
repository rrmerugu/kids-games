import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen.js';
import { LevelMapScreen } from './screens/LevelMapScreen.js';
import { SettingsScreen } from './screens/SettingsScreen.js';
import { GameRoute } from './games/GameRoute.js';

export function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/play/:gameId" element={<LevelMapScreen />} />
        <Route path="/play/:gameId/:level" element={<GameRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
