import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // The site is served from https://sylvainlano.github.io/GravityStar/
  base: '/GravityStar/',
  plugins: [react()],
  // three.js alone weighs about 1 MB, more than Vite's default warning limit of 500 kB
  build: { chunkSizeWarningLimit: 1500 },
})
