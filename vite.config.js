import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [vue(), react()],
  build: {
    lib: {
      entry: {
        'court-canvas': resolve(__dirname, 'src/index.js'),
        'react': resolve(__dirname, 'src/react/CourtCanvasReact.jsx'),
        'vue': resolve(__dirname, 'src/vue/CourtCanvasVue.vue'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'react', 'react-dom', 'konva', 'sweetalert2'],
      output: {
        globals: {
          vue: 'Vue',
          react: 'React',
          'react-dom': 'ReactDOM',
          konva: 'Konva',
          'sweetalert2': 'Swal',
        },
      },
    },
  },
});
