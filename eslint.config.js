
// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";

export default [
  {
    ignores: ["node_modules", "dist", "build"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
      prettier,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": "warn",
      "@typescript-eslint/no-unused-vars": ["warn"],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
];
