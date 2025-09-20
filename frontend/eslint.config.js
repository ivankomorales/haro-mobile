import { defineConfig } from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import pluginReact from 'eslint-plugin-react'
import globals from 'globals'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      react: pluginReact,
      import: importPlugin,
    },
    rules: {
      // React
      'react/react-in-jsx-scope': 'off', // React 17+ doesn’t need `import React`

      // Import organization
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node built-ins like fs, path
            'external', // npm modules
            'internal', // alias paths like src/*
            ['parent', 'sibling', 'index'], // relative imports
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  pluginReact.configs.flat.recommended,
])
