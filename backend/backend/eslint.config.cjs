const reactPlugin = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')

module.exports = [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      // keep ESLint recommended rules; integrate with Prettier via plugin
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    }
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'frontend/node_modules/**', 'backend/node_modules/**', '*.min.js']
  }
]
