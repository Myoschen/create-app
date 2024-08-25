import { cp } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  minify: true,
  clean: true,
  shims: true,
  outDir: 'dist',
  onSuccess: async () => {
    await cp(
      path.join(path.dirname(fileURLToPath(import.meta.url)), 'templates'),
      path.join('dist', 'templates'),
      { recursive: true },
    )
  },
})
