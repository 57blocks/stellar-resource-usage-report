/* eslint-env node */
export default {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  root: true,
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-require-imports': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      // ignore unused variables that start with an underscore or only have one character
      { argsIgnorePattern: '^_|^.$', varsIgnorePattern: '^_|^.$' },
    ],
    '@typescript-eslint/no-var-requires': 'off',
    'import/newline-after-import': 'error',
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], 'internal'],
        'newlines-between': 'always',
      },
    ],
    'no-empty-pattern': 'off',
    'react/react-in-jsx-scope': 'off',
    'spaced-comment': ['error', 'always'],
  },
  // exclude: ['node_modules', 'build', 'scripts'],
  ignorePatterns: ['node_modules', 'build', 'scripts', 'next-env.d.ts'],
  env: {
    node: true,
  },
  globals: {
    NodeJS: 'readonly',
  },
};
