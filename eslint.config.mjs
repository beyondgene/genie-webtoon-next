import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: require.resolve("@typescript-eslint/parser"),
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
        project: "./tsconfig.json", // tsconfig 경로 명시
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      "@typescript-eslint/no-implicit-any": "error",
    },
  },

  {
    ignores: [
      "node_modules/",
      ".next/",
      "migrations/",
      "seeders/",
      "app/",
      "controllers/",
      "lib/",
      "models/",
      "app/api/feed/",
    ],
  },
];
