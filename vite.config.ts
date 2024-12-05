import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    target: 'esnext',
    lib: {
      entry: 'src/main.ts',
      name: 'stellar-resource-uasge',
      fileName: 'main',
    }
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
});
