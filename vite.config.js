import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // The site is served from https://sylvainlano.github.io/GravityStar/
  base: '/GravityStar/',
  plugins: [react()],
  build: {
    // three.js alone weighs about 600 kB, more than Vite's default warning limit of 500 kB
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      output: {
        // The libraries (three.js, React...) in a file of their own: it stays the same from one version of the game
        // to the next, so browsers keep it in their cache and returning players only download the game's code again
        codeSplitting: { groups: [{ name: 'vendor', test: /node_modules/ }] },
      },
    },
  },
})
