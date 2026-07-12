import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '.astro/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['src/**/*.{js,ts,astro}'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'process',
          message: 'Use import.meta.env in Astro source; process is not browser-safe.',
        },
      ],
    },
  },
];
