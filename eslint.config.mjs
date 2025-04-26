// @ts-check
import angular from 'angular-eslint';
import eslint from '@eslint/js';
import json from '@eslint/json';
import perfectionist from 'eslint-plugin-perfectionist';
import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    ignores: ['**/*.d.ts', 'src/libs/**/*.ts', 'src/declarations/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['app', 'hlm'],
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['app', 'hlm'],
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': ['warn'],
      '@angular-eslint/no-input-rename': ['error', { allowedNames: ['class'] }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.component.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      '@angular-eslint/template/prefer-self-closing-tags': ['error'],
      '@angular-eslint/template/prefer-control-flow': ['error'],
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['**/*.d.ts', 'src/libs/**/*.ts', 'src/declarations/**/*.ts'],
    plugins: { perfectionist },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      ...perfectionist.configs['recommended-alphabetical'].rules,
      'perfectionist/sort-enums': 'off',
      'perfectionist/sort-imports': [
        'warn',
        {
          customGroups: {
            type: {
              angular: '^@angular/.+',
              dfinity: '^@dfinity/.+',
              spartan: ['^@spartan-ng/.+', 'clsx', 'class-variance-authority'],
              tauri: '^@tauri-apps/.+',
            },
            value: {
              angular: '^@angular/.+',
              dfinity: '^@dfinity/.+',
              rxjs: ['^rxjs$', '^rxjs/.+', '^ngxtension/.+'],
              spartan: ['^@spartan-ng/.+', 'clsx', 'class-variance-authority'],
              tauri: '^@tauri-apps/.+',
            },
          },
          environment: 'node',
          groups: [
            [
              'angular',
              'dfinity',
              'spartan',
              'tauri',
              'rxjs',
              'type',
              ...['builtin', 'external'],
            ],

            [
              'internal-type',
              'internal',
              ...['parent-type', 'sibling-type', 'index-type'],
              ...['parent', 'sibling', 'index'],
              'object',
              'unknown',
            ],
          ],
          internalPattern: [
            '^~/.*',
            '^@spartan-ng/ui-.+',
            '^@core/.+',
            '^@declarations/.+',
            '^@environments/.+',
          ],
          maxLineLength: undefined,
          newlinesBetween: 'always',
          order: 'asc',
          type: 'alphabetical',
        },
      ],
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-union-types': [
        'error',
        {
          groups: ['named', ['intersection', 'union'], 'unknown', 'nullish'],
          ignoreCase: true,
          order: 'asc',
          partitionByComment: false,
          partitionByNewLine: false,
          type: 'alphabetical',
        },
      ],
    },
  },
  {
    files: ['**/*.json'],
    ignores: ['package-lock.json', 'yarn.lock'],
    language: 'json/json',
    ...json.configs.recommended,
  },
  {
    files: ['**/*.jsonc'],
    language: 'json/jsonc',
    ...json.configs.recommended,
  },
  {
    files: ['**/*.json5'],
    language: 'json/json5',
    ...json.configs.recommended,
  },
  eslintPluginPrettier,
);
