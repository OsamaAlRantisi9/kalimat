import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5180 },
  // Vitest reads this block: our tests are plain logic, no browser needed.
  test: { environment: 'node' },
});
