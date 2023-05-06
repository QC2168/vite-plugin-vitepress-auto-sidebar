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
    "project": ["./tsconfig.json"]
  },
  plugins: [
    "@typescript-eslint"
  ],
  rules: {
  }
}
