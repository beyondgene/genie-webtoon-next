import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import tseslintParser from '@typescript-eslint/parser';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Next.js + TypeScript recommended
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
    },
    rules: {
      // FIX: no-implicit-any -> no-explicit-any
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  {
    ignores: [
      'node_modules/',
      '.next/',
      'migrations/',
      'seeders/',
      // 필요한 경우 여기서 ignore 조정
      'app/',
      'controllers/',
      'lib/',
      'models/',
      // DO NOT ignore source directories (app, controllers, lib, models)
      'app/api/feed/',
    ],
  },
];
