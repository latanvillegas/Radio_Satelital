import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@components': path.resolve(rootDir, 'components'),
      '@hooks': path.resolve(rootDir, 'hooks'),
      '@lib': path.resolve(rootDir, 'lib'),
      '@types': path.resolve(rootDir, 'types'),
      '@': rootDir,
    },
  },
  test: {
    environment: 'node',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out'],
  },
})
