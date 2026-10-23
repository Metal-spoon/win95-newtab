import globals from 'globals'
import neostandard from 'neostandard'

export default [
  {
    ignores: ['dist/**', 'Release Archive/**', 'src/js/lib/**', 'src/css/**']
  },
  ...neostandard({ noJsx: true }),
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        ...globals.jquery
      }
    }
  },
  {
    files: ['gulpfile.mjs', 'eslint.config.mjs', 'vitest.config.mjs'],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
        ...globals.jquery
      }
    }
  }
]
