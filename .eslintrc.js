module.exports = {
  extends: ['expo', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Add custom rules here as needed
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    '.expo/',
    'dist/',
    'build/',
  ],
};
