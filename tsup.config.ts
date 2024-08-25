import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  minify: true,
  clean: true,
  shims: true,
  outDir: 'dist',
})
