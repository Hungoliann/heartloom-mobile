// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "server/*", "web/*", "supabase/functions/*"],
  },
  {
    rules: {
      // react/no-unescaped-entities is a web/HTML concern — React Native Text
      // components render apostrophes and quotes correctly without escaping.
      "react/no-unescaped-entities": "off",
    },
  },
]);
