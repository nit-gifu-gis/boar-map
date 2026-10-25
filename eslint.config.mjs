import { defineConfig, globalIgnores } from 'eslint/config';
import { fixupConfigRules } from '@eslint/compat';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

// Next's plugins still use APIs removed in ESLint 10. Apply the official compatibility shim.
export default defineConfig(fixupConfigRules([
  ...nextVitals,
  ...nextTypescript,
  prettier,
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Preserve the existing project's policy while updating the lint runner.
      'react-hooks/exhaustive-deps': 'off',
      // Compiler adoption is separate from this framework migration. Keep its new
      // diagnostics visible without making the existing imperative UI a build failure.
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
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
]));
