import stylistic from '@stylistic/eslint-plugin'
import pluginTs from '@typescript-eslint/eslint-plugin'
import parserTs from '@typescript-eslint/parser'
import pluginImportSort from 'eslint-plugin-simple-import-sort'

/** @type {import('eslint').Linter.Config[]} */
export default [
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: false,
    braceStyle: '1tbs',
  }),
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': pluginTs,
      'import-sort': pluginImportSort,
    },
    rules: {
      ...pluginTs.configs['eslint-recommended'].overrides[0].rules,
      ...pluginTs.configs['recommended'].rules,
      'import-sort/exports': 'error',
      'import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^node', '@?\\w'],
            ['^\\./.*', '^~/.*', '^@/.*'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ],
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'off',
    },
    ignores: ['node_modules'],
  },
]
