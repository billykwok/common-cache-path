const path = require('path');

module.exports = {
  env: { commonjs: true, amd: true, es6: true, node: true },
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
    ecmaFeatures: { impliedStrict: true },
    project: './tsconfig.json',
  },
  settings: {
    'import/extensions': ['.js', '.jsx', '.json'],
    'import/resolver': {
      node: {
        paths: [path.resolve(__dirname, 'node_modules')],
        moduleDirectory: ['node_modules'],
      },
    },
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended', 'prettier'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      settings: {
        'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
        'import/extensions': ['.ts', '.tsx'],
      },
      plugins: ['@typescript-eslint', 'import', 'prettier'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:prettier/recommended',
        'prettier',
      ],
    },
  ],
};
