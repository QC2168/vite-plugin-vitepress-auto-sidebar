import tseslint from '@typescript-eslint/eslint-plugin';
import eslintParser from "@typescript-eslint/parser"
import js from "@eslint/js";
import love from 'eslint-config-love'
import globals from 'globals'
export default [
  js.configs.recommended,
  {
    languageOptions: {
      parser: eslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
      },
      projectService: {
        defaultProject: true,
      },
      globals: { ...globals.browser, ...globals.node }
    }
  },
  {
    ...love,
    files: ['**/*.js', '**/*.ts'],
  },
  {
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      'no-mixed-operators': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      'complexity': 'off',
      'guard-for-in': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/init-declarations': 'off',
      "semi": "off",
      'no-console': 'off',
      'eqeqeq': 'error',
      'eslint-comments/require-description': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    }
  },
  {
    ignores: ["**/dist/","**/temp/","**/cache/",]
  }
]
