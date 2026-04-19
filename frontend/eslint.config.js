// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const noHardcodedTwColors = require('./eslint-rules/no-hardcoded-tw-colors');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    plugins: {
      local: { rules: { 'no-hardcoded-tw-colors': noHardcodedTwColors } },
    },
    rules: {
      'local/no-hardcoded-tw-colors': 'warn',
    },
  },
]);
