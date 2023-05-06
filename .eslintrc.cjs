module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended','standard-with-typescript'],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ["./tsconfig.json"]
  },
  plugins: [
    "@typescript-eslint"
  ],
  rules: {
    '@typescript-eslint/prefer-nullish-coalescing':'off',
    'no-mixed-operators':'off',
    '@typescript-eslint/no-misused-promises':'off',
    '@typescript-eslint/strict-boolean-expressions':'off',
    "semi": "off",
    "@typescript-eslint/semi": ['error','always']
  }
}
