import stylistic from '@stylistic/eslint-plugin'
import pluginTs from '@typescript-eslint/eslint-plugin'
import parserTs from '@typescript-eslint/parser'

/** @type {import('eslint').Linter.Config[]} */
export default [
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: false,
  }),
  {
    files: ['src/**/*.{js,ts}'],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': pluginTs,
    },
    rules: {
      ...pluginTs.configs['eslint-recommended'].overrides[0].rules,
      ...pluginTs.configs['recommended'].rules,
    },
  },
]
