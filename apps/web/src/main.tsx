import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import './index.css';

// Note: intentionally NOT wrapped in <StrictMode> — its double effect-invoke
// would init/destroy the pixi canvas twice per mount.
const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');
createRoot(root).render(<App />);
