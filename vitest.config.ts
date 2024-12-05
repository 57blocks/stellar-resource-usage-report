import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'Stellar Resources Usage',
    include: ['test/**/*.ts', 'test/**/*.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
