import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import boundaries from 'eslint-plugin-boundaries';

const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

const allowedBelow = (layer) => layers.slice(layers.indexOf(layer) + 1);

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      boundaries,
    },
    settings: {
      'boundaries/elements': layers.map((layer) => ({
        type: layer,
        pattern: `src/${layer}/*`,
      })),
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: layers.map((layer) => ({
            from: layer,
            allow: allowedBelow(layer),
          })),
        },
      ],
    },
  },
];
