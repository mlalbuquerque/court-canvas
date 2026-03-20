import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [vue(), react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'CourtCanvas',
      fileName: 'court-canvas',
    },
    rollupOptions: {
      external: ['vue', 'react'],
      output: {
        globals: {
          vue: 'Vue',
          react: 'React',
        },
      },
    },
  },
});
