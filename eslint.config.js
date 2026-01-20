import path from 'node:path'
import { fileURLToPath } from 'node:url'

import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url))

export default [
  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,

  {
    files: ['**/*.{js,cjs,mjs,ts,tsx,cts,mts}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },

  {
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },

    rules: {
      'no-console': 'warn',

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^(req|_req|res|_res|next|_next|val|_val)$' },
      ],

      'prefer-destructuring': ['error', { object: true, array: false }],
      'consistent-return': 'off',

      /**
       * Import order (auto-fixable):
       * 1) Side-effect imports (e.g. 'dotenv/config')
       * 2) Node built-ins (node:fs, node:path)
       * 3) External deps (react, express, zod, etc.)
       * 4) Internal aliases (e.g. @shared/*)
       * 5) Relative imports (../ then ./)
       * 6) Type-only imports last
       */
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side-effect imports.
            ['^\\u0000'],
            // Node.js built-ins.
            ['^node:'],
            // Packages.
            ['^@?\\w'],
            // Internal aliases.
            ['^@shared(/.*|$)', '^@server(/.*|$)'],
            // Parent imports.
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Same-folder imports.
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Type imports (TS).
            ['^.+\\u0000$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
]
