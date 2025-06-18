import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(() => {
  return {
    plugins: [vue()],
    test: {
      environment: 'jsdom',
      globals: true,
    },
    build: {
      target: "ES2022"
    }
  }
});
