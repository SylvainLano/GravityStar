import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // The site is served from https://sylvainlano.github.io/GravityStar/
  base: '/GravityStar/',
  plugins: [react()],
})
