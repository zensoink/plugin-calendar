import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/main.js'),
      output: {
        format: 'iife',
        entryFileNames: 'calendar.js',
        name: 'zensoCalendar',
      },
    },
  },
})
