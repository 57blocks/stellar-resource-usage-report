import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import _import from 'eslint-plugin-import';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  { ignores: ['node_modules/*', 'dist/*', 'test-contract'] },
  {
    files: ['**/*.ts', '**/*.js'],
    rules: { 'no-undef': 'off' },
  },
  {
    ignores: ['**/node_modules', '**/build', '**/scripts', 'bun.build.js', 'test-contract'],
  },
  ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      import: _import,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.browser,
        ...globals.jest,
        NodeJS: 'readonly',
        React: 'readonly',
        JSX: 'readonly',
      },

      parser: tsParser,
    },

    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'warn',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_|^.$',
          varsIgnorePattern: '^_|^.$',
        },
      ],
      '@typescript-eslint/no-require-imports': 'warn',
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal'],
          'newlines-between': 'always',
        },
      ],

      'import/newline-after-import': 'error',
      'no-empty-pattern': 'off',
      'no-undef': 'error',
      'spaced-comment': ['error', 'always'],
    },
  },
  {
    files: ['**/*.ts'],

    rules: {
      'no-undef': 'off',
    },
  },
];
