import { defineConfig } from 'vite'

// Use root base so Vite serves files from '/' during dev and build
export default defineConfig({ base: '/', build: { outDir: 'dist' } })
