module.exports = {
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
  env: { browser: true, es2021: true, node: true },
  settings: { react: { version: "detect" } },
  rules: { "react/prop-types": "off", "react/react-in-jsx-scope": "off", "no-unused-vars": "warn" }
};
