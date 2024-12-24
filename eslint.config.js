const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');
const eslintPluginJsonc = require('eslint-plugin-jsonc');
const jsoncParser = require('jsonc-eslint-parser');
const perfectionist = require('eslint-plugin-perfectionist');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    ignores: ['**/*.d.ts', 'src/libs/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      perfectionist.configs['recommended-alphabetical'],
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
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@angular-eslint/no-input-rename': ['error', { allowedNames: ['class'] }],
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          matcher: 'minimatch',
          internalPattern: ['~/**', '@spartan-ng/ui-*', '@core/**', '@declarations/**', '@environments/*'],
          newlinesBetween: 'never',
          maxLineLength: undefined,
          groups: [
            'angular',
            'dfinity',
            'spartan',
            'tauri',
            'rxjs',
            'type',
            ['builtin', 'external'],
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          customGroups: {
            type: {
              angular: '@angular/**',
              dfinity: '@dfinity/**',
              tauri: '@tauri-apps/**',
              spartan: ['@spartan-ng/*', 'clsx', 'class-variance-authority'],
            },
            value: {
              angular: '@angular/**',
              dfinity: '@dfinity/**',
              tauri: '@tauri-apps/**',
              rxjs: ['rxjs', 'rxjs/*', 'ngxtension/*'],
              spartan: ['@spartan-ng/*', 'clsx', 'class-variance-authority'],
            },
          },
          environment: 'node',
        },
      ],
      'perfectionist/sort-enums': 'off',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-union-types': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          partitionByNewLine: false,
          partitionByComment: false,
          matcher: 'minimatch',
          groups: ['named', ['intersection', 'union'], 'unknown', 'nullish'],
        },
      ],
    },
  },
  {
    files: ['**/*.component.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-self-closing-tags': ['error'],
      '@angular-eslint/template/prefer-control-flow': ['error'],
    },
  },
  {
    files: ['*.json', '*.json5'],
    languageOptions: {
      parser: jsoncParser,
    },
    extends: [...eslintPluginJsonc.configs['flat/recommended-with-json']],
    rules: {},
  },
  eslintConfigPrettier,
);
