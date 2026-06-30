import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves this project site under /<repo>/, so production assets must
// be rooted there; dev/preview stays at root. BrowserRouter reads this via
// import.meta.env.BASE_URL so deep links resolve under the same base.
const REPO_BASE = '/kids-games/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? REPO_BASE : '/',
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
}));
