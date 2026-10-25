import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettier,
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Preserve the existing project's policy while updating the lint runner.
      'react-hooks/exhaustive-deps': 'off',
      '@next/next/no-img-element': 'off',
      'semi': ['error', 'always'],
      'import/order': ['warn', {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'object', 'type', 'index'],
        'newlines-between': 'always',
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: { order: 'asc', caseInsensitive: true },
        pathGroups: [
          { pattern: '@/components/', group: 'internal', position: 'before' },
          { pattern: '@/types/**', group: 'internal', position: 'after' },
          { pattern: '@/**', group: 'internal', position: 'after' },
        ],
      }],
    },
  },
  globalIgnores(['.next/**', 'node_modules/**', 'public/**', 'playwright-report/**', 'test-results/**']),
]);
