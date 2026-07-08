// Demo build: bundles the ENTIRE app into one self-contained HTML file that
// opens by double-clicking — no server, no terminal. Live data can't be
// fetched that way, so the generated sample season kicks in automatically.
//   npm run build:demo  ->  TFG-Sweeps-Demo.html (project root)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
  },
});
