import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config.
// During local development, requests to "/api/*" are proxied to ESPN's public
// Premier League feed. This keeps ESPN's host server-side and avoids browser
// CORS during `npm run dev`. In production (Vercel), the same paths are handled
// by the serverless functions in /api — so app code is identical in both.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/scoreboard': {
        target: 'https://site.api.espn.com',
        changeOrigin: true,
        // /api/scoreboard?dates=... -> ESPN's eng.1 scoreboard
        rewrite: (path) =>
          path.replace(/^\/api\/scoreboard/, '/apis/site/v2/sports/soccer/eng.1/scoreboard'),
      },
      '/api/standings': {
        target: 'https://site.api.espn.com',
        changeOrigin: true,
        // /api/standings?season=... -> ESPN's eng.1 standings (the real PL table)
        rewrite: (path) =>
          path.replace(/^\/api\/standings/, '/apis/v2/sports/soccer/eng.1/standings'),
      },
    },
  },
});
