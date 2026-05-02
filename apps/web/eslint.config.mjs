import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import importPlugin from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...nextVitals,

  {
    plugins: {
      import: importPlugin,
      unicorn,
      "unused-imports": unusedImports,
    },

    rules: {
      /**
       * Code Quality
       */
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",

      /**
       * Imports
       */
      "import/no-duplicates": "error",
      "import/newline-after-import": "error",

      /**
       * Unused Imports / Variables
       */
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      /**
       * Best Practices
       */
      "object-shorthand": ["error", "always"],
      "prefer-template": "error",
      "template-curly-spacing": ["error", "never"],
      "dot-notation": "error",

      /**
       * Modern JS / TS Friendly
       */
      "arrow-body-style": ["error", "as-needed"],
      "prefer-arrow-callback": "error",

      /**
       * Unicorn (cleaner code)
       */
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
    },
  },

  // Override default ignores of eslint-config-next
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "coverage/**",
    "dist/**",
  ]),
]);

export default eslintConfig;
