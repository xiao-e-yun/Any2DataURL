import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '',
  css: {
    preprocessorOptions: {
      scss: { additionalData: `@use "./assets/style/color";@import "./assets/style/vars.scss";` },
    },
  },
})
